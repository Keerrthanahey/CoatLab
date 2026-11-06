import type { Metadata } from "next";
import {
  BrainCircuit,
  ScatterChart as ScatterIcon,
  BarChart3,
  Activity,
  Database,
  ListChecks,
  CheckCircle2,
  Circle,
  Atom,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, DataStatusTag } from "@/components/ui/badge";
import { StateBanner, EmptyState } from "@/components/ui/empty-state";
import { PlaceholderChart } from "@/components/charts/placeholder-chart";
import type { MLModelInfo } from "@/lib/types";

export const metadata: Metadata = { title: "Model Performance" };

const metricDefs = [
  { key: "r2" as const, label: "R²", note: "Share of variance explained by the model." },
  { key: "mae" as const, label: "MAE", note: "Mean absolute error on held-out predictions." },
  { key: "rmse" as const, label: "RMSE", note: "Root mean squared error." },
  { key: "mape" as const, label: "MAPE", note: "Mean absolute percentage error." },
];

function formatTrainedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function ModelPage() {
  const info: MLModelInfo = await api.ml.modelInfo();
  const targets = Object.entries(info.metrics);
  const trained = info.trained && targets.length > 0;

  const targetLabels: Record<string, string> = {
    corrosion_resistance: "Corrosion Resistance",
    corrosion_rate: "Corrosion Rate",
    coating_thickness: "Coating Thickness",
    porosity: "Porosity",
    pore_size: "Pore Size",
    wear_resistance: "Wear Resistance",
  };

  const modelFamilies = new Set(
    targets.map(([, m]) => m.selected_model).filter(Boolean),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="ML training & evaluation"
        title="Model Performance"
        description="XGBoost coating-property regressors trained on the synthetic research dataset with a held-out evaluation split. Metrics are model performance on demo data — never presented as experimental results."
        demoLabel="Demo"
      />

      <StateBanner
        tone="amber"
        icon={<BrainCircuit className="h-4 w-4" />}
        title={trained ? "Model trained — synthetic demo data" : "Model not trained"}
        description={
          trained
            ? "The pipeline compares XGBoost (primary), GradientBoosting and RandomForest per target and keeps the best R² model. Values come from the 80/20 hold-out split of the 500-row synthetic dataset."
            : "Run the training pipeline in the backend (python -m app.ml.train) to produce metrics."
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Registry */}
        <Card>
          <CardHeader
            title="Model registry"
            subtitle="Coating-property regressors from the XGBoost pipeline."
            icon={<Database className="h-4 w-4" />}
          />
          <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Status</p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="font-mono text-lg font-semibold text-white">
                {trained ? "Trained" : "Not Trained"}
              </span>
              <Badge tone={trained ? "teal" : "amber"} dot>
                {trained ? "XGBoost pipeline" : "Awaiting training"}
              </Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Primary family</span>
              <span className="font-mono text-slate-200">XGBoost</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Selected models</span>
              <span className="max-w-[55%] truncate font-mono text-slate-200">
                {modelFamilies.size > 0 ? [...modelFamilies].join(" · ") : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dataset rows</span>
              <span className="font-mono tabular-nums text-slate-200">{info.datasetRows}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Test split</span>
              <span className="font-mono tabular-nums text-slate-200">
                {info.testRows ? `${info.testRows} rows` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last trained</span>
              <span className="max-w-[55%] truncate font-mono text-slate-300">
                {formatTrainedAt(info.trainedAt)}
              </span>
            </div>
          </div>
        </Card>

        {/* Model schema */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Model schema"
            subtitle="Inputs and outputs consumed and emitted by the trained pipeline."
            icon={<ListChecks className="h-4 w-4" />}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Features
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">
                  {info.featureCount}
                </span>
              </p>
              <p className="flex items-center gap-2 text-[11px] text-slate-400">
                <Atom className="h-3.5 w-3.5 text-slate-500" />
                Substrates
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {info.supportedSubstrates.map((s) => (
                  <code
                    key={s}
                    className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                  >
                    {s}
                  </code>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Layers className="h-3.5 w-3.5 text-slate-500" />
                Coatings
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {info.supportedCoatings.map((c) => (
                  <code
                    key={c}
                    className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                  >
                    {c}
                  </code>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Targets
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] text-teal-400">
                  {info.targetCount}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {targets.map(([t]) => (
                  <code
                    key={t}
                    className="rounded border border-teal-500/25 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] text-teal-300"
                  >
                    {targetLabels[t] ?? t}
                  </code>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Data status</span>
                  <DataStatusTag label={info.dataStatus || "Demo"} tone="amber" />
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Metrics computed on the synthetic dataset — replace with experimental data before
                  drawing scientific conclusions.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Per-target metrics */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Per-target evaluation metrics</h3>
          <Badge tone="neutral">Held-out test split</Badge>
        </div>
        {!trained ? (
          <EmptyState
            icon={<BrainCircuit className="h-5 w-5" />}
            title="No metrics available"
            description="Run python -m app.ml.train in the backend to produce evaluation metrics."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {targets.map(([target, metric]) => (
              <Card key={target}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {targetLabels[target] ?? target}
                  </p>
                  <Badge tone={metric.selected_model === "XGBRegressor" ? "teal" : "neutral"}>
                    {metric.selected_model || "—"}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {metricDefs.map((def) => {
                    const value = metric[def.key];
                    return (
                      <div key={def.key}>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                          {def.label}
                        </p>
                        <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-slate-100">
                          {typeof value === "number" && Number.isFinite(value)
                            ? value.toFixed(4)
                            : "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                          {def.note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Readiness */}
      <Card>
        <CardHeader
          title="Training readiness"
          subtitle="Prerequisites for the XGBoost training run and current state of each."
          icon={<Database className="h-4 w-4" />}
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Dataset prepared", done: true, detail: `${info.datasetRows} rows · synthetic` },
            { label: "Features defined", done: true, detail: `${info.featureCount} process parameters` },
            { label: "Targets defined", done: true, detail: `${info.targetCount} coating properties` },
            { label: "Evaluation protocol", done: true, detail: "80/20 hold-out split, per-target metrics" },
            { label: "Model trained & saved", done: trained, detail: trained ? "pipeline persisted" : "training job pending" },
          ].map((r) => (
            <div
              key={r.label}
              className="rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-3"
            >
              <div className="flex items-center gap-2">
                {r.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
                <span className="text-xs font-medium text-slate-200">{r.label}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{r.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Diagnostics placeholders */}
      <section className="grid gap-4 lg:grid-cols-2">
        <PlaceholderChart
          title="Actual vs Predicted"
          subtitle="Scatter of observed vs model output for each target (demo pipeline)."
          icon={<ScatterIcon className="h-5 w-5" />}
        />
        <PlaceholderChart
          title="Feature Importance"
          subtitle="Relative contribution of each process parameter (model contribution, not causality)."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <PlaceholderChart
          title="Residual Distribution"
          subtitle="Spread of prediction residuals per target."
          icon={<Activity className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}