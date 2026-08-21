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

    Detects axes, data points via edge/line/circle detection. Values are
    approximate pixel coordinates, not calibrated data.
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

    result = FigureExtractionResult(
        axes_detected=axes_detected,
        data_points=data_points[:50],
        x_label="x (detected)" if axes_detected else None,
        y_label="y (detected)" if axes_detected else None,
        confidence=confidence,
        notes=(
            "Best-effort extraction using edge/line/circle detection. "
            "Values are approximate pixel coordinates, not calibrated data."
        ),
        demo=True,
    )

    log_analysis(
        "Figure",
        {"file": file_name},
        {"axes_detected": axes_detected, "data_points": len(data_points), "confidence": confidence},
    )

    return result
