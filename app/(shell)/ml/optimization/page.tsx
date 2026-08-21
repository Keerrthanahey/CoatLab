"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, Trophy } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, NumberInput, TextInput } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StateBanner } from "@/components/ui/empty-state";
import { ComparisonTable, type ComparisonColumn } from "@/components/charts/comparison-table";
import { BarCompare } from "@/components/charts/bar-compare";

const API_BASE = "http://localhost:8000";

const MATERIALS = ["Al2O3", "SiO2", "TiO2", "ZrO2"];

const WEIGHT_KEYS = [
  { id: "corrosion_resistance", label: "Corrosion resistance" },
  { id: "wear_resistance", label: "Wear resistance" },
  { id: "corrosion_rate", label: "Corrosion rate" },
  { id: "porosity", label: "Porosity" },
  { id: "coating_thickness", label: "Coating thickness" },
  { id: "pore_size", label: "Pore size" },
] as const;

type WeightKey = (typeof WEIGHT_KEYS)[number]["id"];

interface ComboRow {
  coating_material: string;
  temperature: number;
  voltage: number;
  current: number;
  corrosion_resistance: number;
  wear_resistance: number;
  corrosion_rate: number;
  porosity: number;
  coating_thickness: number;
  pore_size: number;
  score: number;
}

const TABLE_COLUMNS: ComparisonColumn[] = [
  { key: "rank", label: "#" },
  { key: "coating_material", label: "Coating" },
  { key: "temperature", label: "Temp", format: (v) => `${Number(v).toFixed(0)} °C` },
  { key: "voltage", label: "Voltage", format: (v) => `${Number(v).toFixed(0)} V` },
  { key: "current", label: "Current", format: (v) => `${Number(v).toFixed(1)} A` },
  { key: "score", label: "Score", format: (v) => Number(v).toFixed(1) },
  {
    key: "corrosion_resistance",
    label: "Corr. res",
    format: (v) => `${Number(v).toFixed(1)}%`,
  },
  { key: "porosity", label: "Porosity", format: (v) => `${Number(v).toFixed(2)}%` },
  {
    key: "coating_thickness",
    label: "Thickness",
    format: (v) => `${Number(v).toFixed(1)} μm`,
  },
];

function parseRange(raw: string): number[] | null {
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length === 0) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

function normalizeCombos(raw: unknown): ComboRow[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const list = obj.combinations ?? obj.results ?? obj.candidates ?? obj.data;
  if (!Array.isArray(list)) return [];
  const rows = list.map((item, i) => {
    const r = (item ?? {}) as Record<string, unknown>;
    const pred = (
      r.predictions && typeof r.predictions === "object" ? r.predictions : r
    ) as Record<string, unknown>;
    const num = (key: string, fallback = 0) => {
      const v = Number(pred[key] ?? r[key]);
      return Number.isFinite(v) ? v : fallback;
    };
    const str = (key: string) => {
      const v = pred[key] ?? r[key];
      return v == null ? "—" : String(v);
    };
    return {
      coating_material: str("coating_material"),
      temperature: num("temperature"),
      voltage: num("voltage"),
      current: num("current"),
      corrosion_resistance: num("corrosion_resistance"),
      wear_resistance: num("wear_resistance"),
      corrosion_rate: num("corrosion_rate"),
      porosity: num("porosity"),
      coating_thickness: num("coating_thickness"),
      pore_size: num("pore_size"),
      score: num("score", 100 - i),
    };
  });
  return rows.sort((a, b) => b.score - a.score);
}

export default function MLOptimizationPage() {
  const [materials, setMaterials] = useState<string[]>(["Al2O3"]);
  const [tempRange, setTempRange] = useState("200,300,400");
  const [voltageRange, setVoltageRange] = useState("100,200,300");
  const [currentRange, setCurrentRange] = useState("3,5,8");
  const [weights, setWeights] = useState<Record<WeightKey, string>>({
    corrosion_resistance: "25",
    wear_resistance: "15",
    corrosion_rate: "20",
    porosity: "15",
    coating_thickness: "15",
    pore_size: "10",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combos, setCombos] = useState<ComboRow[] | null>(null);

  const totalWeight = useMemo(
    () => WEIGHT_KEYS.reduce((sum, k) => sum + (Number(weights[k.id]) || 0), 0),
    [weights],
  );
  const weightsValid = Math.round(totalWeight * 100) / 100 === 100;

  const rangeError =
    !parseRange(tempRange) || !parseRange(voltageRange) || !parseRange(currentRange);
  const canSubmit = materials.length > 0 && weightsValid && !rangeError && !loading;

  const toggleMaterial = (m: string) => {
    setMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        coating_materials: materials,
        temperature: parseRange(tempRange),
        voltage: parseRange(voltageRange),
        current: parseRange(currentRange),
        weights: Object.fromEntries(
          WEIGHT_KEYS.map((k) => [k.id, Number(weights[k.id]) || 0]),
        ),
      };
      const res = await fetch(`${API_BASE}/api/ml/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Optimizer service returned ${res.status}`);
      const json: unknown = await res.json();
      const rows = normalizeCombos(json);
      if (rows.length === 0) throw new Error("No combinations returned by the optimizer");
      setCombos(rows);
    } catch (e) {
      setCombos(null);
      setError(e instanceof Error ? e.message : "Optimization request failed");
    } finally {
      setLoading(false);
    }
  };

  const best = combos?.[0];
  const tableData = useMemo(
    () => (combos ?? []).map((c, i) => ({ ...c, rank: i + 1 })),
    [combos],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Multi-Objective"
        title="Coating Combination Optimizer"
        description="Search the parameter space across candidate coatings and rank combinations against your weighted objectives."
        demoLabel="Demo"
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-5 lg:col-span-2"
        >
          <Card>
            <CardHeader
              title="Search Space"
              subtitle="Candidate coatings and process value sets"
              icon={<Sparkles className="h-4 w-4" />}
            />

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">
                  Coating materials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map((m) => {
                    const checked = materials.includes(m);
                    return (
                      <label
                        key={m}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
                            : "border-white/[0.12] bg-[#0c1428] text-slate-300 hover:border-white/25"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMaterial(m)}
                          className="h-3.5 w-3.5 accent-teal-500"
                        />
                        <span className="font-mono text-[13px]">{m}</span>
                      </label>
                    );
                  })}
                </div>
                {materials.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-red-600">
                    Select at least one coating material.
                  </p>
                )}
              </div>

              <Field
                label="Temperature values"
                unit="°C"
                hint="Comma-separated values, e.g. 200,300,400"
                error={rangeError && !parseRange(tempRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={tempRange}
                  onChange={(e) => setTempRange(e.target.value)}
                  placeholder="200,300,400"
                />
              </Field>

              <Field
                label="Voltage values"
                unit="V"
                hint="Comma-separated values, e.g. 100,200,300"
                error={rangeError && !parseRange(voltageRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={voltageRange}
                  onChange={(e) => setVoltageRange(e.target.value)}
                  placeholder="100,200,300"
                />
              </Field>

              <Field
                label="Current values"
                unit="A"
                hint="Comma-separated values, e.g. 3,5,8"
                error={rangeError && !parseRange(currentRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={currentRange}
                  onChange={(e) => setCurrentRange(e.target.value)}
                  placeholder="3,5,8"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Objective Weights"
              subtitle="Relative importance of each predicted property"
              aside={
                <Badge tone={weightsValid ? "teal" : "red"} dot>
                  Total {Math.round(totalWeight * 10) / 10}%
                </Badge>
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
              {WEIGHT_KEYS.map((k) => (
                <Field key={k.id} label={k.label} unit="%">
                  <NumberInput
                    value={weights[k.id]}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(e) =>
                      setWeights((w) => ({ ...w, [k.id]: e.target.value }))
                    }
                  />
                </Field>
              ))}
            </div>
            {!weightsValid && (
              <p className="mt-3 text-[11px] text-red-600">
                Weights must sum to exactly 100%.
              </p>
            )}
          </Card>

          <Button
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            onClick={handleOptimize}
            className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:ring-teal-500/40"
          >
            {!loading && <Sparkles className="h-4 w-4" />}
            Generate &amp; Optimize
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
          className="space-y-5 lg:col-span-3"
        >
          <StateBanner
            tone="amber"
            title="Demo output"
            description="Ranked combinations come from the local optimizer demo and are illustrative only — not verified scientific results."
          />

          {error && (
            <StateBanner
              tone="red"
              title="Optimization failed"
              description={`${error}. Make sure the backend is running on ${API_BASE}.`}
            />
          )}

          {loading && (
            <EmptyState
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Optimizing…"
              description="Evaluating the candidate grid against your weighted objectives."
            />
          )}

          {!loading && !combos && !error && (
            <EmptyState
              icon={<Trophy className="h-5 w-5" />}
              title="No optimization run yet"
              description="Configure the search space and objective weights, then generate ranked coating combinations."
            />
          )}

          {!loading && best && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-5 ring-1 ring-inset ring-teal-500/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-400">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Best combination</p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {best.coating_material} · {best.temperature.toFixed(0)} °C ·{" "}
                        {best.voltage.toFixed(0)} V · {best.current.toFixed(1)} A
                      </p>
                    </div>
                  </div>
                  <Badge tone="teal" dot>
                    Score {best.score.toFixed(1)}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["Corr. resistance", `${best.corrosion_resistance.toFixed(1)}%`],
                      ["Wear resistance", `${best.wear_resistance.toFixed(1)}%`],
                      ["Corrosion rate", `${best.corrosion_rate.toFixed(3)} mm/yr`],
                      ["Porosity", `${best.porosity.toFixed(2)}%`],
                      ["Thickness", `${best.coating_thickness.toFixed(1)} μm`],
                      ["Pore size", `${best.pore_size.toFixed(2)} μm`],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2.5"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {label}
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-teal-400">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <Card>
                <CardHeader
                  title="Top 5 combinations"
                  subtitle="Composite score comparison"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <BarCompare
                  data={combos.slice(0, 5).map((c, i) => ({
                    name: `${c.coating_material} @ ${c.temperature.toFixed(0)}°C`,
                    score: c.score,
                    color: i === 0 ? "#14b8a6" : "#14b8a699",
                  }))}
                />
              </Card>

              <div>
                <ComparisonTable
                  columns={TABLE_COLUMNS}
                  data={tableData}
                  highlightIndex={0}
                />
                <p className="mt-2 text-[11px] text-slate-400">
                  Ranked by composite score ({tableData.length} combinations evaluated).
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
