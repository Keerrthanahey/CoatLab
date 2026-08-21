"""Model manager for coating property regression.

Manages one best-estimator model per coating property target. During
training, both RandomForestRegressor and GradientBoostingRegressor are
evaluated and the one with higher R² is selected for each target.

All models operate on preprocessed feature matrices (output of
``CoatingPreprocessor``). Artifacts are persisted via joblib.
"""

from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime, timezone

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)

from app.ml.features import TARGETS

RF_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": None,
    "min_samples_leaf": 2,
    "random_state": 42,
    "n_jobs": -1,
}

GB_PARAMS: dict = {
    "n_estimators": 300,
    "max_depth": 5,
    "learning_rate": 0.1,
    "min_samples_leaf": 2,
    "random_state": 42,
}

CANDIDATE_MODELS: dict[str, type] = {
    "RandomForestRegressor": RandomForestRegressor,
    "GradientBoostingRegressor": GradientBoostingRegressor,
}
CANDIDATE_PARAMS: dict[str, dict] = {
    "RandomForestRegressor": RF_PARAMS,
    "GradientBoostingRegressor": GB_PARAMS,
}


class CoatingModelManager:
    """Manages one regressor per coating property target."""

    def __init__(self) -> None:
        self.models: dict[str, object] = {}
        self.model_names: dict[str, str] = {}

    @property
    def is_trained(self) -> bool:
        return bool(self.models) and all(t in self.models for t in TARGETS)

    def train(
        self,
        X_train: np.ndarray,
        y_dict: dict[str, np.ndarray],
        X_val: np.ndarray | None = None,
        y_val_dict: dict[str, np.ndarray] | None = None,
    ) -> "CoatingModelManager":
        """Train both RF and GB per target, pick the best by R² on validation set.

        If no validation set is provided, uses training R² (less reliable but
        still allows the pipeline to run).
        """
        missing = [t for t in TARGETS if t not in y_dict]
        if missing:
            raise ValueError(f"Missing target columns for training: {missing}")

        self.models = {}
        self.model_names = {}

        for target in TARGETS:
            y_train = np.asarray(y_dict[target], dtype=float)
            best_r2 = -np.inf
            best_model = None
            best_name = ""

            for name, model_class in CANDIDATE_MODELS.items():
                params = CANDIDATE_PARAMS[name]
                model = model_class(**params)
                model.fit(X_train, y_train)

                if X_val is not None and y_val_dict is not None:
                    y_eval = np.asarray(y_val_dict[target], dtype=float)
                    y_pred = model.predict(X_val)
                else:
                    y_pred = model.predict(X_train)
                    y_eval = y_train

                r2 = float(r2_score(y_eval, y_pred))
                if r2 > best_r2:
                    best_r2 = r2
                    best_model = model
                    best_name = name

            self.models[target] = best_model
            self.model_names[target] = best_name

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
                "r2": round(float(r2_score(y_true, y_pred)), 6),
                "mae": round(float(mean_absolute_error(y_true, y_pred)), 6),
                "rmse": round(rmse, 6),
                "mape": round(float(mean_absolute_percentage_error(y_true, y_pred)), 6),
                "selected_model": self.model_names.get(target, "unknown"),
            }
        return metrics

    def save(self, path: str | Path) -> Path:
        if not self.is_trained:
            raise RuntimeError("Refusing to save untrained models.")
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "models": self.models,
            "model_names": self.model_names,
            "targets": TARGETS,
        }
        joblib.dump(payload, path)
        return path

    def save_individual_models(self, directory: str | Path) -> Path:
        """Save each target's model as a separate .pkl file."""
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        for target in TARGETS:
            joblib.dump(self.models[target], directory / f"{target}_model.pkl")
        return directory

    @classmethod
    def load(cls, path: str | Path) -> "CoatingModelManager":
        payload = joblib.load(path)
        instance = cls()
        instance.models = payload["models"]
        instance.model_names = payload.get("model_names", {t: "unknown" for t in TARGETS})
        return instance
