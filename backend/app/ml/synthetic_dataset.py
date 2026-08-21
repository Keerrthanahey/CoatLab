"""Synthetic Mg coating dataset generator.

Produces a physically plausible (but entirely synthetic) process-property
dataset for demo and development purposes. Rows are sampled from realistic
Mg PEO / thermal-spray parameter windows and targets are derived from
simplified physical relationships with noise.

This is NOT experimental data and must never be presented as such.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.features import ALL_FEATURES, TARGETS

N_ROWS = 500
RANDOM_SEED = 42

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "coating_dataset.csv"

SUBSTRATE_MATERIALS = ["AZ31", "AZ61", "AZ91", "WE43", "ZK60", "pure_Mg"]
COATING_MATERIALS = ["MgO", "MgAl2O4", "hydroxyapatite", "MgF2", "Mg_silicate"]
REINFORCEMENTS = ["none", "TiO2", "ZrO2", "Al2O3", "Si3N4", "graphene_oxide"]
COATING_METHODS = ["PEO", "anodizing", "plasma_spray", "electrodeposition", "sol_gel"]
COOLING_METHODS = ["air_cool", "water_quench", "furnace_cool"]
SURFACE_PREPARATIONS = ["polished", "sandblasted", "acid_etched", "as_received"]

METHOD_THICKNESS_FACTOR = {
    "PEO": 1.00,
    "anodizing": 0.55,
    "plasma_spray": 1.45,
    "electrodeposition": 0.80,
    "sol_gel": 0.40,
}
COATING_CORROSION_BONUS = {
    "MgO": 0.0,
    "MgAl2O4": 6.0,
    "hydroxyapatite": 9.0,
    "MgF2": 7.5,
    "Mg_silicate": 4.0,
}
SUBSTRATE_CORROSION_BASE = {
    "AZ31": 1.00,
    "AZ61": 0.90,
    "AZ91": 0.75,
    "WE43": 0.85,
    "ZK60": 1.05,
    "pure_Mg": 1.20,
}
QUENCH_POROSITY_FACTOR = {"air_cool": 1.00, "water_quench": 1.12, "furnace_cool": 0.90}
PREP_ROUGHNESS_BIAS = {
    "polished": -0.8,
    "sandblasted": 1.4,
    "acid_etched": 0.5,
    "as_received": 0.9,
}


def _generate_features(rng: np.random.Generator) -> pd.DataFrame:
    n = N_ROWS
    substrate = rng.choice(SUBSTRATE_MATERIALS, n)
    reinforcement = rng.choice(REINFORCEMENTS, n)
    method = rng.choice(COATING_METHODS, n)
    cooling = rng.choice(COOLING_METHODS, n)
    preparation = rng.choice(SURFACE_PREPARATIONS, n)
    coating = rng.choice(COATING_MATERIALS, n)

    reinforcement_pct = np.where(
        reinforcement == "none",
        0.0,
        rng.uniform(0.5, 15.0, n),
    )
    particle_size = np.where(
        reinforcement == "none",
        0.0,
        rng.uniform(0.05, 20.0, n),
    )
    voltage = rng.uniform(150.0, 550.0, n)
    current = rng.uniform(5.0, 60.0, n)
    temperature = rng.uniform(15.0, 60.0, n)
    pressure = rng.uniform(50.0, 350.0, n)
    spray_distance = rng.uniform(50.0, 300.0, n)
    deposition_time = rng.uniform(5.0, 60.0, n)
    speed = rng.uniform(1.0, 40.0, n)
    num_passes = rng.integers(1, 7, n).astype(float)
    heat_treatment_temp = rng.choice([25.0, 150.0, 200.0, 250.0, 300.0, 350.0, 400.0, 450.0], n)
    heat_treatment_time = np.where(
        heat_treatment_temp > 25.0,
        rng.uniform(0.5, 12.0, n),
        0.0,
    )
    roughness_bias = np.array([PREP_ROUGHNESS_BIAS[p] for p in preparation])
    surface_roughness = np.clip(rng.uniform(0.1, 6.0, n) + roughness_bias, 0.05, None)
    surface_hardness = rng.uniform(30.0, 200.0, n)

    return pd.DataFrame(
        {
            "substrate_material": substrate,
            "coating_material": coating,
            "reinforcement": reinforcement,
            "coating_method": method,
            "cooling_method": cooling,
            "surface_preparation": preparation,
            "reinforcement_percentage": reinforcement_pct,
            "particle_size": particle_size,
            "voltage": voltage,
            "current": current,
            "temperature": temperature,
            "pressure": pressure,
            "spray_distance": spray_distance,
            "deposition_time": deposition_time,
            "speed": speed,
            "num_passes": num_passes,
            "heat_treatment_temp": heat_treatment_temp,
            "heat_treatment_time": heat_treatment_time,
            "surface_roughness": surface_roughness,
            "surface_hardness": surface_hardness,
        }
    )


def _generate_targets(features: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    def noise(scale: float) -> np.ndarray:
        return rng.normal(0.0, scale, N_ROWS)

    voltage_n = features["voltage"] / 550.0
    current_n = features["current"] / 60.0
    time_n = features["deposition_time"] / 60.0
    passes_n = (features["num_passes"] - 1) / 5.0
    ht_factor = np.clip(features["heat_treatment_temp"] / 450.0, 0.0, 1.0)

    method_factor = features["coating_method"].map(METHOD_THICKNESS_FACTOR)
    energy = (voltage_n * 0.45 + current_n * 0.35 + time_n * 0.20) ** 0.8

    thickness = (
        4.0
        + 70.0 * energy
        * method_factor
        * (1.0 + 0.25 * passes_n)
        * (1.0 - 0.10 * ht_factor)
        + noise(3.0)
    )
    thickness = thickness.clip(lower=1.5)

    quench_factor = features["cooling_method"].map(QUENCH_POROSITY_FACTOR)
    porosity = (
        2.0
        + 22.0 * current_n * (0.4 + 0.6 * voltage_n)
        * quench_factor
        * (1.0 + 0.08 * features["surface_roughness"])
        * (1.0 - 0.25 * ht_factor)
        * (1.0 - 0.15 * np.clip(features["reinforcement_percentage"] / 15.0, 0.0, 1.0))
        + noise(1.5)
    )
    porosity = porosity.clip(lower=0.5)

    pore_size = (
        0.8
        + 14.0 * voltage_n**1.5
        * (1.0 + 0.05 * np.log1p(features["particle_size"]))
        * (1.0 - 0.20 * ht_factor)
        + noise(0.8)
    )
    pore_size = pore_size.clip(lower=0.05)

    corrosion_bonus = features["coating_material"].map(COATING_CORROSION_BONUS)
    corrosion_resistance = (
        10.0
        + 0.55 * thickness
        - 1.6 * porosity
        - 0.9 * pore_size
        + corrosion_bonus
        + 18.0 * ht_factor
        + noise(4.0)
    )
    corrosion_resistance = corrosion_resistance.clip(lower=1.0)

    substrate_base = features["substrate_material"].map(SUBSTRATE_CORROSION_BASE)
    corrosion_rate = (
        substrate_base
        * 2.4
        * np.exp(-0.03 * thickness)
        * (1.0 + 0.09 * porosity)
        * (1.0 - 0.25 * ht_factor)
        + noise(0.08)
    )
    corrosion_rate = corrosion_rate.clip(lower=0.01)

    has_reinforcement = (features["reinforcement_percentage"] > 0).astype(float)
    fine_particle_bonus = 30.0 * np.exp(-features["particle_size"] / 4.0) * has_reinforcement
    wear_resistance = (
        0.35 * features["surface_hardness"]
        + 6.5 * features["reinforcement_percentage"]
        + 0.9 * thickness
        - 1.8 * porosity
        + fine_particle_bonus
        + 40.0 * ht_factor
        + noise(12.0)
    )
    wear_resistance = wear_resistance.clip(lower=5.0)

    return pd.DataFrame(
        {
            "corrosion_resistance": corrosion_resistance,
            "corrosion_rate": corrosion_rate,
            "coating_thickness": thickness,
            "porosity": porosity,
            "pore_size": pore_size,
            "wear_resistance": wear_resistance,
        }
    )


def _inject_missing_values(df: pd.DataFrame, rng: np.random.Generator, fraction: float = 0.02) -> pd.DataFrame:
    df = df.copy()
    numeric_features = [c for c in ALL_FEATURES if df[c].dtype.kind in "fc"]
    for col in numeric_features:
        mask = rng.random(N_ROWS) < fraction
        df.loc[mask, col] = np.nan
    return df


def generate_dataset(seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    features = _generate_features(rng)
    targets = _generate_targets(features, rng)
    df = pd.concat([features, targets], axis=1)
    return _inject_missing_values(df, rng)


def main() -> None:
    df = generate_dataset()
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    print(f"[DEMO] Synthetic dataset written to {DATA_PATH}")
    print(f"[DEMO] Rows: {len(df)} | Columns: {len(df.columns)}")
    print("[DEMO] NOTE: This data is synthetically generated for development only.")
    print("[DEMO] It is NOT experimental data and must never be presented as real results.")
    print("[DEMO] Target ranges:")
    for target in TARGETS:
        print(f"[DEMO]   {target}: {df[target].min():.3f} .. {df[target].max():.3f}")


if __name__ == "__main__":
    main()
