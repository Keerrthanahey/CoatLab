"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  SlidersHorizontal,
  Thermometer,
  Sparkles,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, NumberInput, SelectInput } from "@/components/ui/form";
import { EmptyState, StateBanner } from "@/components/ui/empty-state";
import { PerformanceRadar } from "@/components/charts/radar-chart";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type FormValues = Record<string, string>;

interface SelectSpec {
  id: string;
  label: string;
  options: string[];
}

interface NumberSpec {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
}

interface SectionSpec {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selects: SelectSpec[];
  numbers: NumberSpec[];
}

const SECTIONS: SectionSpec[] = [
  {
    title: "Material System",
    subtitle: "Substrate, coating chemistry and reinforcement",
    icon: <Layers className="h-4 w-4" />,
    selects: [
      { id: "substrate_material", label: "Substrate material", options: ["Mg", "Al", "Ti", "Steel"] },
      { id: "coating_material", label: "Coating material", options: ["Al2O3", "SiO2", "TiO2", "ZrO2"] },
      { id: "reinforcement", label: "Reinforcement", options: ["none", "SiC", "Al2O3", "TiO2", "graphene"] },
    ],
    numbers: [
      { id: "reinforcement_percentage", label: "Reinforcement percentage", unit: "%", min: 0, max: 30, step: 0.5 },
      { id: "particle_size", label: "Particle size", unit: "μm", min: 0, max: 500, step: 1 },
    ],
  },
  {
    title: "Process Parameters",
    subtitle: "Deposition conditions and kinematics",
    icon: <SlidersHorizontal className="h-4 w-4" />,
    selects: [
      { id: "coating_method", label: "Coating method", options: ["PEO", "HVOF", "Cold_Spray", "Electroplating"] },
    ],
    numbers: [
      { id: "voltage", label: "Voltage", unit: "V", min: 0, max: 600, step: 1 },
      { id: "current", label: "Current", unit: "A", min: 0, max: 50, step: 0.1 },
      { id: "temperature", label: "Temperature", unit: "°C", min: 0, max: 800, step: 1 },
      { id: "pressure", label: "Pressure", unit: "bar", min: 0, max: 10, step: 0.1 },
      { id: "spray_distance", label: "Spray distance", unit: "mm", min: 0, max: 500, step: 1 },
      { id: "deposition_time", label: "Deposition time", unit: "min", min: 0, max: 120, step: 1 },
      { id: "speed", label: "Speed", unit: "mm/s", min: 0, max: 500, step: 1 },
      { id: "num_passes", label: "Number of passes", unit: "×", min: 1, max: 10, step: 1 },
    ],
  },
  {
    title: "Thermal Treatment",
    subtitle: "Post-deposition heat treatment",
    icon: <Thermometer className="h-4 w-4" />,
    selects: [
      { id: "cooling_method", label: "Cooling method", options: ["air", "water", "oil", "furnace"] },
    ],
    numbers: [
      { id: "heat_treatment_temp", label: "Heat treatment temp", unit: "°C", min: 0, max: 1000, step: 1 },
      { id: "heat_treatment_time", label: "Heat treatment time", unit: "min", min: 0, max: 240, step: 1 },
    ],
  },
  {
    title: "Surface Condition",
    subtitle: "Pre-treatment state of the substrate",
    icon: <FlaskConical className="h-4 w-4" />,
    selects: [
      {
        id: "surface_preparation",
        label: "Surface preparation",
        options: ["ground", "polished", "sandblasted", "as-received"],
      },
    ],
    numbers: [
      { id: "surface_roughness", label: "Surface roughness", unit: "μm Ra", min: 0, max: 50, step: 0.1 },
      { id: "surface_hardness", label: "Surface hardness", unit: "HV", min: 0, max: 200, step: 1 },
    ],
  },
];

interface Predictions {
  corrosion_resistance: number;
  corrosion_rate: number;
  coating_thickness: number;
  porosity: number;
  pore_size: number;
  wear_resistance: number;
}

const METRICS: Array<{
  key: keyof Predictions;
  label: string;
  unit: string;
  max: number;
  color: string;
  decimals: number;
}> = [
  { key: "corrosion_resistance", label: "Corrosion Resistance", unit: "%", max: 100, color: "#14b8a6", decimals: 1 },
  { key: "wear_resistance", label: "Wear Resistance", unit: "%", max: 100, color: "#14b8a6", decimals: 1 },
  { key: "coating_thickness", label: "Coating Thickness", unit: "μm", max: 200, color: "#3b82f6", decimals: 1 },
  { key: "porosity", label: "Porosity", unit: "%", max: 20, color: "#ef4444", decimals: 2 },
  { key: "pore_size", label: "Pore Size", unit: "μm", max: 50, color: "#f59e0b", decimals: 2 },
  { key: "corrosion_rate", label: "Corrosion Rate", unit: "mm/yr", max: 2, color: "#f59e0b", decimals: 3 },
];

const DEFAULT_VALUES: FormValues = {
  substrate_material: "Mg",
  coating_material: "Al2O3",
  reinforcement: "none",
  reinforcement_percentage: "5",
  particle_size: "20",
  coating_method: "PEO",
  voltage: "350",
  current: "10",
  temperature: "25",
  pressure: "2",
  spray_distance: "150",
  deposition_time: "30",
  speed: "200",
  num_passes: "3",
  heat_treatment_temp: "200",
  heat_treatment_time: "60",
  cooling_method: "air",
  surface_roughness: "1.2",
  surface_preparation: "ground",
  surface_hardness: "80",
};

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of SECTIONS) {
    for (const spec of section.numbers) {
      const raw = values[spec.id]?.trim();
      if (!raw) {
        errors[spec.id] = "Required";
        continue;
      }
      const num = Number(raw);
      if (!Number.isFinite(num)) {
        errors[spec.id] = "Must be a number";
      } else if (num < spec.min || num > spec.max) {
        errors[spec.id] = `Must be between ${spec.min} and ${spec.max}`;
      }
    }
  }
  return errors;
}

function normalizePredictions(raw: unknown): Predictions | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const src = (
    obj.predictions && typeof obj.predictions === "object" ? obj.predictions : obj
  ) as Record<string, unknown>;
  const out = {} as Record<keyof Predictions, number>;
  for (const metric of METRICS) {
    const v = Number(src[metric.key]);
    if (!Number.isFinite(v)) return null;
    out[metric.key] = v;
  }
  return out;
}

export default function MLPredictionPage() {
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Predictions | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const setValue = (id: string, value: string) => {
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async () => {
    const validation = validate(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, number | string> = {};
      for (const section of SECTIONS) {
        for (const spec of section.selects) payload[spec.id] = values[spec.id];
        for (const spec of section.numbers) payload[spec.id] = Number(values[spec.id]);
      }
      const res = await fetch(`${API_BASE}/api/ml/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Prediction service returned ${res.status}`);
      const json: unknown = await res.json();
      const predictions = normalizePredictions(json);
      if (!predictions) throw new Error("Unexpected response shape from prediction service");
      setResult(predictions);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Prediction request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="ML Engine"
        title="Coating Performance Prediction"
        description="Feed the full material–process–thermal–surface space into the ML engine and get predicted coating properties."
        demoLabel="Demo"
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-5 lg:col-span-3"
        >
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
            >
              <Card>
                <CardHeader
                  title={section.title}
                  subtitle={section.subtitle}
                  icon={section.icon}
                />
                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 xl:grid-cols-3">
                  {section.selects.map((spec) => (
                    <Field key={spec.id} label={spec.label}>
                      <SelectInput
                        value={values[spec.id]}
                        onChange={(e) => setValue(spec.id, e.target.value)}
                      >
                        {spec.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.replace(/_/g, " ")}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                  ))}
                  {section.numbers.map((spec) => (
                    <Field
                      key={spec.id}
                      label={spec.label}
                      unit={spec.unit}
                      error={errors[spec.id]}
                    >
                      <NumberInput
                        value={values[spec.id]}
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        aria-invalid={Boolean(errors[spec.id])}
                        className={errors[spec.id] ? "border-red-500/60" : undefined}
                        onChange={(e) => setValue(spec.id, e.target.value)}
                      />
                    </Field>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}

          <Button
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:ring-teal-500/40"
          >
            {!loading && <Sparkles className="h-4 w-4" />}
            Run ML Prediction
          </Button>
        </motion.div>

        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
          className="space-y-5 scroll-mt-20 lg:col-span-2"
        >
          <StateBanner
            tone="amber"
            title="Demo output"
            description="Predictions come from the local ML demo service and are illustrative only — not verified scientific results."
          />

          {error && (
            <StateBanner
              tone="red"
              title="Prediction failed"
              description={`${error}. Make sure the backend is running on ${API_BASE}.`}
            />
          )}

          {loading && !result && (
            <EmptyState
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Running ML prediction…"
              description="Sending the parameter vector to the inference endpoint."
            />
          )}

          {!loading && !result && !error && (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="No prediction yet"
              description="Fill in the process parameters and run the ML engine to see predicted coating properties here."
            />
          )}

          {result && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {METRICS.map((metric, i) => {
                  const value = result[metric.key];
                  const pct = Math.min(100, Math.max(3, (value / metric.max) * 100));
                  return (
                    <motion.div
                      key={metric.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
                      className="rounded-xl border border-white/[0.07] bg-[#0c1428] p-4"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
                        {value.toFixed(metric.decimals)}
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          {metric.unit}
                        </span>
                      </p>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.1 + 0.05 * i, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: metric.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Card>
                <CardHeader
                  title="Property profile"
                  subtitle="Normalized 0–100 against expected ranges."
                />
                <PerformanceRadar
                  data={{
                    "Corr. res": result.corrosion_resistance,
                    "Wear res": result.wear_resistance,
                    Thickness: result.coating_thickness,
                    Porosity: result.porosity,
                    "Pore size": result.pore_size,
                    "Corr. rate": result.corrosion_rate,
                  }}
                  maxValues={{
                    "Corr. res": 100,
                    "Wear res": 100,
                    Thickness: 200,
                    Porosity: 20,
                    "Pore size": 50,
                    "Corr. rate": 2,
                  }}
                />
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
