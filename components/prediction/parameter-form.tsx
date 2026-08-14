"use client";

import { Info, Play } from "lucide-react";
import { parameterDefinitions, electrolyteSuggestions } from "@/lib/mock-data/prediction";
import { Field, TextInput, NumberInput, SelectInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { PredictionInput } from "@/lib/types";

export type FormValues = Record<string, string>;

export function buildInput(values: FormValues): PredictionInput {
  return {
    materialId: "mp-153",
    electrolyte: values.electrolyte ?? "",
    concentration: parseFloat(values.concentration) || 0,
    currentDensity: parseFloat(values.currentDensity) || 0,
    voltage: parseFloat(values.voltage) || 0,
    frequency: parseFloat(values.frequency) || 0,
    dutyCycle: parseFloat(values.dutyCycle) || 0,
    time: parseFloat(values.time) || 0,
    temperature: parseFloat(values.temperature) || 0,
  };
}

export function validateValues(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.electrolyte?.trim()) errors.electrolyte = "Electrolyte is required.";
  for (const def of parameterDefinitions) {
    if (def.type !== "number") continue;
    const raw = values[def.id];
    const value = parseFloat(raw ?? "");
    if (raw === "" || Number.isNaN(value)) {
      errors[def.id] = "Required.";
      continue;
    }
    if (def.min !== undefined && value < def.min)
      errors[def.id] = `Min ${def.min}${def.unit ? ` ${def.unit}` : ""}.`;
    if (def.max !== undefined && value > def.max)
      errors[def.id] = `Max ${def.max}${def.unit ? ` ${def.unit}` : ""}.`;
  }
  return errors;
}

export function ParameterForm({
  values,
  onChange,
  onRun,
  running,
  errors,
}: {
  values: FormValues;
  onChange: (id: string, value: string) => void;
  onRun: () => void;
  running: boolean;
  errors: Record<string, string>;
}) {
  return (
    <Card>
      <CardHeader
        title="Process parameters"
        subtitle="Inputs consumed by the ML pipeline. Schema-driven — new parameters are added from the parameter definitions."
        icon={<Info className="h-4 w-4" />}
        aside={
          <span className="rounded border border-dashed border-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600">
            Awaiting model
          </span>
        }
      />

      <div className="mt-5 space-y-4">
        <Field label="Material" hint="Only Mg is registered in the demo index.">
          <SelectInput value="mp-153">
            <option value="mp-153">Magnesium (Mg) — mp-153</option>
          </SelectInput>
        </Field>

        {parameterDefinitions.map((def) => {
          if (def.type === "text") {
            return (
              <Field key={def.id} label={def.label} hint={def.help} error={errors[def.id]}>
                <TextInput
                  list="electrolyte-suggestions"
                  value={values[def.id] ?? ""}
                  onChange={(e) => onChange(def.id, e.target.value)}
                  placeholder={def.placeholder}
                />
              </Field>
            );
          }
          if (def.type === "select") {
            return (
              <Field key={def.id} label={def.label} unit={def.unit} error={errors[def.id]}>
                <SelectInput
                  value={values[def.id] ?? def.defaultValue}
                  onChange={(e) => onChange(def.id, e.target.value)}
                >
                  {def.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            );
          }
          return (
            <Field
              key={def.id}
              label={def.label}
              unit={def.unit}
              hint={def.help}
              error={errors[def.id]}
            >
              <NumberInput
                value={values[def.id] ?? def.defaultValue}
                min={def.min}
                max={def.max}
                step={def.step}
                onChange={(e) => onChange(def.id, e.target.value)}
              />
            </Field>
          );
        })}

        <datalist id="electrolyte-suggestions">
          {electrolyteSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <Button
          size="lg"
          className="w-full"
          onClick={onRun}
          loading={running}
          disabled={running}
        >
          {!running && <Play className="h-4 w-4" />}
          {running ? "Analyzing process parameters…" : "Run Prediction"}
        </Button>

        <p className="text-[11px] leading-relaxed text-slate-400">
          Prediction runs against a mock responder (<code className="font-mono">POST /api/predict</code>).
          A trained model will return real estimates for these same inputs.
        </p>
      </div>
    </Card>
  );
}
