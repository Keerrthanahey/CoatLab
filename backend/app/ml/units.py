"""Canonical unit definitions for CoatLab features and targets.

Every ML feature and prediction target has a documented unit. The pipeline
NEVER invents conversion factors; when source units are unknown the system
reports raw values with a note that units are unverified.
"""

from __future__ import annotations

# Feature units (input)
FEATURE_UNITS: dict[str, str] = {
    # Categorical — no units
    "substrate_material": "",
    "coating_material": "",
    "reinforcement": "",
    "coating_method": "",
    "electrolyte_composition": "",
    "current_voltage_mode": "",
    "ac_dc_mode": "",
    "cooling_method": "",
    "surface_preparation": "",
    # Numeric
    "reinforcement_percentage": "%",
    "particle_size": "μm",
    "current_density": "A/dm²",
    "voltage": "V",
    "frequency": "Hz",
    "duty_cycle": "%",
    "treatment_time": "min",
    "temperature": "°C",
    "pressure": "bar",
    "spray_distance": "mm",
    "surface_roughness": "μm Ra",
    "heat_treatment_temperature": "°C",
    "heat_treatment_time": "min",
    "speed": "mm/s",
    "num_passes": "×",
    "surface_hardness": "HV",
}

# Target units (output)
TARGET_UNITS: dict[str, str] = {
    "corrosion_resistance": "%",
    "corrosion_rate": "mm/yr",
    "coating_thickness": "μm",
    "porosity": "%",
    "pore_size": "μm",
    "wear_resistance": "%",
}

# Numeric validation ranges — (min, max)
NUMERIC_RANGES: dict[str, tuple[float, float]] = {
    "reinforcement_percentage": (0.0, 50.0),
    "particle_size": (0.0, 500.0),
    "current_density": (0.0, 200.0),
    "voltage": (0.0, 1000.0),
    "frequency": (0.0, 10000.0),
    "duty_cycle": (0.0, 100.0),
    "treatment_time": (0.0, 600.0),
    "temperature": (0.0, 1000.0),
    "pressure": (0.0, 50.0),
    "spray_distance": (0.0, 500.0),
    "surface_roughness": (0.0, 50.0),
    "heat_treatment_temperature": (0.0, 1200.0),
    "heat_treatment_time": (0.0, 480.0),
    "speed": (0.0, 500.0),
    "num_passes": (1.0, 20.0),
    "surface_hardness": (0.0, 300.0),
}
