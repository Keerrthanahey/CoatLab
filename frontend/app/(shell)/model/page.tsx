import type { Metadata } from "next";
import {
  BrainCircuit,
  ScatterChart as ScatterIcon,
  BarChart3,
  Activity,
  TrendingUp,
  CheckCircle2,
  Circle,
  Database,
  ListChecks,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, DataStatusTag } from "@/components/ui/badge";
import { StateBanner } from "@/components/ui/empty-state";
import { PlaceholderChart } from "@/components/charts/placeholder-chart";

export const metadata: Metadata = { title: "Model Performance" };

const metricDefs = [
  { key: "r2", label: "R²", note: "Coefficient of determination — share of variance explained." },
  { key: "mae", label: "MAE", note: "Mean absolute error on held-out test predictions." },
  { key: "rmse", label: "RMSE", note: "Root mean squared error — penalizes large deviations." },
  { key: "mape", label: "MAPE", note: "Mean absolute percentage error, scale-independent." },
] as const;

export default async function ModelPage() {
  const status = await api.model.status();

  const readiness = [
    { label: "Dataset prepared", done: false, detail: "0 records · awaiting literature extraction" },
    { label: "Features defined", done: true, detail: `${status.features.length} process parameters` },
    { label: "Targets defined", done: true, detail: `${status.targets.length} coating properties` },
    { label: "Evaluation protocol", done: true, detail: "80/20 hold-out split, per-target metrics" },
    { label: "Model trained & saved", done: false, detail: "training job pending" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="ML training & evaluation"
        title="Model Performance"
        description="Training status and evaluation metrics for the coating-property regressor. Metrics are never fabricated — they appear only after real training."
        demoLabel="Not trained"
      />

      <StateBanner
        tone="amber"
        icon={<BrainCircuit className="h-4 w-4" />}
        title="ML Model Status — Not Trained"
        description="Metrics will appear after the research dataset is prepared and the model is trained. Until then, all performance surfaces remain empty."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Status */}
        <Card>
          <CardHeader
            title="Model registry"
            subtitle="Registered target model for coating property regression."
            icon={<BrainCircuit className="h-4 w-4" />}
          />
          <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Status</p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="font-mono text-lg font-semibold text-white">
                Not Trained
              </span>
              <Badge tone="amber" dot>
                Awaiting training
              </Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Model ID</span>
              <code className="font-mono text-slate-200">{status.modelId}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dataset rows</span>
              <span className="font-mono tabular-nums text-slate-200">{status.datasetRows}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last trained</span>
              <span className="font-mono text-slate-400">—</span>
            </div>
          </div>
        </Card>

        {/* Feature / target schema */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Model schema"
            subtitle="Inputs and outputs the trained model will consume and emit."
            icon={<ListChecks className="h-4 w-4" />}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Features
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">
                  {status.features.length}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {status.features.map((f) => (
                  <code
                    key={f}
                    className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                  >
                    {f}
                  </code>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Targets
                <span className="rounded bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] text-teal-400">
                  {status.targets.length}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {status.targets.map((t) => (
                  <code
                    key={t}
                    className="rounded border border-teal-500/25 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] text-teal-300"
                  >
                    {t}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Metrics */}
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">Evaluation metrics</h3>
        </div>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {metricDefs.map((m) => (
            <Card key={m.key}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {m.label}
                </span>
                <DataStatusTag label="Pending" />
              </div>
              <p className="mt-2 font-mono text-3xl font-semibold text-slate-300">—</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{m.note}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Readiness */}
      <Card>
        <CardHeader
          title="Training readiness"
          subtitle="Prerequisites tracked before a training run can be scheduled."
          icon={<Database className="h-4 w-4" />}
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {readiness.map((r) => (
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

      {/* Empty chart containers */}
      <section className="grid gap-4 lg:grid-cols-2">
        <PlaceholderChart
          title="Actual vs Predicted"
          subtitle="Scatter of observed vs model output for each target."
          icon={<ScatterIcon className="h-5 w-5" />}
        />
        <PlaceholderChart
          title="Feature Importance"
          subtitle="Relative contribution of each process parameter."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <PlaceholderChart
          title="Residual Distribution"
          subtitle="Error histogram per target property."
          icon={<Activity className="h-5 w-5" />}
        />
        <PlaceholderChart
          title="Training Performance"
          subtitle="Loss / metric curves across epochs."
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>
    </div>
  );
}
