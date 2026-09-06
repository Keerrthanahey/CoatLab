"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, Trophy } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, NumberInput, SelectInput, TextInput } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StateBanner } from "@/components/ui/empty-state";
import { ComparisonTable, type ComparisonColumn } from "@/components/charts/comparison-table";
import { BarCompare } from "@/components/charts/bar-compare";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SUBSTRATES = ["Magnesium", "Aluminum", "Zirconium", "Tantalum"];
const COATINGS = ["Magnesium", "Aluminum", "Zirconium", "Tantalum", "MgO", "Al2O3", "ZrO2", "TiO2"];

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
  substrate_material: string;
  coating_material: string;
  current_density: number;
  voltage: number;
  duty_cycle: number;
  treatment_time: number;
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
  { key: "substrate_material", label: "Substrate" },
  { key: "coating_material", label: "Coating" },
  { key: "current_density", label: "Cur. dens", format: (v) => `${Number(v).toFixed(1)} A/dm²` },
  { key: "voltage", label: "Voltage", format: (v) => `${Number(v).toFixed(0)} V` },
  { key: "duty_cycle", label: "Duty", format: (v) => `${Number(v).toFixed(0)}%` },
  { key: "score", label: "Score", format: (v) => Number(v).toFixed(3) },
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
  const list = Array.isArray(obj.top_10_combinations)
    ? obj.top_10_combinations
    : obj.combinations ?? obj.results ?? obj.candidates;
  if (!Array.isArray(list)) return [];
  const rows = list.map((item) => {
    const r = (item ?? {}) as Record<string, unknown>;
    const params = (r.params ?? {}) as Record<string, unknown>;
    const pred = (r.predicted_outputs ?? {}) as Record<string, unknown>;
    const get = (key: string, fallback: number | string = 0): number => {
      const v = pred[key] ?? params[key] ?? fallback;
      const n = Number(v ?? fallback);
      return Number.isFinite(n) ? n : Number(fallback);
    };
    const str = (key: string, fallback = "—"): string => {
      const v = params[key];
      return v == null ? fallback : String(v);
    };
    return {
      substrate_material: str("substrate_material"),
      coating_material: str("coating_material"),
      current_density: get("current_density"),
      voltage: get("voltage"),
      duty_cycle: get("duty_cycle"),
      treatment_time: get("treatment_time"),
      corrosion_resistance: get("corrosion_resistance"),
      wear_resistance: get("wear_resistance"),
      corrosion_rate: get("corrosion_rate"),
      porosity: get("porosity"),
      coating_thickness: get("coating_thickness"),
      pore_size: get("pore_size"),
      score: get("score", 100),
    };
  });
  return rows.sort((a, b) => b.score - a.score);
}

export default function MLOptimizationPage() {
  const [substrates, setSubstrates] = useState<string[]>(["Magnesium"]);
  const [coatings, setCoatings] = useState<string[]>(["Al2O3", "ZrO2", "Tantalum"]);
  const [cdRange, setCdRange] = useState("5,10,20");
  const [voltageRange, setVoltageRange] = useState("150,300,450");
  const [dutyRange, setDutyRange] = useState("30,50,70");
  const [timeRange, setTimeRange] = useState("15,30,60");
  const [mode, setMode] = useState("constant_current");
  const [acdc, setAcdc] = useState("DC");
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
    !parseRange(cdRange) || !parseRange(voltageRange) || !parseRange(dutyRange) || !parseRange(timeRange);
  const canSubmit =
    substrates.length > 0 && coatings.length > 0 && weightsValid && !rangeError && !loading;

  const toggle = (list: string[], setter: (v: string[]) => void, m: string) => {
    setter(list.includes(m) ? list.filter((x) => x !== m) : [...list, m]);
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ranges: {
          substrate_material: substrates,
          coating_material: coatings,
          current_voltage_mode: [mode],
          ac_dc_mode: [acdc],
          current_density: parseRange(cdRange),
          voltage: parseRange(voltageRange),
          duty_cycle: parseRange(dutyRange),
          treatment_time: parseRange(timeRange),
        },
        weights: Object.fromEntries(
          WEIGHT_KEYS.map((k) => [k.id, Number(weights[k.id]) || 0]),
        ),
        max_combinations: 1000,
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
        description="Search Mg / Al / Zr / Ta material and process-parameter space, and rank combinations against your weighted objectives."
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
              subtitle="Materials and electrochemical value sets"
              icon={<Sparkles className="h-4 w-4" />}
            />

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">
                  Substrate materials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUBSTRATES.map((m) => {
                    const checked = substrates.includes(m);
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
                          onChange={() => toggle(substrates, setSubstrates, m)}
                          className="h-3.5 w-3.5 accent-teal-500"
                        />
                        <span className="font-mono text-[13px]">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">
                  Coating materials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {COATINGS.map((m) => {
                    const checked = coatings.includes(m);
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
                          onChange={() => toggle(coatings, setCoatings, m)}
                          className="h-3.5 w-3.5 accent-teal-500"
                        />
                        <span className="font-mono text-[13px]">{m}</span>
                      </label>
                    );
                  })}
                </div>
                {(substrates.length === 0 || coatings.length === 0) && (
                  <p className="mt-1.5 text-[11px] text-red-600">
                    Select at least one substrate and one coating material.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Current/Voltage mode">
                  <SelectInput value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="constant_current">Constant current</option>
                    <option value="constant_voltage">Constant voltage</option>
                  </SelectInput>
                </Field>
                <Field label="AC / DC mode">
                  <SelectInput value={acdc} onChange={(e) => setAcdc(e.target.value)}>
                    <option value="DC">DC</option>
                    <option value="AC">AC</option>
                  </SelectInput>
                </Field>
              </div>

              <Field
                label="Current density values"
                unit="A/dm²"
                hint="Comma-separated values, e.g. 5,10,20"
                error={rangeError && !parseRange(cdRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={cdRange}
                  onChange={(e) => setCdRange(e.target.value)}
                  placeholder="5,10,20"
                />
              </Field>

              <Field
                label="Voltage values"
                unit="V"
                hint="Comma-separated values, e.g. 150,300,450"
                error={rangeError && !parseRange(voltageRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={voltageRange}
                  onChange={(e) => setVoltageRange(e.target.value)}
                  placeholder="150,300,450"
                />
              </Field>

              <Field
                label="Duty cycle values"
                unit="%"
                hint="Comma-separated values, e.g. 30,50,70"
                error={rangeError && !parseRange(dutyRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={dutyRange}
                  onChange={(e) => setDutyRange(e.target.value)}
                  placeholder="30,50,70"
                />
              </Field>

              <Field
                label="Treatment time values"
                unit="min"
                hint="Comma-separated values, e.g. 15,30,60"
                error={rangeError && !parseRange(timeRange) ? "Invalid number list" : null}
              >
                <TextInput
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="15,30,60"
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
            title="Demo optimization"
            description="Ranked combinations come from the local optimizer demo running on synthetic data — illustrative only, not experimentally validated."
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
                        {best.coating_material} on {best.substrate_material} ·{" "}
                        {best.current_density.toFixed(1)} A/dm² · {best.voltage.toFixed(0)} V ·{" "}
                        {best.duty_cycle.toFixed(0)}% duty, {best.treatment_time.toFixed(0)} min
                      </p>
                    </div>
                  </div>
                  <Badge tone="teal" dot>
                    Score {best.score.toFixed(3)}
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
                    name: `${c.coating_material}/${c.substrate_material}`,
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
                  Ranked by composite score — demo optimization on synthetic data
                  ({tableData.length} top combinations displayed).
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}