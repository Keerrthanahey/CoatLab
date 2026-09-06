from __future__ import annotations

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File

from app.schemas.ml import FigureExtractionResult
from app.core.tracing import log_analysis, log_error

router = APIRouter(prefix="/api/figure", tags=["figure"])


@router.post("/analyze", response_model=FigureExtractionResult)
async def figure_analyze(file: UploadFile = File(...)) -> FigureExtractionResult:
    """Extract data from a scientific figure.

    Detects axes, data points via edge/line/circle detection, and attempts
    lightweight axis-tier label detection. Values are approximate pixel
    coordinates, not calibrated data.
    """
    file_name = file.filename or "unknown"
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        log_error("figure", "Could not decode image", context={"file": file_name})
        return FigureExtractionResult(
            axes_detected=False, data_points=[], confidence=0,
            notes="Could not decode image.",
        )

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 80, minLineLength=50, maxLineGap=10)

    axes_detected = lines is not None and len(lines) >= 2

    data_points: list[dict] = []
    if axes_detected:
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT, 1.2, 30,
            param1=100, param2=30, minRadius=3, maxRadius=15,
        )
        if circles is not None:
            for c in circles[0]:
                data_points.append({"x": round(float(c[0]), 1), "y": round(float(c[1]), 1)})

    confidence = 0.0
    if axes_detected:
        confidence += 0.4
    if data_points:
        confidence += min(0.4, len(data_points) * 0.05)
    confidence = round(min(confidence, 0.85), 2)

    # Approximate axis-tier labels using row/column pixel intensity profiles.
    x_label, y_label = _detect_axis_labels(gray), None
    if x_label is None and axes_detected:
        x_label = "x (detected)"

    result = FigureExtractionResult(
        axes_detected=axes_detected,
        data_points=data_points[:50],
        approximate_values=[{"x_px": p["x"], "y_px": p["y"]} for p in data_points[:50]],
        x_label=x_label,
        y_label=y_label,
        confidence=confidence,
        notes=(
            "Best-effort extraction using edge/line/circle detection. "
            "Values are approximate pixel coordinates. Calibrate axes "
            "against known tick labels to recover physical values."
        ),
        demo=True,
    )

    log_analysis(
        "Figure",
        {"file": file_name},
        {"axes_detected": axes_detected, "data_points": len(data_points), "confidence": confidence},
    )

    return result


def _detect_axis_labels(gray: np.ndarray) -> str | None:
    """Heuristic axis-tier label detection.

    Returns a best-effort label string drawn from a small vocabulary based
    on detected structure. This is explicitly APPROXIMATE and not OCR.
    """
    h, w = gray.shape
    try:
        col_profile = gray.mean(axis=0)
        row_profile = gray.mean(axis=1)

        # Left margin darkness (y-axis region) and bottom margin (x-axis region)
        left_region = float(col_profile[: int(w * 0.1)].mean())
        right_region = float(col_profile[-int(w * 0.1):].mean()) if w > 10 else 0.0
        bottom_region = float(row_profile[-int(h * 0.15):].mean()) if h > 10 else 0.0

        labels = []
        if left_region < right_region:
            labels.append("y")
        if bottom_region > left_region:
            labels.append("x")

        if labels:
            return " & ".join(labels)
    except Exception:
        pass
    return "x (detected)"
