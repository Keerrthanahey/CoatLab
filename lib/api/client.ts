import type { ApiClient } from "./contract";
import { mockApi } from "./mock";
import { liveApi } from "./live";

/**
 * Canonical endpoint map — the single source of truth for the future
 * FastAPI routes. Kept here so the UI layer and any future docs/tests can
 * reference them without scattering URL strings.
 */
export const API_ENDPOINTS = {
  materials: {
    list: "/api/materials",
    get: (id: string) => `/api/materials/${id}`,
  },
  predict: "/api/predict",
  sensitivity: "/api/predict/sensitivity",
  analyzeMicrostructure: "/api/analyze-microstructure",
  literature: {
    status: "/api/literature/status",
    upload: "/api/literature/upload",
    query: "/api/literature/query",
  },
  dataset: {
    summary: "/api/dataset/summary",
    records: "/api/dataset/records",
  },
  model: {
    status: "/api/model/status",
    metrics: "/api/model/metrics",
  },
} as const;

export const isMockMode = !process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * The single API facade used across the app. Set NEXT_PUBLIC_API_BASE_URL
 * to switch from the mock client to the live FastAPI client.
 */
export const api: ApiClient = isMockMode ? mockApi : liveApi;
