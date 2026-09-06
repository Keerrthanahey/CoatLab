"""Synthetic material-aware coating dataset generator.

Produces a physically plausible (but entirely synthetic) process-property
dataset covering Magnesium, Aluminum, Zirconium, and Tantalum as both
substrate and coating materials. Electrochemical parameters are included
for PEO / anodizing / electrodeposition workflows.

This is NOT experimental data and must never be presented as such.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.features import (
    AC_DC_MODES,
    ALL_FEATURES,
    COATING_MATERIALS,
    COATING_METHODS,
    COOLING_METHODS,
    CURRENT_VOLTAGE_MODES,
    ELECTROLYTES,
    NUMERIC_FEATURES,
    SUBSTRATE_MATERIALS,
    SURFACE_PREPARATIONS,
    TARGETS,
    CATEGORICAL_FEATURES,
    REINFORCEMENTS,
)

N_ROWS = 500
RANDOM_SEED = 42

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
DATA_PATH = DATA_DIR / "coating_dataset.csv"

# ── Physical lookup tables ──────────────────────────────────────────────────

METHOD_THICKNESS_FACTOR = {
    "PEO": 1.00,
    "anodizing": 0.55,
    "plasma_spray": 1.45,
    "electrodeposition": 0.80,
    "sol_gel": 0.40,
}

# Coating-material bonus to corrosion_resistance
COATING_CORROSION_BONUS = {
    "Magnesium": 2.0,
    "Aluminum": 8.0,
    "Zirconium": 10.0,
    "Tantalum": 14.0,
    "MgO": 0.0,
    "Al2O3": 6.0,
    "ZrO2": 8.0,
    "TiO2": 7.0,
}

# Base corrosion rate factor (lower = more corrosion resistant substrate)
SUBSTRATE_CORROSION_BASE = {
    "Magnesium": 1.20,
    "Aluminum": 0.75,
    "Zirconium": 0.60,
    "Tantalum": 0.45,
}

QUENCH_POROSITY_FACTOR = {"air": 1.00, "water": 1.12, "oil": 1.05, "furnace": 0.90}

PREP_ROUGHNESS_BIAS = {
    "ground": -0.5,
    "polished": -0.8,
    "sandblasted": 1.4,
    "as_received": 0.9,
}


def _generate_features(rng: np.random.Generator) -> pd.DataFrame:
    n = N_ROWS

    substrate = rng.choice(SUBSTRATE_MATERIALS, n)
    coating = rng.choice(COATING_MATERIALS, n)
    reinforcement = rng.choice(REINFORCEMENTS, n)
    method = rng.choice(COATING_METHODS, n)
    electrolyte = rng.choice(ELECTROLYTES, n)
    cv_mode = rng.choice(CURRENT_VOLTAGE_MODES, n)
    acdc = rng.choice(AC_DC_MODES, n)
    cooling = rng.choice(COOLING_METHODS, n)
    preparation = rng.choice(SURFACE_PREPARATIONS, n)

    reinforcement_pct = np.where(
        reinforcement == "none", 0.0, rng.uniform(0.5, 20.0, n)
    )
    particle_size = np.where(
        reinforcement == "none", 0.0, rng.uniform(0.05, 25.0, n)
    )

    # Electrochemical parameters
    current_density = rng.uniform(1.0, 60.0, n)
    voltage = rng.uniform(50.0, 550.0, n)
    frequency = rng.uniform(0.0, 5000.0, n)
    duty_cycle = rng.uniform(10.0, 95.0, n)
    treatment_time = rng.uniform(5.0, 120.0, n)

    # Thermal spray / general process
    temperature = rng.uniform(15.0, 80.0, n)
    pressure = rng.uniform(0.5, 5.0, n)
    spray_distance = rng.uniform(50.0, 300.0, n)
    speed = rng.uniform(1.0, 40.0, n)
    num_passes = rng.integers(1, 8, n).astype(float)

    # Heat treatment
    heat_treatment_temperature = rng.choice(
        [25.0, 150.0, 200.0, 250.0, 300.0, 350.0, 400.0, 450.0, 500.0], n
    )
    heat_treatment_time = np.where(
        heat_treatment_temperature > 25.0,
        rng.uniform(0.5, 12.0, n),
        0.0,
    )

    roughness_bias = np.array([PREP_ROUGHNESS_BIAS[p] for p in preparation])
    surface_roughness = np.clip(rng.uniform(0.1, 6.0, n) + roughness_bias, 0.05, None)
    surface_hardness = rng.uniform(30.0, 250.0, n)

    df = pd.DataFrame({
        "substrate_material": substrate,
        "coating_material": coating,
        "reinforcement": reinforcement,
        "coating_method": method,
        "electrolyte_composition": electrolyte,
        "current_voltage_mode": cv_mode,
        "ac_dc_mode": acdc,
        "cooling_method": cooling,
        "surface_preparation": preparation,
        "reinforcement_percentage": reinforcement_pct,
        "particle_size": particle_size,
        "current_density": current_density,
        "voltage": voltage,
        "frequency": frequency,
        "duty_cycle": duty_cycle,
        "treatment_time": treatment_time,
        "temperature": temperature,
        "pressure": pressure,
        "spray_distance": spray_distance,
        "surface_roughness": surface_roughness,
        "heat_treatment_temperature": heat_treatment_temperature,
        "heat_treatment_time": heat_treatment_time,
        "speed": speed,
        "num_passes": num_passes,
        "surface_hardness": surface_hardness,
    })
    return df


def _generate_targets(features: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    def noise(scale: float) -> np.ndarray:
        return rng.normal(0.0, scale, N_ROWS)

    voltage_n = features["voltage"] / 550.0
    cd_n = features["current_density"] / 60.0
    time_n = features["treatment_time"] / 120.0
    passes_n = (features["num_passes"] - 1) / 6.0
    ht_factor = np.clip(features["heat_treatment_temperature"] / 500.0, 0.0, 1.0)
    duty_n = features["duty_cycle"] / 100.0

    method_factor = features["coating_method"].map(METHOD_THICKNESS_FACTOR)
    energy = (cd_n * 0.40 + voltage_n * 0.30 + time_n * 0.15 + duty_n * 0.15) ** 0.8

    # ── coating_thickness ───────────────────────────────────────────────
    thickness = (
        4.0
        + 75.0 * energy
        * method_factor
        * (1.0 + 0.25 * passes_n)
        * (1.0 - 0.10 * ht_factor)
        + noise(3.5)
    )
    thickness = thickness.clip(lower=1.5)

    # ── porosity ────────────────────────────────────────────────────────
    quench_factor = features["cooling_method"].map(QUENCH_POROSITY_FACTOR)
    porosity = (
        2.0
        + 24.0 * cd_n * (0.4 + 0.6 * voltage_n)
        * quench_factor
        * (1.0 + 0.08 * features["surface_roughness"])
        * (1.0 - 0.25 * ht_factor)
        * (1.0 - 0.15 * np.clip(features["reinforcement_percentage"] / 20.0, 0.0, 1.0))
        + noise(1.8)
    )
    porosity = porosity.clip(lower=0.3)

    # ── pore_size ───────────────────────────────────────────────────────
    pore_size = (
        0.8
        + 16.0 * voltage_n ** 1.5
        * (1.0 + 0.05 * np.log1p(features["particle_size"]))
        * (1.0 - 0.20 * ht_factor)
        + noise(0.9)
    )
    pore_size = pore_size.clip(lower=0.05)

    # ── corrosion_resistance ────────────────────────────────────────────
    corrosion_bonus = features["coating_material"].map(COATING_CORROSION_BONUS)
    corrosion_resistance = (
        10.0
        + 0.55 * thickness
        - 1.6 * porosity
        - 0.9 * pore_size
        + corrosion_bonus
        + 18.0 * ht_factor
        + noise(4.5)
    )
    corrosion_resistance = corrosion_resistance.clip(lower=1.0)

    # ── corrosion_rate ──────────────────────────────────────────────────
    substrate_base = features["substrate_material"].map(SUBSTRATE_CORROSION_BASE)
    corrosion_rate = (
        substrate_base
        * 2.4
        * np.exp(-0.03 * thickness)
        * (1.0 + 0.09 * porosity)
        * (1.0 - 0.25 * ht_factor)
        + noise(0.10)
    )
    corrosion_rate = corrosion_rate.clip(lower=0.01)

    # ── wear_resistance ─────────────────────────────────────────────────
    has_reinforcement = (features["reinforcement_percentage"] > 0).astype(float)
    fine_particle_bonus = 35.0 * np.exp(-features["particle_size"] / 4.0) * has_reinforcement
    wear_resistance = (
        0.35 * features["surface_hardness"]
        + 7.0 * features["reinforcement_percentage"]
        + 0.9 * thickness
        - 1.8 * porosity
        + fine_particle_bonus
        + 40.0 * ht_factor
        + noise(14.0)
    )
    wear_resistance = wear_resistance.clip(lower=5.0)

    return pd.DataFrame({
        "corrosion_resistance": corrosion_resistance,
        "corrosion_rate": corrosion_rate,
        "coating_thickness": thickness,
        "porosity": porosity,
        "pore_size": pore_size,
        "wear_resistance": wear_resistance,
    })


def _inject_missing_values(
    df: pd.DataFrame,
    rng: np.random.Generator,
    fraction: float = 0.02,
) -> pd.DataFrame:
    df = df.copy()
    for col in NUMERIC_FEATURES:
        if col in df.columns and df[col].dtype.kind in "fc":
            mask = rng.random(len(df)) < fraction
            df.loc[mask, col] = np.nan
    return df


def generate_dataset(seed: int = RANDOM_SEED) -> pd.DataFrame:
    """Generate a synthetic coating dataset.

    Returns a DataFrame with all canonical features (ALL_FEATURES),
    targets (TARGETS), and metadata columns.
    """
    rng = np.random.default_rng(seed)
    features = _generate_features(rng)
    targets = _generate_targets(features, rng)
    df = pd.concat([features, targets], axis=1)

    # Metadata columns
    df.insert(0, "sample_id", [f"S{i+1:04d}" for i in range(len(df))])
    df["experiment_id"] = [f"E{(i // 10) + 1:03d}" for i in range(len(df))]
    df["data_source"] = "synthetic"
    df["is_demo"] = True
    df["units"] = "synthetic_range"
    df["notes"] = "Auto-generated for development; not experimental data."

    return _inject_missing_values(df, rng)


def main() -> None:
    df = generate_dataset()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)

    print()
    print("=" * 80)
    print("[DEMO] CoatLab Synthetic Dataset Generator")
    print("=" * 80)
    print(f"[DEMO] Output:     {DATA_PATH}")
    print(f"[DEMO] Rows:       {len(df)}")
    print(f"[DEMO] Features:   {len(ALL_FEATURES)} ({len(CATEGORICAL_FEATURES)} cat + {len(NUMERIC_FEATURES)} num)")
    print(f"[DEMO] Targets:    {len(TARGETS)}")
    print()
    print("[DEMO] Materials covered:")
    print(f"[DEMO]   Substrates:  {', '.join(SUBSTRATE_MATERIALS)}")
    print(f"[DEMO]   Coatings:    {', '.join(COATING_MATERIALS)}")
    print()
    print("[DEMO] Target ranges:")
    for target in TARGETS:
        print(f"[DEMO]   {target:<24s} {df[target].min():>8.3f} .. {df[target].max():>8.3f}")
    print()
    print("[DEMO] NOTE: This data is synthetically generated for development only.")
    print("[DEMO] It is NOT experimental data and must never be presented as real results.")
    print()


if __name__ == "__main__":
    main()
