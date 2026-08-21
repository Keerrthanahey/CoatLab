"""Inference helpers for the coating property models.

All outputs are model predictions trained on SYNTHETIC data and are
flagged with ``demo=True``. They must never be presented as real
experimental results.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.features import ALL_FEATURES, TARGETS
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

    Returns a dict mapping each target to its predicted value plus a
    ``demo`` key that is always True (synthetic-data models).
    """
    preprocessor, manager = _load_artifacts()
    X = preprocessor.transform(_to_frame(params))
    predictions = manager.predict(X)
    result = {target: round(float(predictions[target][0]), 4) for target in TARGETS}
    result["demo"] = True
    return result


def predict_batch(combinations: list[dict]) -> list[dict]:
    """Predict all 6 coating properties for a batch of parameter sets."""
    if not combinations:
        return []
    preprocessor, manager = _load_artifacts()
    X = preprocessor.transform(_to_frame_batch(combinations))
    predictions = manager.predict(X)
    results: list[dict] = []
    for i in range(len(combinations)):
        result = {target: round(float(predictions[target][i]), 4) for target in TARGETS}
        result["demo"] = True
        results.append(result)
    return results
