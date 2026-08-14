import type { DatasetRecord, DatasetSummary } from "@/lib/types";

export const emptyDatasetSummary: DatasetSummary = {
  totalRecords: 0,
  status: "awaiting_literature",
  lastUpdated: null,
};

/**
 * Sample rows for UI testing of the data table (search / filter / sort /
 * export). Clearly distinct from real extracted data: rows are generated
 * deterministically and labelled as samples in the UI.
 */
const electrolytes = ["Na2SiO3", "Na3PO4", "KOH", "KF", "NaAlO2", "MgO suspension"];
const materials = ["Mg", "AZ31", "AZ91", "WE43", "Mg-Li"];

function round(n: number, d = 2): number {
  return +n.toFixed(d);
}

export function generateSampleRows(count = 48): DatasetRecord[] {
  const rows: DatasetRecord[] = [];
  for (let i = 0; i < count; i += 1) {
    const material = materials[i % materials.length];
    const electrolyte = electrolytes[Math.floor((i * 7) % electrolytes.length)];
    const currentDensity = round(0.5 + ((i * 3.1) % 19));
    const voltage = round(80 + ((i * 23) % 400));
    const frequency = [0, 500, 1000, 2000, 3000][i % 5];
    const dutyCycle = i % 4 === 0 ? null : round(20 + ((i * 11) % 80));
    const time = round(2 + ((i * 5.3) % 58), 1);
    const temperature = round(10 + ((i * 9) % 60));
    const thickness = round(5 + ((i * 7.7) % 90), 1);
    const porosity = round(1.5 + ((i * 2.1) % 8), 2);
    const poreSize = round(0.4 + ((i * 0.83) % 8), 2);
    rows.push({
      paperId: `202${(i % 3) + 1}-${String(100 + ((i * 13) % 899))}`,
      material,
      electrolyte,
      concentration: round(0.1 + ((i * 1.7) % 2.4), 2),
      currentDensity,
      voltage,
      frequency,
      dutyCycle,
      time,
      temperature,
      coatingThickness: thickness,
      porosity,
      poreSize,
      corrosionResistance: round(40 + ((i * 5.3) % 55)),
      wearResistance: round(30 + ((i * 6.1) % 65)),
      fractureParameter: round(3 + ((i * 1.9) % 22), 2),
    });
  }
  return rows;
}
