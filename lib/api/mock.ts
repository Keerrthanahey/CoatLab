import type { ApiClient } from "./contract";
import { magnesium, materials } from "@/lib/mock-data/materials";
import { mockPredict, mockSensitivity } from "@/lib/mock-data/prediction";
import { mockAnalyzeMicrostructure } from "@/lib/mock-data/microstructure";
import { emptyLiteratureStatus, mockLiteratureQuery } from "@/lib/mock-data/literature";
import { emptyDatasetSummary, generateSampleRows } from "@/lib/mock-data/dataset";
import { emptyMetrics, modelStatus } from "@/lib/mock-data/model";
import type { DatasetRecord } from "@/lib/types";

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API client — simulates realistic latency and typed responses.
 * Swapped for the live HTTP client when the backend is available.
 */
export const mockApi: ApiClient = {
  materials: {
    async list() {
      await delay(250);
      return materials;
    },
    async get(id) {
      await delay(300);
      if (id === magnesium.id) return magnesium;
      throw new Error(`Material ${id} not found in the demo index.`);
    },
  },

  async predict(input) {
    await delay(1200);
    return mockPredict(input);
  },

  async sensitivity(parameterId, _input) {
    void _input;
    await delay(200);
    return mockSensitivity(parameterId);
  },

  async analyzeMicrostructure(fileName) {
    await delay(1400);
    return mockAnalyzeMicrostructure(fileName);
  },

  literature: {
    async status() {
      await delay(200);
      return emptyLiteratureStatus;
    },
    async upload(files) {
      await delay(600);
      // Demo only: ingestion requires the LangChain/LlamaIndex pipeline.
      void files;
      return { accepted: 0, demo: true };
    },
    async query(question) {
      await delay(900);
      return mockLiteratureQuery(question);
    },
  },

  dataset: {
    async summary() {
      await delay(200);
      return emptyDatasetSummary;
    },
    async records() {
      await delay(250);
      return [] as DatasetRecord[];
    },
  },

  model: {
    async status() {
      await delay(200);
      return modelStatus;
    },
    async metrics() {
      await delay(200);
      return emptyMetrics;
    },
  },
};

/** Sample dataset rows for exercising the table UI. Not part of the API. */
export const sampleDatasetRows: DatasetRecord[] = generateSampleRows(48);
