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
}
