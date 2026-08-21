"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LineChart } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, StateBanner } from "@/components/ui/empty-state";
import { UploadZone } from "@/components/ui/upload-zone";
import { ComparisonTable, type ComparisonColumn } from "@/components/charts/comparison-table";

const API_BASE = "http://localhost:8000";

interface FigureResult {
  xAxis: string | null;
  yAxis: string | null;
  points: { x: number; y: number }[];
  confidence: number | null;
  notes: string | null;
}

function normalizeFigure(raw: unknown): FigureResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  let xAxis: string | null = null;
  let yAxis: string | null = null;
  if (r.axes && typeof r.axes === "object") {
    const a = r.axes as Record<string, unknown>;
    xAxis = a.x != null ? String(a.x) : (a.x_label != null ? String(a.x_label) : null);
    yAxis = a.y != null ? String(a.y) : (a.y_label != null ? String(a.y_label) : null);
  }
  if (!xAxis && r.x_label != null) xAxis = String(r.x_label);
  if (!yAxis && r.y_label != null) yAxis = String(r.y_label);

  const listRaw = r.data_points ?? r.points ?? r.data;
  const points: { x: number; y: number }[] = [];
  if (Array.isArray(listRaw)) {
    for (const item of listRaw) {
      if (Array.isArray(item) && item.length >= 2) {
        const x = Number(item[0]);
        const y = Number(item[1]);
        if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
      } else if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const x = Number(o.x ?? o.x_value);
        const y = Number(o.y ?? o.y_value);
        if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y });
      }
    }
  }

  let confidence: number | null = null;
  const confRaw = Number(r.confidence ?? r.confidence_score);
  if (Number.isFinite(confRaw)) {
    confidence = confRaw <= 1 ? confRaw * 100 : confRaw;
    confidence = Math.min(100, Math.max(0, confidence));
  }

  const notes =
    r.notes != null
      ? String(r.notes)
      : r.extraction_notes != null
        ? String(r.extraction_notes)
        : null;

  return { xAxis, yAxis, points, confidence, notes };
}

const fmt = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v).toFixed(3) : "—");

const POINT_COLUMNS: ComparisonColumn[] = [
  { key: "index", label: "#", format: (v) => String(v) },
  { key: "x", label: "X", format: fmt },
  { key: "y", label: "Y", format: fmt },
];

export default function MLFigurePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FigureResult | null>(null);

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
      const res = await fetch(`${API_BASE}/api/analysis/figure`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Extraction service returned ${res.status}`);
      const json: unknown = await res.json();
      const normalized = normalizeFigure(json);
      if (!normalized || normalized.points.length === 0) {
        throw new Error("No data points could be extracted from this figure");
      }
      setResult(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Figure analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const confidenceTone =
    result?.confidence == null
      ? "neutral"
      : result.confidence >= 75
        ? "teal"
        : result.confidence >= 50
          ? "amber"
          : "red";

  const confidenceColor =
    confidenceTone === "teal"
      ? "#14b8a6"
      : confidenceTone === "amber"
        ? "#f59e0b"
        : "#ef4444";

  const tableData = result
    ? result.points.slice(0, 50).map((p, i) => ({ index: i + 1, x: p.x, y: p.y }))
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Data Extraction"
        title="Scientific Figure Analysis"
        description="Upload a plot or chart from a paper and extract the underlying data points with axis context."
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
              title="Figure Upload"
              subtitle="Chart / plot image from literature"
              icon={<LineChart className="h-4 w-4" />}
            />
            <div className="mt-4">
              <UploadZone
                onFile={handleFile}
                previewUrl={previewUrl}
                loading={loading}
                title="Drop a figure or click to browse"
                description="PNG / JPG · line & scatter plots work best"
              />
            </div>
          </Card>

          <StateBanner
            tone="amber"
            title="Demo extraction"
            description="Extracted data comes from the local demo service and is illustrative only — always verify against the source figure."
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
              title="Extraction failed"
              description={`${error}. Make sure the backend is running on ${API_BASE}.`}
            />
          )}

          {loading && (
            <EmptyState
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Extracting data…"
              description="Detecting axes and digitizing plotted series."
            />
          )}

          {!loading && !result && !error && (
            <EmptyState
              icon={<LineChart className="h-5 w-5" />}
              title="No extraction yet"
              description="Upload a scientific figure to detect its axes and recover the plotted data points."
            />
          )}

          {!loading && result && (
            <>
              <Card>
                <CardHeader
                  title="Detection Summary"
                  subtitle="Axes, confidence and extraction quality"
                />
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {result.xAxis ? (
                      <Badge tone="blue" dot>
                        X axis: {result.xAxis}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">X axis not detected</Badge>
                    )}
                    {result.yAxis ? (
                      <Badge tone="blue" dot>
                        Y axis: {result.yAxis}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Y axis not detected</Badge>
                    )}
                    <Badge tone="neutral">{result.points.length} points</Badge>
                  </div>

                  {result.confidence != null && (
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium text-slate-400">
                          Extraction confidence
                        </span>
                        <span
                          className="font-mono text-sm font-semibold tabular-nums"
                          style={{ color: confidenceColor }}
                        >
                          {result.confidence.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: confidenceColor }}
                        />
                      </div>
                    </div>
                  )}

                  {result.notes && (
                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Extraction notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-300">
                        {result.notes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <ComparisonTable columns={POINT_COLUMNS} data={tableData} />
                {result.points.length > 50 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Showing first 50 of {result.points.length} extracted points.
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
