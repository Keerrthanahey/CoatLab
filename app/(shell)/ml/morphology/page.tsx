"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Microscope, ScanLine } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StateBanner } from "@/components/ui/empty-state";
import { UploadZone } from "@/components/ui/upload-zone";
import { ChartCard } from "@/components/charts/base";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:8000";

interface MorphologyResult {
  poreCount: number;
  porosity: number;
  avgSize: number;
  maxSize: number;
  minSize: number;
  classification: string | null;
  distribution: { label: string; count: number }[];
}

function normalizeMorphology(raw: unknown): MorphologyResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const num = (...keys: string[]): number | null => {
    for (const k of keys) {
      const v = Number(r[k]);
      if (Number.isFinite(v)) return v;
    }
    return null;
  };
  const poreCount = num("pore_count", "poreCount", "num_pores");
  const porosity = num("porosity", "porosity_percent", "porosity_pct");
  if (poreCount === null || porosity === null) return null;

  let distribution: { label: string; count: number }[] = [];
  const distRaw = r.distribution ?? r.pore_distribution ?? r.histogram;
  if (Array.isArray(distRaw)) {
    distribution = distRaw.map((d, i) => {
      if (typeof d === "number" && Number.isFinite(d)) {
        return { label: `Bin ${i + 1}`, count: d };
      }
      const o = (d ?? {}) as Record<string, unknown>;
      const label = String(o.bin ?? o.label ?? o.range ?? `Bin ${i + 1}`);
      const count = Number(o.count ?? o.frequency ?? o.value);
      return { label, count: Number.isFinite(count) ? count : 0 };
    });
  }

  return {
    poreCount,
    porosity,
    avgSize: num("avg_pore_size", "average_pore_size", "avg_pore_diameter") ?? 0,
    maxSize: num("max_pore_size", "maximum_pore_size") ?? 0,
    minSize: num("min_pore_size", "minimum_pore_size") ?? 0,
    classification:
      r.classification != null && String(r.classification).length > 0
        ? String(r.classification)
        : null,
    distribution,
  };
}

function classificationTone(c: string): "green" | "amber" | "red" | "blue" {
  const s = c.toLowerCase();
  if (/dense|low|compact|excellent|good|fine/.test(s)) return "green";
  if (/moderate|medium|fair/.test(s)) return "amber";
  if (/high|porous|poor|degraded|coarse/.test(s)) return "red";
  return "blue";
}

function DistTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { label: string; count: number } }>;
}) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null;
  const d = payload[0].payload as { label: string; count: number };
  return (
    <div className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-slate-200">{d.label}</p>
      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-teal-400">
        {d.count} pores
      </p>
    </div>
  );
}

export default function MLMorphologyPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MorphologyResult | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = async (file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/analysis/morphology`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Analysis service returned ${res.status}`);
      const json: unknown = await res.json();
      const normalized = normalizeMorphology(json);
      if (!normalized) throw new Error("Unexpected response shape from analysis service");
      setResult(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Morphology analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const stats = result
    ? [
        { label: "Pore Count", value: result.poreCount.toFixed(0), unit: "" },
        { label: "Porosity", value: result.porosity.toFixed(2), unit: "%" },
        { label: "Avg Pore Size", value: result.avgSize.toFixed(2), unit: "μm" },
        { label: "Max Pore Size", value: result.maxSize.toFixed(2), unit: "μm" },
        { label: "Min Pore Size", value: result.minSize.toFixed(2), unit: "μm" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Image Analysis"
        title="Coating Morphology Analysis"
        description="Upload a cross-section or surface micrograph to quantify porosity and pore-size statistics."
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
              title="Micrograph Upload"
              subtitle="SEM / optical cross-section image"
              icon={<ScanLine className="h-4 w-4" />}
            />
            <div className="mt-4">
              <UploadZone
                onFile={handleFile}
                previewUrl={previewUrl}
                loading={loading}
                title="Drop a micrograph or click to browse"
                description="PNG / JPG · cross-section or top-view"
              />
            </div>
          </Card>

          <StateBanner
            tone="amber"
            title="Demo analysis"
            description="Pore statistics come from the local demo service and are illustrative only — not verified measurements."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
          className="space-y-5 lg:col-span-3"
        >
          {error && (
            <StateBanner
              tone="red"
              title="Analysis failed"
              description={`${error}. Make sure the backend is running on ${API_BASE}.`}
            />
          )}

          {loading && (
            <EmptyState
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Analyzing morphology…"
              description="Segmenting pores and computing size statistics."
            />
          )}

          {!loading && !result && !error && (
            <EmptyState
              icon={<Microscope className="h-5 w-5" />}
              title="No analysis yet"
              description="Upload a coating micrograph to extract pore count, porosity and pore-size distribution."
            />
          )}

          {!loading && result && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 * i, ease: "easeOut" }}
                    className="rounded-xl border border-white/[0.07] bg-[#0c1428] p-4"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                      {s.value}
                      {s.unit && (
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          {s.unit}
                        </span>
                      )}
                    </p>
                  </motion.div>
                ))}
              </div>

              {result.classification && (
                <Card>
                  <CardHeader
                    title="Classification"
                    subtitle="Qualitative coating density assessment"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <Badge
                      tone={classificationTone(result.classification)}
                      dot
                      className="px-3 py-1 text-xs"
                    >
                      {result.classification}
                    </Badge>
                  </div>
                </Card>
              )}

              {result.distribution.length > 0 && (
                <ChartCard
                  title="Pore size distribution"
                  subtitle="Detected pore population per size bin."
                  demo="Demo"
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={result.distribution}
                      margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.07)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<DistTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
