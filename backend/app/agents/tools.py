"""LangChain tools for CoatLab — wrap ML and analysis functions.

IMPORTANT: These tools call the actual Python ML/OpenCV functions directly.
LangChain is used only for orchestration and natural-language interaction,
NOT for numerical prediction.
"""

from __future__ import annotations

import json
import math
from typing import Any

import cv2
import numpy as np
from langchain_core.tools import tool


@tool
def predict_coating(
    substrate_material: str = "Mg",
    coating_material: str = "Al2O3",
    reinforcement: str = "none",
    reinforcement_percentage: float = 0.0,
    particle_size: float = 50.0,
    coating_method: str = "PEO",
    voltage: float = 200.0,
    current: float = 5.0,
    temperature: float = 25.0,
    pressure: float = 1.0,
    spray_distance: float = 100.0,
    deposition_time: float = 10.0,
    speed: float = 50.0,
    num_passes: int = 1,
    heat_treatment_temp: float = 0.0,
    heat_treatment_time: float = 0.0,
    cooling_method: str = "air",
    surface_roughness: float = 5.0,
    surface_preparation: str = "ground",
    surface_hardness: float = 80.0,
) -> str:
    """Predict coating performance (corrosion, wear, thickness, porosity, pore size)
    for a given set of process parameters using the trained ML models.

    Use this when the user asks about predicting coating properties or
    wants to know what performance to expect for specific process conditions.
    """
    params = {
        "substrate_material": substrate_material,
        "coating_material": coating_material,
        "reinforcement": reinforcement,
        "reinforcement_percentage": reinforcement_percentage,
        "particle_size": particle_size,
        "coating_method": coating_method,
        "voltage": voltage,
        "current": current,
        "temperature": temperature,
        "pressure": pressure,
        "spray_distance": spray_distance,
        "deposition_time": deposition_time,
        "speed": speed,
        "num_passes": num_passes,
        "heat_treatment_temp": heat_treatment_temp,
        "heat_treatment_time": heat_treatment_time,
        "cooling_method": cooling_method,
        "surface_roughness": surface_roughness,
        "surface_preparation": surface_preparation,
        "surface_hardness": surface_hardness,
    }

    try:
        from app.ml.predict import predict_single
        result = predict_single(params)
        return json.dumps(result, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "demo": True})


@tool
def optimize_coating(
    coating_materials: str = "Al2O3,SiO2",
    temperature_values: str = "200,300,400",
    voltage_values: str = "100,200,300",
    current_values: str = "3,5,8",
    weights_json: str = '{"corrosion_resistance":0.30,"wear_resistance":0.25,"corrosion_rate":0.20,"porosity":0.15,"coating_thickness":0.05,"pore_size":0.05}',
) -> str:
    """Find the best coating combinations by running multi-objective optimization.

    Generates candidate parameter combinations from the given ranges, runs
    them through the ML models, and ranks them by a weighted score.

    Args:
        coating_materials: Comma-separated coating materials (e.g. "Al2O3,SiO2")
        temperature_values: Comma-separated temperature values in °C
        voltage_values: Comma-separated voltage values in V
        current_values: Comma-separated current values in A
        weights_json: JSON string of objective weights (must sum to 1.0)
    """
    try:
        materials = [m.strip() for m in coating_materials.split(",") if m.strip()]
        temps = [float(t.strip()) for t in temperature_values.split(",") if t.strip()]
        volts = [float(v.strip()) for v in voltage_values.split(",") if v.strip()]
        amps = [float(a.strip()) for a in current_values.split(",") if a.strip()]
        weights = json.loads(weights_json) if weights_json else {}

        ranges = {
            "coating_material": materials,
            "temperature": temps,
            "voltage": volts,
            "current": amps,
        }

        from app.ml.optimize import generate_combinations, optimize
        combos = generate_combinations(ranges)
        if len(combos) > 1000:
            combos = combos[:1000]
        ranked = optimize(combos, weights)

        top = ranked[:10] if ranked else []
        summary = {
            "total_evaluated": len(ranked),
            "top_combinations": [
                {
                    "rank": r["rank"],
                    "coating_material": r.get("coating_material", ""),
                    "temperature": r.get("temperature", 0),
                    "voltage": r.get("voltage", 0),
                    "current": r.get("current", 0),
                    "corrosion_resistance": r.get("corrosion_resistance", 0),
                    "wear_resistance": r.get("wear_resistance", 0),
                    "corrosion_rate": r.get("corrosion_rate", 0),
                    "porosity": r.get("porosity", 0),
                    "coating_thickness": r.get("coating_thickness", 0),
                    "pore_size": r.get("pore_size", 0),
                    "overall_score": r.get("overall_score", 0),
                }
                for r in top
            ],
            "demo": True,
        }
        return json.dumps(summary, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "demo": True})


@tool
def analyze_morphology(image_bytes_b64: str = "", file_name: str = "image.png") -> str:
    """Analyze a microscopy/SEM image for pore morphology.

    Detects pores, calculates porosity percentage, pore count, size
    distribution, and classifies the coating as dense/porous/highly_porous.

    NOTE: Without image calibration data, sizes are in pixel units.
    """
    try:
        import base64
        img_bytes = base64.b64decode(image_bytes_b64) if image_bytes_b64 else b""
        if not img_bytes:
            return json.dumps({"error": "No image data provided", "demo": True})

        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return json.dumps({"error": "Could not decode image", "demo": True})

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        areas = [cv2.contourArea(c) for c in contours if cv2.contourArea(c) > 10]
        diameters = [2 * math.sqrt(a / math.pi) for a in areas]

        total_area = w * h
        pore_area = sum(areas)
        porosity = (pore_area / total_area * 100) if total_area > 0 else 0

        classification = "dense"
        if porosity > 15:
            classification = "highly_porous"
        elif porosity > 5:
            classification = "porous"

        return json.dumps({
            "image_size": f"{w}x{h}",
            "pore_count": len(diameters),
            "porosity_percent": round(porosity, 2),
            "avg_pore_size_px": round(float(np.mean(diameters)), 2) if diameters else 0,
            "max_pore_size_px": round(float(max(diameters)), 2) if diameters else 0,
            "classification": classification,
            "note": "Sizes in pixel units. Provide calibration data for physical units.",
            "demo": True,
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "demo": True})


@tool
def extract_figure_data(image_bytes_b64: str = "", file_name: str = "figure.png") -> str:
    """Extract data from a scientific figure or graph.

    Detects axes, data points (via circle detection), and provides
    approximate pixel coordinates.

    NOTE: Extracted values are approximate pixel coordinates, not calibrated data.
    """
    try:
        import base64
        img_bytes = base64.b64decode(image_bytes_b64) if image_bytes_b64 else b""
        if not img_bytes:
            return json.dumps({"error": "No image data provided", "demo": True})

        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return json.dumps({"error": "Could not decode image", "demo": True})

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 80, minLineLength=50, maxLineGap=10)

        axes_detected = lines is not None and len(lines) >= 2

        data_points = []
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

        return json.dumps({
            "axes_detected": axes_detected,
            "data_points": data_points[:50],
            "total_data_points": len(data_points),
            "confidence": confidence,
            "note": "Approximate pixel coordinates only. Calibrate axes for real values.",
            "demo": True,
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "demo": True})
