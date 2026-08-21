"""Training entry point.

Loads the synthetic dataset, fits the preprocessor and one random forest
per target, evaluates on a held-out 20% split, and persists artifacts to
``app/ml/models``.

Run from ``backend/``:  python -m app.ml.train
"""

from __future__ import annotations

import json
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

TEST_SIZE = 0.2
RANDOM_SEED = 42


def load_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {path}. Generate it first with: python -m app.ml.synthetic_dataset"
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
    manager.train(X_train_t, {target: y_train[target].to_numpy() for target in TARGETS})
    metrics = manager.evaluate(X_test_t, {target: y_test[target].to_numpy() for target in TARGETS})

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    preprocessor.save(MODELS_DIR / PREPROCESSOR_FILENAME)
    manager.save(MODELS_DIR / MODEL_FILENAME)
    metrics_payload = {
        "demo": True,
        "note": "Metrics computed on SYNTHETIC data; not real experimental performance.",
        "dataset_rows": int(len(df)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "targets": TARGETS,
        "metrics": metrics,
    }
    (MODELS_DIR / METRICS_FILENAME).write_text(json.dumps(metrics_payload, indent=2))

    print("[DEMO] Training complete on SYNTHETIC data (not real experimental results).")
    print(f"[DEMO] Train/test rows: {len(X_train)}/{len(X_test)}")
    print(f"[DEMO] {'Target':<22}{'R2':>8}{'MAE':>10}{'RMSE':>10}{'MAPE':>10}")
    for target in TARGETS:
        m = metrics[target]
        print(
            f"[DEMO] {target:<22}{m['r2']:>8.3f}{m['mae']:>10.3f}"
            f"{m['rmse']:>10.3f}{m['mape']:>10.3f}"
        )
    print(f"[DEMO] Artifacts saved to {MODELS_DIR}")


if __name__ == "__main__":
    main()
