import type { MicrostructureResult } from "@/lib/types";

/**
 * Demo pore-size distribution (lognormal-like). Values are illustrative —
 * the real segmentation pipeline will return measured values.
 */
const distribution = [
  { bin: "0–1", count: 18 },
  { bin: "1–2", count: 41 },
  { bin: "2–3", count: 52 },
  { bin: "3–4", count: 33 },
  { bin: "4–5", count: 19 },
  { bin: "5–6", count: 11 },
  { bin: "6–7", count: 6 },
  { bin: "7–8", count: 3 },
  { bin: "8–9", count: 1 },
];

let analyzeCounter = 0;

export function mockAnalyzeMicrostructure(fileName: string): MicrostructureResult {
  analyzeCounter += 1;
  return {
    id: `mic-${Date.now()}-${analyzeCounter}`,
    fileName,
    analyzedAt: new Date().toISOString(),
    imageWidthPx: 2048,
    imageHeightPx: 1536,
    poreCount: 184,
    porosity: 3.72,
    avgPoreSize: 2.13,
    maxPoreSize: 8.42,
    minPoreSize: 0.42,
    distribution,
    demo: true,
  };
}
