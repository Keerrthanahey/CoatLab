from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)

from app.ml.features import TARGETS

DEFAULT_MODEL_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": None,
    "min_samples_leaf": 2,
    "random_state": 42,
    "n_jobs": -1,
}


class CoatingModelManager:
    """Manages one RandomForestRegressor per coating property target.

    Operates on already-preprocessed feature matrices (output of
    ``CoatingPreprocessor``).
    """

    def __init__(self, model_params: dict | None = None) -> None:
        self.model_params = {**DEFAULT_MODEL_PARAMS, **(model_params or {})}
        self.models: dict[str, RandomForestRegressor] = {}

    @property
    def is_trained(self) -> bool:
        return bool(self.models) and all(t in self.models for t in TARGETS)

    def train(
        self,
        X: np.ndarray,
        y_dict: dict[str, np.ndarray],
    ) -> "CoatingModelManager":
        missing = [t for t in TARGETS if t not in y_dict]
        if missing:
            raise ValueError(f"Missing target columns for training: {missing}")
        self.models = {}
        for target in TARGETS:
            model = RandomForestRegressor(**self.model_params)
            model.fit(X, np.asarray(y_dict[target], dtype=float))
            self.models[target] = model
        return self

    def predict(self, X: np.ndarray) -> dict[str, np.ndarray]:
        if not self.is_trained:
            raise RuntimeError("Models are not trained. Call train() or load() first.")
        return {target: model.predict(X) for target, model in self.models.items()}

    def evaluate(
        self,
        X_test: np.ndarray,
        y_test_dict: dict[str, np.ndarray],
    ) -> dict[str, dict[str, float]]:
        predictions = self.predict(X_test)
        metrics: dict[str, dict[str, float]] = {}
        for target in TARGETS:
            y_true = np.asarray(y_test_dict[target], dtype=float)
            y_pred = predictions[target]
            rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
            metrics[target] = {
                "r2": float(r2_score(y_true, y_pred)),
                "mae": float(mean_absolute_error(y_true, y_pred)),
                "rmse": rmse,
                "mape": float(mean_absolute_percentage_error(y_true, y_pred)),
            }
        return metrics

    def save(self, path: str | Path) -> Path:
        if not self.is_trained:
            raise RuntimeError("Refusing to save untrained models.")
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "models": self.models,
            "model_params": self.model_params,
            "targets": TARGETS,
        }
        joblib.dump(payload, path)
        return path

    @classmethod
    def load(cls, path: str | Path) -> "CoatingModelManager":
        payload = joblib.load(path)
        instance = cls(model_params=payload.get("model_params"))
        instance.models = payload["models"]
        return instance
