"""Feature definitions for the CoatLab ML pipeline.

Canonical feature names used throughout preprocessing, training, prediction,
optimization, and the agent. All modules must import from here to stay
consistent.
"""

from __future__ import annotations

# ── Material inputs ─────────────────────────────────────────────────────────

SUBSTRATE_MATERIALS: list[str] = ["Magnesium", "Aluminum", "Zirconium", "Tantalum"]
COATING_MATERIALS: list[str] = [
    "Magnesium", "Aluminum", "Zirconium", "Tantalum",
    "MgO", "Al2O3", "ZrO2", "TiO2",
]
REINFORCEMENTS: list[str] = ["none", "SiC", "Al2O3", "TiO2", "graphene", "Si3N4", "ZrO2"]
COATING_METHODS: list[str] = ["PEO", "anodizing", "plasma_spray", "electrodeposition", "sol_gel"]
ELECTROLYTES: list[str] = [
    "NaOH", "KOH", "aluminate", "silicate", "phosphate",
    "fluoride", "mixed_oxide",
]
COOLING_METHODS: list[str] = ["air", "water", "oil", "furnace"]
SURFACE_PREPARATIONS: list[str] = ["ground", "polished", "sandblasted", "as_received"]
CURRENT_VOLTAGE_MODES: list[str] = ["constant_current", "constant_voltage"]
AC_DC_MODES: list[str] = ["AC", "DC"]

# ── Categorical feature names ───────────────────────────────────────────────

CATEGORICAL_FEATURES: list[str] = [
    "substrate_material",
    "coating_material",
    "reinforcement",
    "coating_method",
    "electrolyte_composition",
    "current_voltage_mode",
    "ac_dc_mode",
    "cooling_method",
    "surface_preparation",
]

# ── Numeric feature names ───────────────────────────────────────────────────

NUMERIC_FEATURES: list[str] = [
    "reinforcement_percentage",
    "particle_size",
    "current_density",
    "voltage",
    "frequency",
    "duty_cycle",
    "treatment_time",
    "temperature",
    "pressure",
    "spray_distance",
    "surface_roughness",
    "heat_treatment_temperature",
    "heat_treatment_time",
    "speed",
    "num_passes",
    "surface_hardness",
]

# ── Alias mapping ───────────────────────────────────────────────────────────
# Accept older / alternative parameter names from user input and map them to
# the canonical feature names before feeding into the ML pipeline.

ALIASES: dict[str, str] = {
    "current": "current_density",
    "current_density_A_dm2": "current_density",
    "deposition_time": "treatment_time",
    "heat_treatment_temp": "heat_treatment_temperature",
}


def resolve_aliases(params: dict) -> dict:
    """Return a new dict with aliases resolved to canonical names."""
    resolved = {}
    for k, v in params.items():
        resolved[ALIASES.get(k, k)] = v
    return resolved


# ── Targets ─────────────────────────────────────────────────────────────────

TARGETS: list[str] = [
    "corrosion_resistance",
    "corrosion_rate",
    "coating_thickness",
    "porosity",
    "pore_size",
    "wear_resistance",
]

# ── Convenience ─────────────────────────────────────────────────────────────

ALL_FEATURES: list[str] = CATEGORICAL_FEATURES + NUMERIC_FEATURES
