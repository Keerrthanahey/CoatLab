from __future__ import annotations

from pydantic import BaseModel


# ── Materials ──────────────────────────────────────────────────────────────

class LatticeParameters(BaseModel):
    a: float
    b: float
    c: float
    alpha: float
    beta: float
    gamma: float


class CompositionEntry(BaseModel):
    element: str
    fraction: float


class ElementInfo(BaseModel):
    symbol: str
    name: str
    atomicNumber: int
    atomicMass: float
    group: str
    period: int
    block: str
    electronConfiguration: str


class ThermodynamicProperties(BaseModel):
    formationEnergyPerAtom: float
    energyAboveHull: float
    isStable: bool
    decompositionEnergy: float


class MechanicalProperties(BaseModel):
    bulkModulus: float
    shearModulus: float
    poissonRatio: float
    universalAnisotropy: float


class ElectronicProperties(BaseModel):
    bandGap: float
    isMetal: bool
    valenceElectrons: int


class SurfaceFacet(BaseModel):
    miller: str
    energy: float


class SurfaceProperties(BaseModel):
    facets: list[SurfaceFacet]
    workFunction: float
    notes: str


class SpaceGroup(BaseModel):
    number: int
    symbol: str
    name: str


class MaterialSource(BaseModel):
    provider: str
    note: str


class Material(BaseModel):
    id: str
    symbol: str
    formula: str
    name: str
    category: str
    crystalSystem: str
    spaceGroup: SpaceGroup
    density: float
    volume: float
    lattice: LatticeParameters
    composition: list[CompositionEntry]
    elements: list[ElementInfo]
    thermodynamic: ThermodynamicProperties
    mechanical: MechanicalProperties
    electronic: ElectronicProperties
    surface: SurfaceProperties
    source: MaterialSource


# ── Predictions ────────────────────────────────────────────────────────────

class PredictionInput(BaseModel):
    materialId: str
    electrolyte: str
    concentration: float
    currentDensity: float
    voltage: float
    frequency: float
    dutyCycle: float
    time: float
    temperature: float


class PredictedProperty(BaseModel):
    id: str
    label: str
    value: float
    unit: str | None = None
    description: str


class PredictionModel(BaseModel):
    id: str
    status: str


class PredictionResponse(BaseModel):
    id: str
    generatedAt: str
    materialId: str
    model: PredictionModel
    inputs: PredictionInput
    properties: list[PredictedProperty]
    demo: bool


class SensitivityParameter(BaseModel):
    id: str
    label: str
    unit: str


class SensitivityPoint(BaseModel):
    x: float
    thickness: float
    porosity: float
    corrosion: float


class SensitivityResponse(BaseModel):
    parameter: SensitivityParameter
    min: float
    max: float
    points: list[SensitivityPoint]
    demo: bool


# ── Microstructure ─────────────────────────────────────────────────────────

class PoreBin(BaseModel):
    bin: str
    count: int


class MicrostructureResult(BaseModel):
    id: str
    fileName: str
    analyzedAt: str
    imageWidthPx: int
    imageHeightPx: int
    poreCount: int
    porosity: float
    avgPoreSize: float
    maxPoreSize: float
    minPoreSize: float
    distribution: list[PoreBin]
    demo: bool


# ── Literature ─────────────────────────────────────────────────────────────

class LiteratureStatus(BaseModel):
    documents: int
    indexed: int
    status: str
    lastIndexedAt: str | None = None


class Citation(BaseModel):
    paperId: str
    title: str | None = None
    page: str | None = None
    metric: str | None = None


class LiteratureQueryResult(BaseModel):
    id: str
    answer: str
    citations: list[Citation]
    demo: bool


# ── Dataset ────────────────────────────────────────────────────────────────

class DatasetSummary(BaseModel):
    totalRecords: int
    status: str
    lastUpdated: str | None = None


class DatasetRecord(BaseModel):
    paperId: str
    material: str
    electrolyte: str
    concentration: float | None = None
    currentDensity: float | None = None
    voltage: float | None = None
    frequency: float | None = None
    dutyCycle: float | None = None
    time: float | None = None
    temperature: float | None = None
    coatingThickness: float | None = None
    porosity: float | None = None
    poreSize: float | None = None
    corrosionResistance: float | None = None
    wearResistance: float | None = None
    fractureParameter: float | None = None


# ── Model ──────────────────────────────────────────────────────────────────

class ModelStatus(BaseModel):
    trained: bool
    status: str
    modelId: str
    lastTrainedAt: str | None = None
    datasetRows: int
    features: list[str]
    targets: list[str]


class ModelMetrics(BaseModel):
    r2: float | None = None
    mae: float | None = None
    rmse: float | None = None
    mape: float | None = None
