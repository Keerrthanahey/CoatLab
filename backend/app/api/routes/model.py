from __future__ import annotations

from fastapi import APIRouter

from app.schemas.types import ModelStatus, ModelMetrics

router = APIRouter(prefix="/api/model", tags=["model"])


@router.get("/status", response_model=ModelStatus)
async def model_status() -> ModelStatus:
    return ModelStatus(
        trained=False,
        status="not_trained",
        modelId="coatlab-regressor-v0",
        lastTrainedAt=None,
        datasetRows=0,
        features=[
            "electrolyte (categorical)",
            "concentration",
            "current_density",
            "voltage",
            "frequency",
            "duty_cycle",
            "time",
            "temperature",
        ],
        targets=[
            "coating_thickness",
            "porosity",
            "pore_size",
            "corrosion_resistance",
            "wear_resistance",
            "fracture_parameter",
        ],
    )


@router.get("/metrics", response_model=ModelMetrics)
async def model_metrics() -> ModelMetrics:
    return ModelMetrics(r2=None, mae=None, rmse=None, mape=None)
