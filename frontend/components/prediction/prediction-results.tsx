"use client";

import { ShieldAlert, AlertTriangle, Gauge } from "lucide-react";
import type { PredictionResponse, SensitivityResponse } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataStatusTag, Badge } from "@/components/ui/badge";
import { StateBanner, EmptyState } from "@/components/ui/empty-state";
import { SensitivityChart } from "@/components/charts/sensitivity-chart";
import { PropertyComparison } from "@/components/charts/property-comparison";
import { cn } from "@/lib/utils";

const sensitivityOptions = [
  { id: "currentDensity", label: "Current density", unit: "A/dm²" },
  { id: "voltage", label: "Voltage", unit: "V" },
  { id: "time", label: "Processing time", unit: "min" },
];

export function PredictionResults({
  status,
  result,
  sensitivity,
  sensitivityParam,
  onSensitivityParam,
}: {
  status: "idle" | "analyzing" | "success";
  result: PredictionResponse | null;
  sensitivity: SensitivityResponse | null;
  sensitivityParam: string;
  onSensitivityParam: (id: string) => void;
}) {
  if (status === "idle") {
    return (
      <EmptyState
        icon={<Gauge className="h-5 w-5" />}
        title="No prediction yet"
        description="Enter process parameters on the left and run a prediction to see estimated coating properties, sensitivity curves and model confidence."
        className="h-full"
      />
    );
  }

  if (status === "analyzing") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-[#0c1428] p-10 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/25" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10">
            <Gauge className="h-5 w-5 animate-pulse text-blue-400" />
          </span>
        </div>
        <p className="mt-5 text-sm font-semibold text-slate-100">
          Analyzing process parameters…
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
          Validating inputs, querying the prediction endpoint and compiling
          property estimates.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
          <code className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono">POST /api/predict</code>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      <StateBanner
        tone="amber"
        icon={<AlertTriangle className="h-4 w-4" />}
        title="Demo predictions — the ML model is not trained"
        description="These values are illustrative mock outputs generated for interface development. They must not be used as scientific results. Real predictions will appear once the dataset and model are ready."
      />

      {/* Property cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {result.properties.map((prop) => (
          <Card key={prop.id} className="relative flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {prop.label}
              </span>
              <DataStatusTag label="Demo" />
            </div>
            <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight text-white">
              {prop.value}
              {prop.unit && (
                <span className="ml-1 text-sm font-normal text-slate-400">{prop.unit}</span>
              )}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{prop.description}</p>
          </Card>
        ))}
      </div>

      {/* Run metadata */}
      <Card pad={false} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono text-slate-400">Run</span>
          <code className="font-mono text-slate-200">{result.id}</code>
        </span>
        <span className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono text-slate-400">Model</span>
          <code className="font-mono text-slate-200">{result.model.id}</code>
        </span>
        <Badge tone="amber" dot>
          {result.model.status.replace("_", " ")}
        </Badge>
        <span className="ml-auto font-mono text-[11px] text-slate-400">
          {new Date(result.generatedAt).toLocaleTimeString()}
        </span>
      </Card>

      {/* Uncertainty */}
      <div className="demo-pattern flex items-start gap-3 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] px-4 py-3.5">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-[13px] font-medium text-slate-200">
            Model uncertainty — available after model training
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
            Prediction intervals, conformal bands and sensitivity-derived
            confidence are deliberately not fabricated. This panel will render
            calibrated uncertainty once the regression model is trained on the
            extracted dataset.
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <Card pad={false} className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Process parameter sensitivity
                </h3>
                <p className="text-xs text-slate-400">
                  Vary one input while holding the others fixed at the submitted
                  values. Curves are illustrative.
                </p>
              </div>
              <div className="flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
                {sensitivityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSensitivityParam(opt.id)}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                      sensitivityParam === opt.id
                        ? "bg-[#0c1428] text-blue-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-200",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {sensitivity ? (
              <SensitivityChart points={sensitivity.points} unit={sensitivity.parameter.unit} />
            ) : (
              <p className="py-10 text-center text-xs text-slate-400">Loading sensitivity…</p>
            )}
          </Card>
        </div>

        <PropertyComparison properties={result.properties} />
      </div>
    </div>
  );
}
