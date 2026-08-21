import type {
  DatasetRecord,
  DatasetSummary,
  LiteratureQueryResult,
  LiteratureStatus,
  Material,
  MicrostructureResult,
  ModelMetrics,
  ModelStatus,
  PredictionInput,
  PredictionResponse,
  SensitivityResponse,
} from "@/lib/types";

export interface CoatingPrediction {
  corrosion_resistance: number;
  corrosion_rate: number;
  coating_thickness: number;
  porosity: number;
  pore_size: number;
  wear_resistance: number;
  demo: boolean;
  model_id: string;
}

export interface CoatingInput {
  substrate_material?: string;
  coating_material?: string;
  reinforcement?: string;
  reinforcement_percentage?: number;
  particle_size?: number;
  coating_method?: string;
  voltage?: number;
  current?: number;
  temperature?: number;
  pressure?: number;
  spray_distance?: number;
  deposition_time?: number;
  speed?: number;
  num_passes?: number;
  heat_treatment_temp?: number;
  heat_treatment_time?: number;
  cooling_method?: string;
  surface_roughness?: number;
  surface_preparation?: string;
  surface_hardness?: number;
}

export interface OptimizationRequest {
  ranges: Record<string, number[]>;
  weights?: Record<string, number>;
  max_combinations?: number;
}

export interface RankedCombo {
  rank: number;
  params: Record<string, unknown>;
  predictions: CoatingPrediction;
  overall_score: number;
}

export interface OptimizationResult {
  total_evaluated: number;
  ranked: RankedCombo[];
  demo: boolean;
}

export interface AgentChatResponse {
  response: string;
  tool_calls: Array<{ name: string; content: string }>;
  demo: boolean;
  error: string | null;
}

/**
 * The service contract shared by the mock and live API clients.
 *
 * The UI only ever talks to `api` (see client.ts). When the FastAPI
 * backend ships, the flag `NEXT_PUBLIC_API_BASE_URL` switches the app to
 * the real HTTP client — no component changes required.
 */
export interface ApiClient {
  materials: {
    list(): Promise<Material[]>;
    get(id: string): Promise<Material>;
  };
  predict(input: PredictionInput): Promise<PredictionResponse>;
  sensitivity(parameterId: string, input: PredictionInput): Promise<SensitivityResponse>;
  analyzeMicrostructure(fileName: string): Promise<MicrostructureResult>;
  literature: {
    status(): Promise<LiteratureStatus>;
    upload(files: File[]): Promise<{ accepted: number; demo: true }>;
    query(question: string): Promise<LiteratureQueryResult>;
  };
  dataset: {
    summary(): Promise<DatasetSummary>;
    records(): Promise<DatasetRecord[]>;
  };
  model: {
    status(): Promise<ModelStatus>;
    metrics(): Promise<ModelMetrics>;
  };
  ml: {
    predict(input: CoatingInput): Promise<CoatingPrediction>;
    optimize(request: OptimizationRequest): Promise<OptimizationResult>;
    modelInfo(): Promise<Record<string, unknown>>;
  };
  agent: {
    chat(message: string): Promise<AgentChatResponse>;
  };
}
