import type { AgentChatResponse, ApiClient, CoatingInput, CoatingPrediction, OptimizationRequest, OptimizationResult } from "./contract";

/**
 * Live HTTP client for the FastAPI backend.
 *
 * Activated automatically when NEXT_PUBLIC_API_BASE_URL is set, e.g.
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
 *
 * Endpoints:
 *   GET  /api/health
 *   GET  /api/materials/{id}
 *   POST /api/predict
 *   POST /api/predict/sensitivity
 *   POST /api/analyze-microstructure
 *   POST /api/literature/upload
 *   POST /api/literature/query
 *   GET  /api/dataset/summary
 *   GET  /api/dataset/records
 *   GET  /api/model/status
 *   GET  /api/model/metrics
 *   POST /api/ml/predict
 *   POST /api/ml/optimize
 *   GET  /api/ml/model-info
 *   POST /api/agent/chat
 */
function createLiveClient(baseUrl: string): ApiClient {
  const TIMEOUT_MS = 30_000;

  async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          body || `API error ${res.status} on ${path}`,
        );
      }
      const text = await res.text();
      return (text ? JSON.parse(text) : (undefined as T)) as T;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error(`Request timed out on ${path}`);
      }
      if (err instanceof TypeError && String(err).includes("Failed to fetch")) {
        throw new Error(
          `Network error — is the backend running at ${baseUrl}?`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    materials: {
      list: () => http(`/api/materials`),
      get: (id) => http(`/api/materials/${id}`),
    },
    predict: (input) =>
      http(`/api/predict`, { method: "POST", body: JSON.stringify(input) }),
    sensitivity: (parameterId, input) =>
      http(`/api/predict/sensitivity`, {
        method: "POST",
        body: JSON.stringify({ parameterId, inputs: input }),
      }),
    analyzeMicrostructure: (fileName) =>
      http(`/api/analyze-microstructure`, {
        method: "POST",
        body: JSON.stringify({ fileName }),
      }),
    literature: {
      status: () => http(`/api/literature/status`),
      upload: (files) => {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        return http(`/api/literature/upload`, { method: "POST", body: form });
      },
      query: (question) =>
        http(`/api/literature/query`, {
          method: "POST",
          body: JSON.stringify({ question }),
        }),
    },
    dataset: {
      summary: () => http(`/api/dataset/summary`),
      records: () => http(`/api/dataset/records`),
    },
    model: {
      status: () => http(`/api/model/status`),
      metrics: () => http(`/api/model/metrics`),
    },
    ml: {
      predict: (input: CoatingInput): Promise<CoatingPrediction> =>
        http(`/api/ml/predict`, { method: "POST", body: JSON.stringify(input) }),
      optimize: (request: OptimizationRequest): Promise<OptimizationResult> =>
        http(`/api/ml/optimize`, { method: "POST", body: JSON.stringify(request) }),
      modelInfo: (): Promise<Record<string, unknown>> =>
        http(`/api/ml/model-info`),
    },
    agent: {
      chat: (message: string): Promise<AgentChatResponse> =>
        http(`/api/agent/chat`, {
          method: "POST",
          body: JSON.stringify({ message }),
        }),
    },
  };
}

export const liveApi: ApiClient = createLiveClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
);
