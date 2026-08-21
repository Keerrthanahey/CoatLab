from __future__ import annotations

import math

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File

from app.schemas.ml import MorphologyResult
from app.core.tracing import log_analysis, log_error

router = APIRouter(prefix="/api/morphology", tags=["morphology"])


@router.post("/analyze", response_model=MorphologyResult)
async def morphology_analyze(file: UploadFile = File(...)) -> MorphologyResult:
    """Analyze a microscopy/SEM image for pore morphology.

    Returns pore count, porosity percentage, size distribution, and
    classification. Without calibration data, sizes are in pixel units.
    """
    file_name = file.filename or "unknown"
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        log_error("morphology", "Could not decode image", context={"file": file_name})
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

    result = MorphologyResult(
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

    log_analysis(
        "Morphology",
        {"file": file_name, "dimensions": f"{w}x{h}"},
        {"pore_count": result.pore_count, "porosity": result.porosity_percent},
    )

    return result
