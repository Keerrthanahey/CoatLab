from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from app.ml.features import (
    ALL_FEATURES,
    COATING_MATERIALS,
    SUBSTRATE_MATERIALS,
    TARGETS,
)
from app.schemas.ml import (
    CoatingInput,
    CoatingPrediction,
    ModelInfo,
    ObjectiveWeights,
    OptimizationEntry,
    OptimizationRequest,
    OptimizationResult,
    PredictedOutputs,
)

router = APIRouter(prefix="/api/ml", tags=["ml"])


def _build_optimization_result(ranked: list[dict], weights: ObjectiveWeights) -> OptimizationResult:
    if not ranked:
        raise ValueError("No ranked combinations produced by the optimizer.")

    entries: list[OptimizationEntry] = []
    for r in ranked:
        entries.append(OptimizationEntry(
            rank=r["rank"],
            params={f: r.get(f) for f in ALL_FEATURES if f in r},
            predicted_outputs=_pred_outputs_from_ranked(r),
            score=r["overall_score"],
            objective_weights=weights,
        ))

    top10 = entries[:10]
    best = top10[0]
    return OptimizationResult(
        total_evaluated=len(ranked),
        best_combination=best,
        top_10_combinations=top10,
        predicted_outputs=best.predicted_outputs,
        score=best.score,
        objective_weights=weights,
        data_status="synthetic",
        demo=True,
    )


def _pred_outputs_from_ranked(r: dict) -> PredictedOutputs:
    return PredictedOutputs(
        corrosion_resistance=r["pred_corrosion_resistance"],
        corrosion_rate=r["pred_corrosion_rate"],
        coating_thickness=r["pred_coating_thickness"],
        porosity=r["pred_porosity"],
        pore_size=r["pred_pore_size"],
        wear_resistance=r["pred_wear_resistance"],
    )


@router.post("/predict", response_model=CoatingPrediction)
async def ml_predict(input_data: CoatingInput) -> CoatingPrediction:
    from app.core.tracing import log_prediction, log_error
    params = input_data.model_dump()
    try:
        from app.ml.predict import predict_single
        result = predict_single(params)
        log_prediction(params, result, tags=["ml", "prediction", "trained"])
        return CoatingPrediction(**result)
    except Exception as exc:
        log_error("predict", str(exc), context=params)
        return CoatingPrediction(
            predictions=PredictedOutputs(
                corrosion_resistance=30.0,
                corrosion_rate=0.5,
                coating_thickness=50.0,
                porosity=10.0,
                pore_size=20.0,
                wear_resistance=40.0,
            ),
            prediction_status="fallback",
            model_name="coatlab-demo-fallback",
        )


@router.post("/optimize", response_model=OptimizationResult)
async def ml_optimize(request: OptimizationRequest) -> OptimizationResult:
    from app.core.tracing import log_optimization, log_error
    input_summary = {"ranges": request.ranges, "weights": request.weights.model_dump(), "max": request.max_combinations}
    try:
        from app.ml.optimize import generate_combinations, optimize
        combos = generate_combinations(request.ranges)
        if len(combos) > request.max_combinations:
            combos = combos[:request.max_combinations]
        ranked = optimize(combos, request.weights.model_dump())
        log_optimization(input_summary, {"total_evaluated": len(ranked)})
        return _build_optimization_result(ranked, request.weights)
    except Exception as exc:
        log_error("optimize", str(exc), context=input_summary)
        weights = request.weights
        return OptimizationResult(
            total_evaluated=0,
            best_combination=OptimizationEntry(
                rank=1,
                params={},
                predicted_outputs=PredictedOutputs(
                    corrosion_resistance=50.0,
                    corrosion_rate=0.3,
                    coating_thickness=55.0,
                    porosity=6.0,
                    pore_size=12.0,
                    wear_resistance=60.0,
                ),
                score=0.0,
                objective_weights=weights,
            ),
            top_10_combinations=[
                OptimizationEntry(
                    rank=1,
                    params={},
                    predicted_outputs=PredictedOutputs(
                        corrosion_resistance=50.0,
                        corrosion_rate=0.3,
                        coating_thickness=55.0,
                        porosity=6.0,
                        pore_size=12.0,
                        wear_resistance=60.0,
                    ),
                    score=0.0,
                    objective_weights=weights,
                )
            ],
            predicted_outputs=PredictedOutputs(
                corrosion_resistance=50.0,
                corrosion_rate=0.3,
                coating_thickness=55.0,
                porosity=6.0,
                pore_size=12.0,
                wear_resistance=60.0,
            ),
            score=0.0,
            objective_weights=weights,
            data_status="synthetic",
            demo=True,
        )


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
        supported_substrates=SUBSTRATE_MATERIALS,
        supported_coatings=COATING_MATERIALS,
        data_status="synthetic",
        demo=True,
    )


@router.get("/feature-info")
async def ml_feature_info() -> dict[str, Any]:
    from app.ml.features import CATEGORICAL_FEATURES, NUMERIC_FEATURES
    from app.ml.units import FEATURE_UNITS, NUMERIC_RANGES, TARGET_UNITS
    return {
        "categorical": CATEGORICAL_FEATURES,
        "numeric": NUMERIC_FEATURES,
        "targets": TARGETS,
        "units": {
            "features": FEATURE_UNITS,
            "targets": TARGET_UNITS,
        },
        "ranges": NUMERIC_RANGES,
        "supported_substrates": SUBSTRATE_MATERIALS,
        "supported_coatings": COATING_MATERIALS,
    }
