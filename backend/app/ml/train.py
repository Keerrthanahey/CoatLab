"""Training entry point — compares RF vs GradientBoosting per target.

Loads the synthetic dataset, fits the preprocessor, trains both
RandomForestRegressor and GradientBoostingRegressor for each of the
6 coating-property targets, evaluates on a held-out 20% test split,
and selects the best model per target by R².

Artifacts saved to ``app/ml/models/``:
  - preprocessor.joblib
  - coating_models.joblib
  - metrics.json
  - individual <target>_model.pkl files

Run from ``backend/``:
  python -m app.ml.train
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

from app.ml.features import ALL_FEATURES, TARGETS
from app.ml.models import CoatingModelManager
from app.ml.preprocessing import CoatingPreprocessor

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "coating_dataset.csv"
MODELS_DIR = Path(__file__).resolve().parent / "models"

PREPROCESSOR_FILENAME = "preprocessor.joblib"
MODEL_FILENAME = "coating_models.joblib"
METRICS_FILENAME = "metrics.json"
INDIVIDUAL_DIR = "individual_models"

TEST_SIZE = 0.2
RANDOM_SEED = 42


def load_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {path}. Generate with: python -m app.ml.synthetic_dataset"
        )
    return pd.read_csv(path)


def main() -> None:
    df = load_dataset()
    X = df[ALL_FEATURES]
    y = df[TARGETS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_SEED
    )

    preprocessor = CoatingPreprocessor()
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    manager = CoatingModelManager()
    manager.train(
        X_train_t,
        {target: y_train[target].to_numpy() for target in TARGETS},
        X_val=X_test_t,
        y_val_dict={target: y_test[target].to_numpy() for target in TARGETS},
    )
    metrics = manager.evaluate(
        X_test_t,
        {target: y_test[target].to_numpy() for target in TARGETS},
    )

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    preprocessor.save(MODELS_DIR / PREPROCESSOR_FILENAME)
    manager.save(MODELS_DIR / MODEL_FILENAME)
    manager.save_individual_models(MODELS_DIR / INDIVIDUAL_DIR)

    metrics_payload = {
        "demo": True,
        "note": (
            "Metrics computed on SYNTHETIC data; not real experimental performance. "
            "Both RandomForest and GradientBoosting were compared; the best model "
            "per target (by R²) is reported in 'selected_model'."
        ),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_rows": int(len(df)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "targets": TARGETS,
        "metrics": metrics,
    }
    (MODELS_DIR / METRICS_FILENAME).write_text(json.dumps(metrics_payload, indent=2))

    print()
    print("=" * 80)
    print("[DEMO] CoatLab ML Training — Synthetic Data Only")
    print("=" * 80)
    print(f"[DEMO] Dataset rows: {len(df)} | Train: {len(X_train)} | Test: {len(X_test)}")
    print()
    header = f"{'Target':<22}{'Model':<28}{'R²':>8}{'MAE':>10}{'RMSE':>10}{'MAPE':>10}"
    print(header)
    print("-" * len(header))
    for target in TARGETS:
        m = metrics[target]
        print(
            f"[DEMO] {target:<22}{m['selected_model']:<28}"
            f"{m['r2']:>8.4f}{m['mae']:>10.4f}"
            f"{m['rmse']:>10.4f}{m['mape']:>10.4f}"
        )
    print("-" * len(header))
    print()
    print(f"[DEMO] All artifacts saved to {MODELS_DIR}")
    print(f"[DEMO] Individual models: {MODELS_DIR / INDIVIDUAL_DIR}")
    print("[DEMO] NOTE: These results are from SYNTHETIC data.")
    print("[DEMO] Replace with real experimental data before drawing conclusions.")
    print()


if __name__ == "__main__":
    main()
