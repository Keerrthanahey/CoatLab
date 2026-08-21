"""Process-parameter optimization over a candidate grid.

Ranks parameter combinations by a weighted score of model-predicted
coating properties. All predictions come from models trained on
SYNTHETIC data; every result carries ``demo=True`` and must never be
presented as real experimental guidance.
"""

from __future__ import annotations

from itertools import product

import numpy as np

from app.ml.features import TARGETS
from app.ml.predict import predict_batch

DEFAULT_WEIGHTS: dict[str, float] = {
    "corrosion_resistance": 0.30,
    "wear_resistance": 0.25,
    "corrosion_rate": 0.20,
    "porosity": 0.15,
    "coating_thickness": 0.05,
    "pore_size": 0.05,
}

HIGHER_IS_BETTER: set[str] = {"corrosion_resistance", "wear_resistance"}
LOWER_IS_BETTER: set[str] = {"corrosion_rate", "porosity", "pore_size"}
# Not specified in requirements; thickness is treated as higher-better since
# thicker coatings generally act as a better corrosion barrier (weight 0.05).
DIRECTIONS: dict[str, int] = {
    **{t: 1 for t in HIGHER_IS_BETTER},
    **{t: -1 for t in LOWER_IS_BETTER},
    "coating_thickness": 1,
}

MAX_COMBINATIONS = 100_000


def _expand_range(value) -> list:
    if isinstance(value, tuple) and len(value) == 3 and all(isinstance(v, (int, float)) for v in value):
        lo, hi, step = value
        if step <= 0 or hi < lo:
            raise ValueError(f"Invalid range {value}; expected (min, max, positive_step).")
        return [float(v) for v in np.arange(lo, hi + step / 2, step)]
    if isinstance(value, (list, tuple, set)):
        return list(value)
    return [value]


def generate_combinations(ranges_dict: dict) -> list[dict]:
    """Build the cartesian product of per-feature value ranges.

    Each range may be an iterable of discrete options or a numeric tuple
    ``(min, max, step)``.
    """
    if not ranges_dict:
        return []
    keys = list(ranges_dict.keys())
    option_lists = [_expand_range(ranges_dict[key]) for key in keys]
    total = 1
    for options in option_lists:
        total *= len(options)
    if total > MAX_COMBINATIONS:
        raise ValueError(
            f"Requested grid of {total} combinations exceeds limit of {MAX_COMBINATIONS}."
        )
    return [dict(zip(keys, values)) for values in product(*option_lists)]


def _normalize(values: np.ndarray) -> np.ndarray:
    lo, hi = float(values.min()), float(values.max())
    if hi - lo < 1e-12:
        return np.full_like(values, 0.5)
    return (values - lo) / (hi - lo)


def optimize(
    combinations: list[dict],
    weights_dict: dict[str, float] | None = None,
) -> list[dict]:
    """Score and rank candidate parameter combinations.

    Every target is min-max normalized to 0-1 across the candidate set,
    flipped so that higher is always better, and combined into a weighted
    ``overall_score``. Returns candidates sorted best-first.
    """
    if not combinations:
        return []

    weights = dict(DEFAULT_WEIGHTS)
    if weights_dict is not None:
        unknown = set(weights_dict) - set(TARGETS)
        if unknown:
            raise ValueError(f"Unknown targets in weights: {sorted(unknown)}")
        weights.update(weights_dict)

    total_weight = sum(weights[t] for t in TARGETS)
    if total_weight <= 0:
        raise ValueError("Total weight must be positive.")
    weights = {t: weights[t] / total_weight for t in TARGETS}

    predictions = predict_batch(combinations)

    normalized: dict[str, np.ndarray] = {}
    for target in TARGETS:
        raw = np.array([p[target] for p in predictions], dtype=float)
        norm = _normalize(raw)
        normalized[target] = norm if DIRECTIONS[target] == 1 else 1.0 - norm

    results: list[dict] = []
    for i, (combo, prediction) in enumerate(zip(combinations, predictions)):
        scores = {f"{t}_score": round(float(normalized[t][i]), 4) for t in TARGETS}
        overall = sum(weights[t] * normalized[t][i] for t in TARGETS)
        result = {
            **combo,
            **{target: prediction[target] for target in TARGETS},
            **scores,
            "overall_score": round(float(overall), 4),
            "demo": True,
        }
        results.append(result)

    results.sort(key=lambda r: r["overall_score"], reverse=True)
    for rank, result in enumerate(results, start=1):
        result["rank"] = rank
    return results
