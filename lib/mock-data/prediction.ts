import type {
  ParameterDefinition,
  PredictionInput,
  PredictionResponse,
  PredictedProperty,
  SensitivityResponse,
} from "@/lib/types";

/**
 * Parameter schema for the prediction form.
 *
 * The form is rendered directly from this array — adding a new process
 * parameter requires only appending an entry here (and the mock generator
 * below). No UI component changes are needed.
 */
export const parameterDefinitions: ParameterDefinition[] = [
  {
    id: "electrolyte",
    label: "Electrolyte",
    type: "text",
    defaultValue: "",
    placeholder: "e.g. Na2SiO3",
    help: "Bath chemistry used for coating deposition.",
  },
  {
    id: "concentration",
    label: "Electrolyte concentration",
    unit: "mol/L",
    type: "number",
    min: 0.01,
    max: 5,
    step: 0.01,
    defaultValue: "0.5",
    help: "Molar concentration of the primary electrolyte salt.",
  },
  {
    id: "currentDensity",
    label: "Current density",
    unit: "A/dm²",
    type: "number",
    min: 0.1,
    max: 50,
    step: 0.1,
    defaultValue: "3.0",
  },
  {
    id: "voltage",
    label: "Voltage",
    unit: "V",
    type: "number",
    min: 1,
    max: 600,
    step: 1,
    defaultValue: "180",
  },
  {
    id: "frequency",
    label: "Frequency",
    unit: "Hz",
    type: "number",
    min: 0,
    max: 5000,
    step: 1,
    defaultValue: "1000",
  },
  {
    id: "dutyCycle",
    label: "Duty cycle",
    unit: "%",
    type: "number",
    min: 1,
    max: 100,
    step: 1,
    defaultValue: "40",
  },
  {
    id: "time",
    label: "Processing time",
    unit: "min",
    type: "number",
    min: 0.5,
    max: 240,
    step: 0.5,
    defaultValue: "10",
  },
  {
    id: "temperature",
    label: "Temperature",
    unit: "°C",
    type: "number",
    min: 0,
    max: 200,
    step: 1,
    defaultValue: "25",
  },
];

/** Suggested electrolytes shown as autocomplete options. */
export const electrolyteSuggestions = [
  "Na2SiO3",
  "KOH",
  "NaOH",
  "Na3PO4",
  "KF",
  "NaAlO2",
  "MgO suspension",
  "Ca(OH)2",
];

const units: Record<string, string> = {
  concentration: "mol/L",
  currentDensity: "A/dm²",
  voltage: "V",
  frequency: "Hz",
  dutyCycle: "%",
  time: "min",
  temperature: "°C",
};

/**
 * Demo prediction values. These are deliberately fixed, clearly-labelled
 * demonstration outputs and must never be treated as scientific results.
 */
const demoProperties: PredictedProperty[] = [
  {
    id: "thickness",
    label: "Coating thickness",
    value: 42.6,
    unit: "μm",
    description: "Estimated oxide layer thickness for the given conditions.",
  },
  {
    id: "porosity",
    label: "Porosity",
    value: 3.8,
    unit: "%",
    description: "Volume fraction of open/closed pores in the coating.",
  },
  {
    id: "poreSize",
    label: "Average pore size",
    value: 2.13,
    unit: "μm",
    description: "Mean feret diameter of detected pores.",
  },
  {
    id: "corrosion",
    label: "Corrosion resistance",
    value: 91.4,
    unit: "score",
    description: "Composite score from polarization / salt-spray proxies.",
  },
  {
    id: "wear",
    label: "Wear resistance",
    value: 87.2,
    unit: "score",
    description: "Relative wear performance from tribological proxies.",
  },
  {
    id: "fracture",
    label: "Fracture parameter",
    value: 12.8,
    unit: "score",
    description: "Fracture-toughness related parameter of the coating.",
  },
];

let runCounter = 0;

export function mockPredict(input: PredictionInput): PredictionResponse {
  runCounter += 1;
  return {
    id: `pred-${Date.now()}-${runCounter}`,
    generatedAt: new Date().toISOString(),
    materialId: input.materialId,
    model: { id: "coatlab-regressor-v0", status: "not_trained" },
    inputs: input,
    properties: demoProperties,
    demo: true,
  };
}

/**
 * Deterministic mock sensitivity curves.
 *
 * Shapes are rough proxies (thickness grows with current density, porosity
 * grows then saturates, corrosion drops as growth intensifies). Values are
 * illustrative only.
 */
const sensitivityRanges: Record<string, { min: number; max: number; step: number }> = {
  currentDensity: { min: 0.5, max: 20, step: 0.5 },
  voltage: { min: 50, max: 450, step: 10 },
  time: { min: 1, max: 60, step: 1 },
};

export function mockSensitivity(parameterId: string): SensitivityResponse {
  const range = sensitivityRanges[parameterId] ?? sensitivityRanges.currentDensity;
  const points = [];
  for (let x = range.min; x <= range.max + 1e-9; x += range.step) {
    const t = (x - range.min) / (range.max - range.min); // 0..1
    const thickness = +(20 + 60 * Math.pow(t, 0.7)).toFixed(2);
    const porosity = +(1.5 + 6.5 * Math.pow(t, 1.4)).toFixed(2);
    const corrosion = +(96 - 34 * Math.pow(t, 0.9)).toFixed(2);
    points.push({ x: +x.toFixed(2), thickness, porosity, corrosion });
  }
  const label = parameterDefinitions.find((p) => p.id === parameterId);
  return {
    parameter: {
      id: parameterId,
      label: label?.label ?? parameterId,
      unit: units[parameterId] ?? "",
    },
    min: range.min,
    max: range.max,
    points,
    demo: true,
  };
}
