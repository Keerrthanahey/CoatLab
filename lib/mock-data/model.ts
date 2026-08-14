import type { ModelStatus, ModelMetrics } from "@/lib/types";

export const modelStatus: ModelStatus = {
  trained: false,
  status: "not_trained",
  modelId: "coatlab-regressor-v0",
  lastTrainedAt: null,
  datasetRows: 0,
  features: [
    "electrolyte (categorical)",
    "concentration",
    "current_density",
    "voltage",
    "frequency",
    "duty_cycle",
    "time",
    "temperature",
  ],
  targets: [
    "coating_thickness",
    "porosity",
    "pore_size",
    "corrosion_resistance",
    "wear_resistance",
    "fracture_parameter",
  ],
};

export const emptyMetrics: ModelMetrics = {
  r2: null,
  mae: null,
  rmse: null,
  mape: null,
};
