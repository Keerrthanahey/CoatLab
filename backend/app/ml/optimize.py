"""Process-parameter optimization over a candidate grid.

Ranks parameter combinations by a weighted score of model-predicted
coating properties. ``coating_thickness`` is handled as a TARGET
(thin ideal), while corrosion_resistance / wear_resistance are MAXIMIZE
and corrosion_rate / porosity / pore_size are MINIMIZE.

All predictions come from models trained on SYNTHETIC data; every result
carries ``demo=True`` and must never be presented as real experimental
guidance.
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

# Direction per objective: +1 = higher-is-better, -1 = lower-is-better
# coating_thickness uses TARGET mode (ideal ~40 μm)
DIRECTIONS: dict[str, int] = {
    "corrosion_resistance": 1,
    "wear_resistance": 1,
    "corrosion_rate": -1,
    "porosity": -1,
    "pore_size": -1,
    "coating_thickness": -1,  # penalise both very thin and very thick
}

THICKNESS_IDEAL = 40.0

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
    """Build the cartesian product of per-feature value ranges."""
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


def _score_target(target: str, values: np.ndarray) -> np.ndarray:
    """Normalize a target and apply direction. For coating_thickness use
    a thin-target penalty relative to THICKNESS_IDEAL."""
    if target == "coating_thickness":
        norm = _normalize(values)
        ideal_norm = (THICKNESS_IDEAL - float(values.min())) / max(float(values.max()) - float(values.min()), 1e-12)
        ideal_norm = float(np.clip(ideal_norm, 0.0, 1.0))
        # Score peaks at ideal; falls off linearly towards either extreme
        return 1.0 - np.abs(norm - ideal_norm)
    norm = _normalize(values)
    if DIRECTIONS[target] == -1:
        return 1.0 - norm
    return norm


def optimize(
    combinations: list[dict],
    weights_dict: dict[str, float] | None = None,
) -> list[dict]:
    """Score and rank candidate parameter combinations.

    Returns candidates sorted best-first with ``rank`` and
    ``overall_score`` fields.
    """
    if not combinations:
        return []

    weights = dict(DEFAULT_WEIGHTS)
    if weights_dict is not None:
        weights.update(weights_dict)

    total_weight = sum(weights.get(t, 0) for t in TARGETS)
    if total_weight <= 0:
        raise ValueError("Total weight must be positive.")
    weights = {t: weights.get(t, 0) / total_weight for t in TARGETS}

    predictions = predict_batch(combinations)

    normalized: dict[str, np.ndarray] = {}
    for target in TARGETS:
        raw = np.array([p["predictions"][target] for p in predictions], dtype=float)
        normalized[target] = _score_target(target, raw)

    results: list[dict] = []
    for i, (combo, prediction) in enumerate(zip(combinations, predictions)):
        scores = {f"{t}_score": round(float(normalized[t][i]), 4) for t in TARGETS}
        overall = sum(weights[t] * normalized[t][i] for t in TARGETS)
        result = {
            **combo,
            **{f"pred_{t}": prediction["predictions"][t] for t in TARGETS},
            **scores,
            "overall_score": round(float(overall), 4),
            "demo": True,
        }
        results.append(result)

    results.sort(key=lambda r: r["overall_score"], reverse=True)
    for rank, result in enumerate(results, start=1):
        result["rank"] = rank
    return results
