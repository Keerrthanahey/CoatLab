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

export const aluminum: Material = {
  id: "mp-al",
  symbol: "Al",
  formula: "Al",
  name: "Aluminum",
  category: "metal",
  crystalSystem: "Cubic",
  spaceGroup: {
    number: 225,
    symbol: "Fm-3m",
    name: "Face-centered cubic (fcc)",
  },
  density: 2.7,
  volume: 15.5,
  lattice: { a: 4.049, b: 4.049, c: 4.049, alpha: 90, beta: 90, gamma: 90 },
  composition: [{ element: "Al", fraction: 1.0 }],
  elements: [
    {
      symbol: "Al",
      name: "Aluminum",
      atomicNumber: 13,
      atomicMass: 26.982,
      group: "13 (boron group)",
      period: 3,
      block: "p",
      electronConfiguration: "[Ne] 3s² 3p¹",
    },
  ],
  thermodynamic: {
    formationEnergyPerAtom: 0.0,
    energyAboveHull: 0.0,
    isStable: true,
    decompositionEnergy: 0.0,
  },
  mechanical: {
    bulkModulus: 76.0,
    shearModulus: 26.0,
    poissonRatio: 0.35,
    universalAnisotropy: 1.2,
  },
  electronic: { bandGap: 0.0, isMetal: true, valenceElectrons: 3 },
  surface: {
    facets: [
      { miller: "(100)", energy: 0.96 },
      { miller: "(110)", energy: 1.03 },
      { miller: "(111)", energy: 0.89 },
    ],
    workFunction: 4.28,
    notes: "Representative demo estimates.",
  },
  source: {
    provider: "Materials Project (mock)",
    note: "Demo record — connect backend for verified data.",
  },
};

export const zirconium: Material = {
  id: "mp-zr",
  symbol: "Zr",
  formula: "Zr",
  name: "Zirconium",
  category: "metal",
  crystalSystem: "Hexagonal",
  spaceGroup: {
    number: 194,
    symbol: "P63/mmc",
    name: "Hexagonal close-packed (hcp)",
  },
  density: 6.511,
  volume: 23.1,
  lattice: { a: 3.232, b: 3.232, c: 5.148, alpha: 90, beta: 90, gamma: 120 },
  composition: [{ element: "Zr", fraction: 1.0 }],
  elements: [
    {
      symbol: "Zr",
      name: "Zirconium",
      atomicNumber: 40,
      atomicMass: 91.224,
      group: "4 (transition metal)",
      period: 5,
      block: "d",
      electronConfiguration: "[Kr] 4d² 5s²",
    },
  ],
  thermodynamic: {
    formationEnergyPerAtom: 0.0,
    energyAboveHull: 0.0,
    isStable: true,
    decompositionEnergy: 0.0,
  },
  mechanical: {
    bulkModulus: 91.0,
    shearModulus: 33.0,
    poissonRatio: 0.34,
    universalAnisotropy: 0.7,
  },
  electronic: { bandGap: 0.0, isMetal: true, valenceElectrons: 4 },
  surface: {
    facets: [
      { miller: "(0001)", energy: 1.4 },
      { miller: "(10-10)", energy: 1.7 },
      { miller: "(11-20)", energy: 1.8 },
    ],
    workFunction: 4.05,
    notes: "Representative demo estimates.",
  },
  source: {
    provider: "Materials Project (mock)",
    note: "Demo record — connect backend for verified data.",
  },
};

export const tantalum: Material = {
  id: "mp-ta",
  symbol: "Ta",
  formula: "Ta",
  name: "Tantalum",
  category: "metal",
  crystalSystem: "Cubic",
  spaceGroup: {
    number: 229,
    symbol: "Im-3m",
    name: "Body-centered cubic (bcc)",
  },
  density: 16.654,
  volume: 10.9,
  lattice: { a: 3.303, b: 3.303, c: 3.303, alpha: 90, beta: 90, gamma: 90 },
  composition: [{ element: "Ta", fraction: 1.0 }],
  elements: [
    {
      symbol: "Ta",
      name: "Tantalum",
      atomicNumber: 73,
      atomicMass: 180.948,
      group: "5 (transition metal)",
      period: 6,
      block: "d",
      electronConfiguration: "[Xe] 4f14 5d3 6s2",
    },
  ],
  thermodynamic: {
    formationEnergyPerAtom: 0.0,
    energyAboveHull: 0.0,
    isStable: true,
    decompositionEnergy: 0.0,
  },
  mechanical: {
    bulkModulus: 196.0,
    shearModulus: 69.0,
    poissonRatio: 0.34,
    universalAnisotropy: 3.4,
  },
  electronic: { bandGap: 0.0, isMetal: true, valenceElectrons: 5 },
  surface: {
    facets: [
      { miller: "(100)", energy: 2.1 },
      { miller: "(110)", energy: 2.0 },
      { miller: "(111)", energy: 2.3 },
    ],
    workFunction: 4.25,
    notes: "Representative demo estimates.",
  },
  source: {
    provider: "Materials Project (mock)",
    note: "Demo record — connect backend for verified data.",
  },
};

export const materials: Material[] = [magnesium, aluminum, zirconium, tantalum];
