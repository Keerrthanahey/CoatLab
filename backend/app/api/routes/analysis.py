from __future__ import annotations

import io
import math
from typing import Any

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File

from app.schemas.ml import MorphologyResult, FigureExtractionResult

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/morphology", response_model=MorphologyResult)
async def analyze_morphology(file: UploadFile = File(...)) -> MorphologyResult:
    from app.core.tracing import log_analysis, log_error
    file_name = file.filename or "unknown"
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        log_error("morphology", "Could not decode image", context={"file": file_name})
    log_analysis("Morphology", {"file": file_name, "dimensions": f"{w}x{h}"}, {"pore_count": len(diameters), "porosity": round(porosity, 2)})
    return MorphologyResult(
            image_width=0, image_height=0, pore_count=0,
            porosity_percent=0, avg_pore_size=0, max_pore_size=0,
            min_pore_size=0, distribution=[], classification="unknown",
        )

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    areas = [cv2.contourArea(c) for c in contours if cv2.contourArea(c) > 10]
    diameters = [2 * math.sqrt(a / math.pi) for a in areas]

    total_image_area = w * h
    pore_area = sum(areas)
    porosity = (pore_area / total_image_area * 100) if total_image_area > 0 else 0

    classification = "dense"
    if porosity > 15:
        classification = "highly_porous"
    elif porosity > 5:
        classification = "porous"

    bins = [0, 5, 10, 20, 30, 50, 100, 200]
    dist = [{"bin": f"{bins[i]}-{bins[i+1]}", "count": 0} for i in range(len(bins) - 1)]
    for d in diameters:
        for i in range(len(bins) - 1):
            if bins[i] <= d < bins[i + 1]:
                dist[i]["count"] += 1
                break

    return MorphologyResult(
        image_width=w,
        image_height=h,
        pore_count=len(diameters),
        porosity_percent=round(porosity, 2),
        avg_pore_size=round(float(np.mean(diameters)), 2) if diameters else 0,
        max_pore_size=round(float(max(diameters)), 2) if diameters else 0,
        min_pore_size=round(float(min(diameters)), 2) if diameters else 0,
        distribution=dist,
        classification=classification,
        demo=True,
    )


@router.post("/figure", response_model=FigureExtractionResult)
async def analyze_figure(file: UploadFile = File(...)) -> FigureExtractionResult:
    from app.core.tracing import log_analysis, log_error
    file_name = file.filename or "unknown"
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        log_error("figure", "Could not decode image", context={"file": file_name})
    log_analysis("Figure", {"file": file_name}, {"axes_detected": axes_detected, "data_points": len(data_points), "confidence": confidence})
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
        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, 1.2, 30, param1=100, param2=30, minRadius=3, maxRadius=15)
        if circles is not None:
            for c in circles[0]:
                data_points.append({"x": round(float(c[0]), 1), "y": round(float(c[1]), 1)})

    confidence = 0.0
    if axes_detected:
        confidence += 0.4
    if data_points:
        confidence += min(0.4, len(data_points) * 0.05)
    confidence = round(min(confidence, 0.85), 2)

    return FigureExtractionResult(
        axes_detected=axes_detected,
        data_points=data_points[:50],
        x_label="x (detected)" if axes_detected else None,
        y_label="y (detected)" if axes_detected else None,
        confidence=confidence,
        notes="Best-effort extraction using edge/line/circle detection. Values are approximate pixel coordinates, not calibrated data.",
        demo=True,
    )
