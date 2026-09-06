from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


# ── Input schemas ───────────────────────────────────────────────────────────

class CoatingInput(BaseModel):
    """Full material-aware coating input.

    Accepts Magnesium / Aluminum / Zirconium / Tantalum as both substrate
    and coating material, plus electrochemical process parameters for
    PEO / anodizing / electrodeposition workflows.
    """

    # Material system
    substrate_material: str = "Magnesium"
    coating_material: str = "Al2O3"
    reinforcement: str = "none"
    reinforcement_percentage: float = Field(default=0.0, ge=0.0, le=50.0)
    particle_size: float = Field(default=5.0, ge=0.0, le=500.0)

    # Process
    coating_method: str = "PEO"
    electrolyte_composition: str = "NaOH"
    current_voltage_mode: str = "constant_current"
    ac_dc_mode: str = "DC"

    # Electrochemical
    current_density: float = Field(default=10.0, ge=0.0, le=200.0)
    voltage: float = Field(default=200.0, ge=0.0, le=1000.0)
    frequency: float = Field(default=0.0, ge=0.0, le=10000.0)
    duty_cycle: float = Field(default=50.0, ge=0.0, le=100.0)
    treatment_time: float = Field(default=30.0, ge=0.0, le=600.0)

    # Thermal / spray
    temperature: float = Field(default=25.0, ge=0.0, le=1000.0)
    pressure: float = Field(default=1.0, ge=0.0, le=50.0)
    spray_distance: float = Field(default=100.0, ge=0.0, le=500.0)
    speed: float = Field(default=10.0, ge=0.0, le=500.0)
    num_passes: int = Field(default=1, ge=1, le=20)

    # Heat treatment
    heat_treatment_temperature: float = Field(default=25.0, ge=0.0, le=1200.0)
    heat_treatment_time: float = Field(default=0.0, ge=0.0, le=480.0)
    cooling_method: str = "air"

    # Surface condition
    surface_roughness: float = Field(default=1.0, ge=0.0, le=50.0)
    surface_preparation: str = "ground"
    surface_hardness: float = Field(default=80.0, ge=0.0, le=300.0)

    @field_validator("duty_cycle")
    @classmethod
    def validate_duty_cycle(cls, v: float) -> float:
        if v < 0 or v > 100:
            raise ValueError("duty_cycle must be between 0 and 100")
        return v

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, v: float) -> float:
        if v < 0:
            raise ValueError("frequency must be >= 0")
        return v


# ── Prediction response ─────────────────────────────────────────────────────

class PredictedOutputs(BaseModel):
    corrosion_resistance: float
    corrosion_rate: float
    coating_thickness: float
    porosity: float
    pore_size: float
    wear_resistance: float


class CoatingPrediction(BaseModel):
    predictions: PredictedOutputs
    prediction_status: str = "success"
    data_status: str = "synthetic"
    demo_status: str = "DEMO — model trained on synthetic data"
    model_name: str = "coatlab-gb-v1"
    demo: bool = True


# ── Optimization ────────────────────────────────────────────────────────────

class ObjectiveWeights(BaseModel):
    corrosion_resistance: float = Field(default=0.30, ge=0.0, le=1.0)
    wear_resistance: float = Field(default=0.25, ge=0.0, le=1.0)
    corrosion_rate: float = Field(default=0.20, ge=0.0, le=1.0)
    porosity: float = Field(default=0.15, ge=0.0, le=1.0)
    coating_thickness: float = Field(default=0.05, ge=0.0, le=1.0)
    pore_size: float = Field(default=0.05, ge=0.0, le=1.0)


class OptimizationRequest(BaseModel):
    ranges: dict[str, list]
    weights: ObjectiveWeights = Field(default_factory=ObjectiveWeights)
    max_combinations: int = Field(default=1000, ge=1, le=100_000)


class OptimizationEntry(BaseModel):
    rank: int
    params: dict
    predicted_outputs: PredictedOutputs
    score: float
    objective_weights: ObjectiveWeights


class OptimizationResult(BaseModel):
    total_evaluated: int
    best_combination: OptimizationEntry
    top_10_combinations: list[OptimizationEntry]
    predicted_outputs: PredictedOutputs
    score: float
    objective_weights: ObjectiveWeights
    data_status: str = "synthetic"
    demo_status: str = "DEMO OPTIMIZATION — not experimentally validated"
    demo: bool = True


# ── Model info ──────────────────────────────────────────────────────────────

class ModelInfo(BaseModel):
    trained: bool
    model_name: str = "coatlab-gb-v1"
    trained_at: str | None = None
    dataset_rows: int = 0
    metrics: dict = {}
    feature_count: int = 0
    target_count: int = 6
    supported_substrates: list[str] = []
    supported_coatings: list[str] = []
    data_status: str = "synthetic"
    demo: bool = True


# ── Morphology / Figure ─────────────────────────────────────────────────────

class MorphologyResult(BaseModel):
    image_width: int
    image_height: int
    pore_count: int
    porosity_percent: float
    avg_pore_size: float
    max_pore_size: float
    min_pore_size: float
    distribution: list[dict]
    classification: str
    calibration: str = "pixel units (no calibration provided)"
    demo: bool = True


class FigureExtractionResult(BaseModel):
    title_detected: str | None = None
    axes_detected: bool
    x_label: str | None = None
    y_label: str | None = None
    data_points: list[dict]
    approximate_values: list[dict] = []
    confidence: float
    notes: str
    demo: bool = True
