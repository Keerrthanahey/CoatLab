"""Inference helpers for the coating property models.

All outputs are model predictions trained on SYNTHETIC data and are
flagged with ``demo=True``. They must never be presented as real
experimental results.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.features import ALL_FEATURES, TARGETS, resolve_aliases
from app.ml.models import CoatingModelManager
from app.ml.preprocessing import CoatingPreprocessor

MODELS_DIR = Path(__file__).resolve().parent / "models"
PREPROCESSOR_PATH = MODELS_DIR / "preprocessor.joblib"
MODEL_PATH = MODELS_DIR / "coating_models.joblib"

_artifacts: tuple[CoatingPreprocessor, CoatingModelManager] | None = None


def _load_artifacts() -> tuple[CoatingPreprocessor, CoatingModelManager]:
    global _artifacts
    if _artifacts is None:
        if not PREPROCESSOR_PATH.exists() or not MODEL_PATH.exists():
            raise RuntimeError(
                "Trained artifacts not found. Run training first: python -m app.ml.train"
            )
        _artifacts = (
            CoatingPreprocessor.load(PREPROCESSOR_PATH),
            CoatingModelManager.load(MODEL_PATH),
        )
    return _artifacts


def _to_frame(params: dict) -> pd.DataFrame:
    row = {feature: params.get(feature, np.nan) for feature in ALL_FEATURES}
    return pd.DataFrame([row], columns=ALL_FEATURES)


def _to_frame_batch(combinations: list[dict]) -> pd.DataFrame:
    rows = [{feature: params.get(feature, np.nan) for feature in ALL_FEATURES} for params in combinations]
    return pd.DataFrame(rows, columns=ALL_FEATURES)


def predict_single(params: dict) -> dict:
    """Predict all 6 coating properties for one parameter set.

    Resolves aliases, runs the ML models, and returns structured
    results with status metadata.
    """
    resolved = resolve_aliases(params)
    preprocessor, manager = _load_artifacts()
    X = preprocessor.transform(_to_frame(resolved))
    predictions = manager.predict(X)

    outputs = {target: round(float(predictions[target][0]), 4) for target in TARGETS}
    return {
        "predictions": outputs,
        "prediction_status": "success",
        "data_status": "synthetic",
        "demo_status": "DEMO — model trained on synthetic data",
        "model_name": "coatlab-gb-v1",
        "demo": True,
    }


def predict_batch(combinations: list[dict]) -> list[dict]:
    """Predict all 6 coating properties for a batch of parameter sets."""
    if not combinations:
        return []
    resolved = [resolve_aliases(c) for c in combinations]
    preprocessor, manager = _load_artifacts()
    X = preprocessor.transform(_to_frame_batch(resolved))
    predictions = manager.predict(X)
    results: list[dict] = []
    for i in range(len(combinations)):
        outputs = {target: round(float(predictions[target][i]), 4) for target in TARGETS}
        results.append({
            "predictions": outputs,
            "demo": True,
        })
    return results
