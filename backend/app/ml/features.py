from __future__ import annotations

CATEGORICAL_FEATURES: list[str] = [
    "substrate_material",
    "coating_material",
    "reinforcement",
    "coating_method",
    "cooling_method",
    "surface_preparation",
]

NUMERIC_FEATURES: list[str] = [
    "reinforcement_percentage",
    "particle_size",
    "voltage",
    "current",
    "temperature",
    "pressure",
    "spray_distance",
    "deposition_time",
    "speed",
    "num_passes",
    "heat_treatment_temp",
    "heat_treatment_time",
    "surface_roughness",
    "surface_hardness",
]

TARGETS: list[str] = [
    "corrosion_resistance",
    "corrosion_rate",
    "coating_thickness",
    "porosity",
    "pore_size",
    "wear_resistance",
]

ALL_FEATURES: list[str] = CATEGORICAL_FEATURES + NUMERIC_FEATURES
