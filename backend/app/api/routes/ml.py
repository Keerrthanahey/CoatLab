from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from app.ml.features import ALL_FEATURES, TARGETS
from app.schemas.ml import (
    CoatingInput,
    CoatingPrediction,
    ModelInfo,
    OptimizationRequest,
    OptimizationResult,
    RankedCombination,
)

router = APIRouter(prefix="/api/ml", tags=["ml"])


@router.post("/predict", response_model=CoatingPrediction)
async def ml_predict(input_data: CoatingInput) -> CoatingPrediction:
    from app.core.tracing import log_prediction, log_error
    params = input_data.model_dump()
    try:
        from app.ml.predict import predict_single
        result = predict_single(params)
        prediction = CoatingPrediction(**result)
        log_prediction(params, result, tags=["ml", "prediction", "trained"])
        return prediction
    except Exception as exc:
        log_error("predict", str(exc), context=params)
        return CoatingPrediction(
            corrosion_resistance=85.0,
            corrosion_rate=0.22,
            coating_thickness=68.5,
            porosity=4.2,
            pore_size=15.3,
            wear_resistance=79.0,
            demo=True,
            model_id="coatlab-demo-fallback",
        )


@router.post("/optimize", response_model=OptimizationResult)
async def ml_optimize(request: OptimizationRequest) -> OptimizationResult:
    from app.core.tracing import log_optimization, log_error
    input_summary = {"ranges": request.ranges, "weights": request.weights, "max": request.max_combinations}
    try:
        from app.ml.optimize import generate_combinations, optimize
        combos = generate_combinations(request.ranges)
        if len(combos) > request.max_combinations:
            combos = combos[:request.max_combinations]
        ranked = optimize(combos, request.weights)
        # optimize() returns flat dicts: {**params, **target_predictions,
        # "<target>_score"..., overall_score, demo, rank}
        log_optimization(input_summary, {"total_evaluated": len(ranked)})
        return OptimizationResult(
            total_evaluated=len(ranked),
            ranked=[
                RankedCombination(
                    rank=r["rank"],
                    params={f: r[f] for f in ALL_FEATURES if f in r},
                    predictions=CoatingPrediction(**{t: r[t] for t in TARGETS}),
                    overall_score=r["overall_score"],
                )
                for r in ranked
            ],
            demo=True,
        )
    except Exception:
        demo_ranked = [
            RankedCombination(
                rank=i + 1,
                params={"coating": f"Material-{chr(65+i)}", "temp": 200 + i * 50},
                predictions=CoatingPrediction(
                    corrosion_resistance=90 - i * 2,
                    corrosion_rate=0.15 + i * 0.03,
                    coating_thickness=70 - i * 3,
                    porosity=3 + i * 0.5,
                    pore_size=12 + i * 2,
                    wear_resistance=85 - i * 2,
                ),
                overall_score=92 - i * 4,
            )
            for i in range(5)
        ]
        return OptimizationResult(total_evaluated=5, ranked=demo_ranked, demo=True)


@router.post("/train")
async def ml_train() -> dict[str, Any]:
    try:
        from app.ml.train import main as train_main
        train_main()
        return {"status": "trained", "message": "Models retrained successfully."}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/model-info", response_model=ModelInfo)
async def ml_model_info() -> ModelInfo:
    models_dir = Path(__file__).resolve().parents[2] / "ml" / "models"
    metrics_path = models_dir / "metrics.json"
    trained = (models_dir / "coating_models.joblib").exists()
    metrics: dict = {}
    trained_at = None
    dataset_rows = 0
    if metrics_path.exists():
        try:
            data = json.loads(metrics_path.read_text())
            metrics = data.get("metrics", {})
            trained_at = data.get("trained_at")
            dataset_rows = data.get("dataset_rows", 0)
        except Exception:
            pass
    return ModelInfo(
        trained=trained,
        trained_at=trained_at,
        dataset_rows=dataset_rows,
        metrics=metrics,
        feature_count=len(ALL_FEATURES),
        target_count=len(TARGETS),
        demo=True,
    )


@router.get("/feature-info")
async def ml_feature_info() -> dict[str, Any]:
    from app.ml.features import CATEGORICAL_FEATURES, NUMERIC_FEATURES
    return {
        "categorical": CATEGORICAL_FEATURES,
        "numeric": NUMERIC_FEATURES,
        "targets": TARGETS,
    }
