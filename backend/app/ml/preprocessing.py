from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.ml.features import CATEGORICAL_FEATURES, NUMERIC_FEATURES


def _as_dataframe(X: pd.DataFrame | list[dict]) -> pd.DataFrame:
    if isinstance(X, pd.DataFrame):
        return X
    return pd.DataFrame(list(X))


class CoatingPreprocessor:
    """Column transformer for coating process parameters.

    Numeric features are median-imputed and standard-scaled; categorical
    features are most-frequent imputed and one-hot encoded (unknown
    categories are ignored at transform time).
    """

    def __init__(self) -> None:
        numeric_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )
        categorical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                (
                    "encoder",
                    OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                ),
            ]
        )
        self.transformer = ColumnTransformer(
            transformers=[
                ("numeric", numeric_pipeline, NUMERIC_FEATURES),
                ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
            ],
            remainder="drop",
        )

    def fit(self, X: pd.DataFrame | list[dict]) -> "CoatingPreprocessor":
        self.transformer.fit(_as_dataframe(X))
        return self

    def transform(self, X: pd.DataFrame | list[dict]) -> np.ndarray:
        return self.transformer.transform(_as_dataframe(X))

    def fit_transform(self, X: pd.DataFrame | list[dict]) -> np.ndarray:
        return self.transformer.fit_transform(_as_dataframe(X))

    def save(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.transformer, path)
        return path

    @classmethod
    def load(cls, path: str | Path) -> "CoatingPreprocessor":
        instance = cls.__new__(cls)
        instance.transformer = joblib.load(path)
        return instance
