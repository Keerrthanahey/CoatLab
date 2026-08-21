import type { AgentChatResponse, ApiClient, CoatingPrediction, OptimizationResult } from "./contract";
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

  ml: {
    async predict(): Promise<CoatingPrediction> {
      await delay(800);
      return {
        corrosion_resistance: 82.5,
        corrosion_rate: 0.215,
        coating_thickness: 65.3,
        porosity: 4.8,
        pore_size: 12.6,
        wear_resistance: 78.0,
        demo: true,
        model_id: "coatlab-mock-v1",
      };
    },
    async optimize(): Promise<OptimizationResult> {
      await delay(1200);
      return {
        total_evaluated: 0,
        ranked: [],
        demo: true,
      };
    },
    async modelInfo() {
      await delay(200);
      return { trained: false, demo: true };
    },
  },

  agent: {
    async chat(message: string): Promise<AgentChatResponse> {
      await delay(1500);
      void message;
      return {
        response:
          "This is a mock response from the CoatLab agent. " +
          "Connect the backend with GOOGLE_API_KEY configured to enable AI chat.",
        tool_calls: [],
        demo: true,
        error: null,
      };
    },
  },
};

/** Sample dataset rows for exercising the table UI. Not part of the API. */
export const sampleDatasetRows: DatasetRecord[] = generateSampleRows(48);
