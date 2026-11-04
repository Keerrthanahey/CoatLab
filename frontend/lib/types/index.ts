/* =====================================================================
 * Shared domain types for the CoatLab platform.
 *
 * These types define the contract between the UI and the (future)
 * FastAPI backend. Every API response is strongly typed here so the
 * frontend never needs to change when the mock services are swapped
 * for the real ML / literature / materials pipelines.
 * ===================================================================== */

/* ----------------------------- Materials ----------------------------- */

export interface ElementInfo {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number; // u
  group: string;
  period: number;
  block: "s" | "p" | "d" | "f";
  electronConfiguration: string;
}

export interface LatticeParameters {
  a: number; // Å
  b: number; // Å
  c: number; // Å
  alpha: number; // degrees
  beta: number; // degrees
  gamma: number; // degrees
}

export interface CompositionEntry {
  element: string;
  fraction: number; // 0..1
}

export interface ThermodynamicProperties {
  formationEnergyPerAtom: number; // eV/atom (negative = exothermic)
  energyAboveHull: number; // eV/atom
  isStable: boolean;
  decompositionEnergy: number; // eV/atom
}

export interface MechanicalProperties {
  bulkModulus: number; // GPa
  shearModulus: number; // GPa
  poissonRatio: number;
  universalAnisotropy: number;
}

export interface ElectronicProperties {
  bandGap: number; // eV (0 = metallic)
  isMetal: boolean;
  valenceElectrons: number;
}

export interface SurfaceFacet {
  miller: string; // e.g. "(0001)"
  energy: number; // J/m²
}

export interface SurfaceProperties {
  facets: SurfaceFacet[];
  workFunction: number; // eV
  notes: string;
}

export interface Material {
  id: string; // e.g. "mp-153"
  symbol: string; // "Mg"
  formula: string; // "Mg"
  name: string; // "Magnesium"
  category: string; // "metal"
  crystalSystem: string;
  spaceGroup: {
    number: number;
    symbol: string; // "P63/mmc"
    name: string;
  };
  density: number; // g/cm³
  volume: number; // Å³/atom (or per cell)
  lattice: LatticeParameters;
  composition: CompositionEntry[];
  elements: ElementInfo[];
  thermodynamic: ThermodynamicProperties;
  mechanical: MechanicalProperties;
  electronic: ElectronicProperties;
  surface: SurfaceProperties;
  source: {
    provider: string;
    note: string;
  };
}

/* --------------------------- Predictions ----------------------------- */

export type ParameterType = "text" | "number" | "select";

export interface ParameterDefinition {
  id: string;
  label: string;
  type: ParameterType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
}

export interface PredictionInput {
  materialId: string;
  electrolyte: string;
  concentration: number; // mol/L
  currentDensity: number; // A/dm²
  voltage: number; // V
  frequency: number; // Hz
  dutyCycle: number; // %
  time: number; // min
  temperature: number; // °C
}

export interface PredictedProperty {
  id: string;
  label: string;
  value: number;
  unit?: string;
  description: string;
}

export interface PredictionResponse {
  id: string;
  generatedAt: string; // ISO
  materialId: string;
  model: { id: string; status: "not_trained" };
  inputs: PredictionInput;
  properties: PredictedProperty[];
  demo: true;
}

export interface SensitivityPoint {
  x: number;
  thickness: number; // μm
  porosity: number; // %
  corrosion: number; // relative score
}

export interface SensitivityResponse {
  parameter: { id: string; label: string; unit: string };
  min: number;
  max: number;
  points: SensitivityPoint[];
  demo: true;
}

/* -------------------------- Microstructure --------------------------- */

export interface PoreBin {
  bin: string; // label, e.g. "0.5–1.0"
  count: number;
}

export interface MicrostructureResult {
  id: string;
  fileName: string;
  analyzedAt: string; // ISO
  imageWidthPx: number;
  imageHeightPx: number;
  poreCount: number;
  porosity: number; // %
  avgPoreSize: number; // μm
  maxPoreSize: number; // μm
  minPoreSize: number; // μm
  distribution: PoreBin[];
  demo: true;
}

/* ---------------------------- Literature ----------------------------- */

export type LiteratureStatusState = "not_indexed" | "indexing" | "ready";

export interface LiteratureStatus {
  documents: number;
  indexed: number;
  status: LiteratureStatusState;
  lastIndexedAt: string | null;
}

export interface Citation {
  paperId: string;
  title?: string;
  page?: string;
  metric?: string;
}

export interface LiteratureQueryResult {
  id: string;
  answer: string;
  citations: Citation[];
  demo: true;
}

/* ------------------------------ Dataset ------------------------------ */

export interface DatasetRecord {
  paperId: string;
  material: string;
  electrolyte: string;
  concentration: number | null;
  currentDensity: number | null;
  voltage: number | null;
  frequency: number | null;
  dutyCycle: number | null;
  time: number | null;
  temperature: number | null;
  coatingThickness: number | null;
  porosity: number | null;
  poreSize: number | null;
  corrosionResistance: number | null;
  wearResistance: number | null;
  fractureParameter: number | null;
}

export type DatasetStatus = "awaiting_literature" | "ready";

export interface DatasetSummary {
  totalRecords: number;
  status: DatasetStatus;
  lastUpdated: string | null;
}

/* ------------------------------- Model ------------------------------- */

export interface ModelStatus {
  trained: boolean;
  status: "not_trained";
  modelId: string;
  lastTrainedAt: string | null;
  datasetRows: number;
  features: string[];
  targets: string[];
}

export interface ModelMetrics {
  r2: number | null;
  mae: number | null;
  rmse: number | null;
  mape: number | null;
}
