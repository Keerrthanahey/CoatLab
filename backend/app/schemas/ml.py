from __future__ import annotations

from pydantic import BaseModel, Field


class CoatingInput(BaseModel):
    substrate_material: str = "Mg"
    coating_material: str = "Al2O3"
    reinforcement: str = "none"
    reinforcement_percentage: float = 0.0
    particle_size: float = 50.0
    coating_method: str = "PEO"
    voltage: float = 200.0
    current: float = 5.0
    temperature: float = 25.0
    pressure: float = 1.0
    spray_distance: float = 100.0
    deposition_time: float = 10.0
    speed: float = 50.0
    num_passes: int = 1
    heat_treatment_temp: float = 0.0
    heat_treatment_time: float = 0.0
    cooling_method: str = "air"
    surface_roughness: float = 5.0
    surface_preparation: str = "ground"
    surface_hardness: float = 80.0


class CoatingPrediction(BaseModel):
    corrosion_resistance: float
    corrosion_rate: float
    coating_thickness: float
    porosity: float
    pore_size: float
    wear_resistance: float
    demo: bool = True
    model_id: str = "coatlab-rf-v1"


class RankedCombination(BaseModel):
    rank: int
    params: dict
    predictions: CoatingPrediction
    overall_score: float


class OptimizationRequest(BaseModel):
    ranges: dict[str, list]
    weights: dict[str, float] = Field(default_factory=lambda: {
        "corrosion_resistance": 0.30,
        "wear_resistance": 0.25,
        "corrosion_rate": 0.20,
        "porosity": 0.15,
        "coating_thickness": 0.05,
        "pore_size": 0.05,
    })
    max_combinations: int = 1000


class OptimizationResult(BaseModel):
    total_evaluated: int
    ranked: list[RankedCombination]
    demo: bool = True


class ModelInfo(BaseModel):
    trained: bool
    model_id: str = "coatlab-rf-v1"
    trained_at: str | None = None
    dataset_rows: int = 0
    metrics: dict = {}
    feature_count: int = 0
    target_count: int = 6
    demo: bool = True


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
    demo: bool = True


class FigureExtractionResult(BaseModel):
    axes_detected: bool
    data_points: list[dict]
    x_label: str | None = None
    y_label: str | None = None
    confidence: float
    notes: str
    demo: bool = True
