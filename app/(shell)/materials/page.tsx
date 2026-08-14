import type { Metadata } from "next";
import { FlaskConical, Copy } from "lucide-react";
import { api } from "@/lib/api/client";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StateBanner } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { PropertyRow, PropertyGroup } from "@/components/ui/property-row";
import { CrystalViewerPlaceholder } from "@/components/material/crystal-viewer";
import type { Material } from "@/lib/types";

export const metadata: Metadata = { title: "Material Explorer" };

function MaterialSummary({ material }: { material: Material }) {
  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
        {/* Element tile */}
        <div className="flex shrink-0 items-center gap-5">
          <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white shadow-inner">
            <span className="text-3xl font-semibold tracking-tight text-blue-800">
              {material.symbol}
            </span>
            <span className="mt-0.5 font-mono text-[10px] text-slate-400">
              {material.elements[0]?.atomicNumber}
            </span>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500 shadow-sm" />
          </div>
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {material.name}
            </h2>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-600">
              {material.formula}
            </span>
            <Badge tone="teal">{material.category}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-700">
              {material.id}
              <Copy className="h-3 w-3 opacity-50" />
            </span>
            <Badge tone="neutral">Materials Project ref</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {material.spaceGroup.name} ({material.spaceGroup.symbol}, space group{" "}
            {material.spaceGroup.number}). Primitive research material for coating studies.
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
          {[
            { label: "Density", value: `${material.density} g/cm³` },
            { label: "Volume", value: `${material.volume} Å³/atom` },
            { label: "Band gap", value: material.electronic.isMetal ? "Metallic" : `${material.electronic.bandGap} eV` },
            { label: "Stability", value: material.thermodynamic.isStable ? "Stable" : "Metastable" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
              <p className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-slate-800">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default async function MaterialsPage() {
  const material = await api.materials.get("mp-153");
  const lattice = material.lattice;
  const compositionTotal = material.composition.reduce((s, c) => s + c.fraction, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Material database"
        title="Material Explorer"
        description="Crystallographic, thermodynamic, mechanical and electronic data for the active research material."
        demoLabel="Demo record"
      />

      <StateBanner
        tone="blue"
        icon={<FlaskConical className="h-4 w-4" />}
        title="Demo data — connect the Materials Project API for verified values"
        description={material.source.note}
      />

      <MaterialSummary material={material} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Properties"
              subtitle="Curated demonstration values, grouped by property family."
            />
          </div>
          <div className="px-5">
            <Tabs
              defaultId="overview"
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Crystal">
                        <PropertyRow label="Crystal system" value={material.crystalSystem} mono={false} />
                        <PropertyRow label="Space group" value={`${material.spaceGroup.number} · ${material.spaceGroup.symbol}`} />
                        <PropertyRow label="Structure" value={material.spaceGroup.name} mono={false} />
                        <PropertyRow label="Prototype" value="hcp (Mg type)" mono={false} />
                      </PropertyGroup>
                      <PropertyGroup title="Lattice parameters">
                        <PropertyRow label="a" value={`${lattice.a.toFixed(3)} Å`} />
                        <PropertyRow label="b" value={`${lattice.b.toFixed(3)} Å`} />
                        <PropertyRow label="c" value={`${lattice.c.toFixed(3)} Å`} />
                        <PropertyRow label="α = β" value={`${lattice.alpha}°`} />
                        <PropertyRow label="γ" value={`${lattice.gamma}°`} />
                      </PropertyGroup>
                      <PropertyGroup title="Physical">
                        <PropertyRow label="Density" value={`${material.density} g/cm³`} />
                        <PropertyRow label="Volume / atom" value={`${material.volume} Å³`} />
                        <PropertyRow label="Valence electrons" value={material.electronic.valenceElectrons} />
                      </PropertyGroup>
                    </div>
                  ),
                },
                {
                  id: "composition",
                  label: "Composition",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Elemental composition">
                        {material.composition.map((c) => (
                          <PropertyRow
                            key={c.element}
                            label={`${c.element}`}
                            value={`${((c.fraction / compositionTotal) * 100).toFixed(1)} %`}
                          />
                        ))}
                      </PropertyGroup>
                      {material.elements.map((el) => (
                        <PropertyGroup key={el.symbol} title={`Element — ${el.name}`}>
                          <PropertyRow label="Atomic number" value={el.atomicNumber} />
                          <PropertyRow label="Atomic mass" value={`${el.atomicMass} u`} />
                          <PropertyRow label="Group" value={el.group} mono={false} />
                          <PropertyRow label="Period" value={el.period} />
                          <PropertyRow label="Block" value={el.block} />
                          <PropertyRow label="Configuration" value={el.electronConfiguration} />
                        </PropertyGroup>
                      ))}
                    </div>
                  ),
                },
                {
                  id: "thermodynamic",
                  label: "Thermodynamic",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Formation & stability">
                        <PropertyRow label="Formation energy" value={`${material.thermodynamic.formationEnergyPerAtom.toFixed(3)} eV/atom`} />
                        <PropertyRow label="Energy above hull" value={`${material.thermodynamic.energyAboveHull.toFixed(3)} eV/atom`} />
                        <PropertyRow label="Decomposition energy" value={`${material.thermodynamic.decompositionEnergy.toFixed(3)} eV/atom`} />
                        <PropertyRow label="Stability" value={<Badge tone="green">{material.thermodynamic.isStable ? "Ground state" : "Metastable"}</Badge>} mono={false} />
                      </PropertyGroup>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Pure magnesium is a stable elemental reference state
                        (energy above hull = 0). These values come from a
                        representative DFT-style calculation and are presented
                        for demonstration.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "mechanical",
                  label: "Mechanical",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Elastic properties">
                        <PropertyRow label="Bulk modulus" value={`${material.mechanical.bulkModulus} GPa`} />
                        <PropertyRow label="Shear modulus" value={`${material.mechanical.shearModulus} GPa`} />
                        <PropertyRow label="Poisson ratio" value={material.mechanical.poissonRatio} />
                        <PropertyRow label="Universal anisotropy" value={material.mechanical.universalAnisotropy} />
                      </PropertyGroup>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Magnesium is a light structural metal (density ≈ 1.74
                        g/cm³) with moderate elastic moduli. Coating processes
                        aim to protect the reactive surface while preserving
                        bulk mechanical behaviour.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "electronic",
                  label: "Electronic",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Band structure">
                        <PropertyRow label="Band gap" value={`${material.electronic.bandGap} eV`} />
                        <PropertyRow label="Classification" value={material.electronic.isMetal ? "Metallic conductor" : "Semiconductor"} mono={false} />
                        <PropertyRow label="Work function" value={`${material.surface.workFunction} eV`} />
                      </PropertyGroup>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Metallic behaviour (zero band gap) and low work function
                        make Mg highly electropositive — the driver for the
                        rapid corrosion that coating research targets.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "surface",
                  label: "Surface",
                  content: (
                    <div className="grid gap-8 md:grid-cols-2">
                      <PropertyGroup title="Surface energies">
                        {material.surface.facets.map((f) => (
                          <PropertyRow key={f.miller} label={`hkl ${f.miller}`} value={`${f.energy.toFixed(2)} J/m²`} />
                        ))}
                        <PropertyRow label="Work function" value={`${material.surface.workFunction} eV`} />
                      </PropertyGroup>
                      <p className="text-xs leading-relaxed text-slate-500">
                        {material.surface.notes}
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
          <div className="px-5 pb-5" />
        </Card>

        <CrystalViewerPlaceholder />
      </div>
    </div>
  );
}
