from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter

from app.schemas.types import (
    PredictionInput,
    PredictionResponse,
    SensitivityResponse,
)

router = APIRouter(prefix="/api", tags=["predict"])

_counter = 0


def _demo_properties() -> list[dict[str, Any]]:
    return [
        {"id": "thickness", "label": "Coating thickness", "value": 42.6, "unit": "μm",
         "description": "Estimated oxide layer thickness for the given conditions."},
        {"id": "porosity", "label": "Porosity", "value": 3.8, "unit": "%",
         "description": "Volume fraction of open/closed pores in the coating."},
        {"id": "poreSize", "label": "Average pore size", "value": 2.13, "unit": "μm",
         "description": "Mean feret diameter of detected pores."},
        {"id": "corrosion", "label": "Corrosion resistance", "value": 91.4, "unit": "score",
         "description": "Composite score from polarization / salt-spray proxies."},
        {"id": "wear", "label": "Wear resistance", "value": 87.2, "unit": "score",
         "description": "Relative wear performance from tribological proxies."},
        {"id": "fracture", "label": "Fracture parameter", "value": 12.8, "unit": "score",
         "description": "Fracture-toughness related parameter of the coating."},
    ]


@router.post("/predict", response_model=PredictionResponse)
async def predict(input_data: PredictionInput) -> PredictionResponse:
    global _counter
    _counter += 1
    return PredictionResponse(
        id=f"pred-{int(time.time() * 1000)}-{_counter}",
        generatedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        materialId=input_data.materialId,
        model={"id": "coatlab-regressor-v0", "status": "not_trained"},
        inputs=input_data,
        properties=_demo_properties(),
        demo=True,
    )


_SENSITIVITY_RANGES: dict[str, dict[str, float]] = {
    "currentDensity": {"min": 0.5, "max": 20, "step": 0.5},
    "voltage": {"min": 50, "max": 450, "step": 10},
    "time": {"min": 1, "max": 60, "step": 1},
}

_SENSITIVITY_META: dict[str, dict[str, str]] = {
    "currentDensity": {"label": "Current density", "unit": "A/dm²"},
    "voltage": {"label": "Voltage", "unit": "V"},
    "time": {"label": "Processing time", "unit": "min"},
}

SensitivityInput = dict[str, Any]


@router.post("/predict/sensitivity", response_model=SensitivityResponse)
async def sensitivity(body: SensitivityInput) -> SensitivityResponse:
    parameter_id: str = body.get("parameterId", "currentDensity")
    rng = _SENSITIVITY_RANGES.get(parameter_id, _SENSITIVITY_RANGES["currentDensity"])
    meta = _SENSITIVITY_META.get(parameter_id, {"label": parameter_id, "unit": ""})

    lo, hi, step = rng["min"], rng["max"], rng["step"]
    points = []
    x = lo
    while x <= hi + 1e-9:
        t = (x - lo) / (hi - lo) if hi != lo else 0
        points.append({
            "x": round(x, 2),
            "thickness": round(20 + 60 * pow(t, 0.7), 2),
            "porosity": round(1.5 + 6.5 * pow(t, 1.4), 2),
            "corrosion": round(96 - 34 * pow(t, 0.9), 2),
        })
        x += step

    return SensitivityResponse(
        parameter={"id": parameter_id, "label": meta["label"], "unit": meta["unit"]},
        min=lo,
        max=hi,
        points=points,
        demo=True,
    )
