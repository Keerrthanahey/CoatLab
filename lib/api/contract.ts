import type {
  DatasetRecord,
  DatasetSummary,
  LiteratureQueryResult,
  LiteratureStatus,
  Material,
  MicrostructureResult,
  MLModelInfo,
  ModelMetrics,
  ModelStatus,
  PredictionInput,
  PredictionResponse,
  SensitivityResponse,
} from "@/lib/types";

export interface CoatingPredictions {
  corrosion_resistance: number;
  corrosion_rate: number;
  coating_thickness: number;
  porosity: number;
  pore_size: number;
  wear_resistance: number;
}

export interface CoatingPrediction {
  predictions: CoatingPredictions;
  prediction_status: string;
  data_status: string;
  demo_status: string;
  model_name: string;
  demo: boolean;
}

export interface CoatingInput {
  substrate_material?: string;
  coating_material?: string;
  reinforcement?: string;
  reinforcement_percentage?: number;
  particle_size?: number;
  coating_method?: string;
  electrolyte_composition?: string;
  current_voltage_mode?: string;
  ac_dc_mode?: string;
  current_density?: number;
  voltage?: number;
  frequency?: number;
  duty_cycle?: number;
  treatment_time?: number;
  temperature?: number;
  pressure?: number;
  spray_distance?: number;
  heat_treatment_temperature?: number;
  heat_treatment_time?: number;
  cooling_method?: string;
  surface_roughness?: number;
  surface_preparation?: string;
  surface_hardness?: number;
  speed?: number;
  num_passes?: number;
}

export interface ObjectiveWeights {
  corrosion_resistance?: number;
  wear_resistance?: number;
  corrosion_rate?: number;
  porosity?: number;
  coating_thickness?: number;
  pore_size?: number;
}

export interface OptimizationRequest {
  ranges: Record<string, number[]>;
  weights?: ObjectiveWeights;
  max_combinations?: number;
}

export interface OptimizationEntry {
  rank: number;
  params: Record<string, unknown>;
  predicted_outputs: CoatingPredictions;
  score: number;
  objective_weights: ObjectiveWeights;
}

export interface OptimizationResult {
  total_evaluated: number;
  best_combination: OptimizationEntry;
  top_10_combinations: OptimizationEntry[];
  predicted_outputs: CoatingPredictions;
  score: number;
  objective_weights: ObjectiveWeights;
  data_status: string;
  demo_status: string;
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
    modelInfo(): Promise<MLModelInfo>;
  };
  agent: {
    chat(message: string): Promise<AgentChatResponse>;
  };
}
