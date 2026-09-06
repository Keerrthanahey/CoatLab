"""Clean data loading layer for CoatLab.

Supports CSV and Excel files with metadata columns (sample_id, experiment_id,
data_source, is_demo, units, notes). Decouples the ML pipeline from any
specific file format or directory layout.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.ml.features import ALL_FEATURES, TARGETS

OPTIONAL_METADATA_COLUMNS = [
    "sample_id",
    "experiment_id",
    "data_source",
    "is_demo",
    "units",
    "notes",
]


def load_csv(path: str | Path) -> pd.DataFrame:
    """Load a coating dataset from a CSV file.

    Validates that all required feature + target columns are present.
    Extra columns (e.g. metadata) are preserved but not required.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_csv(path)
    _validate_columns(df, path.name)
    return df


def load_excel(path: str | Path) -> pd.DataFrame:
    """Load a coating dataset from an Excel file (.xlsx / .xls)."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    df = pd.read_excel(path, engine="openpyxl" if path.suffix == ".xlsx" else None)
    _validate_columns(df, path.name)
    return df


def load_dataset(path: str | Path) -> pd.DataFrame:
    """Auto-detect format (CSV or Excel) and load the dataset."""
    path = Path(path)
    suffix = path.suffix.lower()
    if suffix in (".xlsx", ".xls"):
        return load_excel(path)
    return load_csv(path)


def _validate_columns(df: pd.DataFrame, filename: str) -> None:
    """Raise if required columns are missing."""
    required = set(ALL_FEATURES + TARGETS)
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Dataset '{filename}' is missing required columns: {sorted(missing)}"
        )


def split_features_targets(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split a dataset into feature and target DataFrames."""
    X = df[ALL_FEATURES].copy()
    y = df[TARGETS].copy()
    return X, y
