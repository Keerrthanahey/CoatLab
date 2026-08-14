import type { Material } from "@/lib/types";

/**
 * Curated demonstration record for Magnesium.
 *
 * Values are plausible literature/MP-style values but are NOT verified
 * against the live Materials Project API. The frontend is served through
 * the `api.materials.get()` abstraction so this can be replaced by a real
 * `GET /api/materials/{id}` integration without UI changes.
 */
export const magnesium: Material = {
  id: "mp-153",
  symbol: "Mg",
  formula: "Mg",
  name: "Magnesium",
  category: "metal",
  crystalSystem: "Hexagonal",
  spaceGroup: {
    number: 194,
    symbol: "P63/mmc",
    name: "Hexagonal close-packed (hcp)",
  },
  density: 1.738, // g/cm³
  volume: 22.9, // Å³/atom
  lattice: {
    a: 3.209,
    b: 3.209,
    c: 5.211,
    alpha: 90,
    beta: 90,
    gamma: 120,
  },
  composition: [{ element: "Mg", fraction: 1.0 }],
  elements: [
    {
      symbol: "Mg",
      name: "Magnesium",
      atomicNumber: 12,
      atomicMass: 24.305,
      group: "2 (alkaline earth)",
      period: 3,
      block: "s",
      electronConfiguration: "[Ne] 3s²",
    },
  ],
  thermodynamic: {
    formationEnergyPerAtom: 0.0,
    energyAboveHull: 0.0,
    isStable: true,
    decompositionEnergy: 0.0,
  },
  mechanical: {
    bulkModulus: 45.2, // GPa
    shearModulus: 17.0, // GPa
    poissonRatio: 0.29,
    universalAnisotropy: 0.35,
  },
  electronic: {
    bandGap: 0.0, // eV — metallic
    isMetal: true,
    valenceElectrons: 2,
  },
  surface: {
    facets: [
      { miller: "(0001)", energy: 0.56 },
      { miller: "(10-10)", energy: 0.68 },
      { miller: "(11-20)", energy: 0.71 },
    ],
    workFunction: 3.66,
    notes: "Low-index surface energies; values are representative demo estimates.",
  },
  source: {
    provider: "Materials Project (mock)",
    note: "Demo record — connect GET /api/materials/mp-153 for verified data.",
  },
};

export const materials: Material[] = [magnesium];
