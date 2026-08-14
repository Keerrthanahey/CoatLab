"use client";

/* eslint-disable @next/next/no-img-element -- blob: object URLs can't use next/image */

import { useState } from "react";
import { ScanLine, ScanSearch, ImageIcon, Layers } from "lucide-react";
import { api } from "@/lib/api/client";
import type { MicrostructureResult } from "@/lib/types";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, DataStatusTag } from "@/components/ui/badge";
import { StateBanner } from "@/components/ui/empty-state";
import { UploadZone } from "@/components/microstructure/upload-zone";
import { PoreSizeHistogram } from "@/components/charts/pore-histogram";

type Phase = "idle" | "analyzing" | "success";

/* Deterministic overlay dots (percent positions) simulating detected pores. */
const overlayDots: { x: number; y: number; r: number }[] = [
  { x: 18, y: 22, r: 10 },
  { x: 34, y: 58, r: 14 },
  { x: 52, y: 18, r: 8 },
  { x: 66, y: 42, r: 12 },
  { x: 81, y: 26, r: 9 },
  { x: 24, y: 78, r: 11 },
  { x: 44, y: 34, r: 7 },
  { x: 58, y: 70, r: 13 },
  { x: 72, y: 86, r: 9 },
  { x: 88, y: 62, r: 10 },
  { x: 10, y: 50, r: 8 },
  { x: 38, y: 88, r: 12 },
  { x: 64, y: 8, r: 6 },
  { x: 92, y: 14, r: 7 },
];

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 font-mono text-xl font-semibold tracking-tight text-slate-900">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>}
      </p>
    </div>
  );
}

export default function MicrostructurePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<MicrostructureResult | null>(null);

  const handleFile = async (selected: File) => {
    const isTiff =
      selected.name.toLowerCase().endsWith(".tif") ||
      selected.name.toLowerCase().endsWith(".tiff");

    setFile(selected);
    setPhase("analyzing");
    setResult(null);

    if (!isTiff) {
      setPreviewUrl(URL.createObjectURL(selected));
    }

    try {
      const data = await api.analyzeMicrostructure(selected.name);
      setResult(data);
      setPhase("success");
    } catch {
      setPhase("idle");
    }
  };

  const isTiff =
    file?.name.toLowerCase().endsWith(".tif") ||
    file?.name.toLowerCase().endsWith(".tiff");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Image analysis"
        title="Microstructure Analysis"
        description="Analyze SEM / microscopy images to estimate coating porosity and pore characteristics."
        demoLabel="Demo pipeline"
      />

      {phase === "idle" && (
        <UploadZone onFile={handleFile} />
      )}

      {phase === "analyzing" && (
        <div className="demo-pattern flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-20 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-teal-200/70" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-teal-200 bg-white">
              <ScanSearch className="h-5 w-5 animate-pulse text-teal-700" />
            </span>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-800">
            Segmenting pores and analyzing microstructure…
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Thresholding, morphological filtering and pore labeling would run
            against <code className="font-mono">POST /api/analyze-microstructure</code>.
          </p>
        </div>
      )}

      {phase === "success" && result && (
        <div className="space-y-5 rise">
          <StateBanner
            tone="amber"
            icon={<Layers className="h-4 w-4" />}
            title="Demonstration analysis — not a real segmentation"
            description="The processed image and pore statistics are simulated placeholders for interface development. The real image-processing pipeline (segment → label → measure) is not yet connected."
          />

          {/* Images */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Original image"
                subtitle={file ? file.name : "—"}
                icon={<ImageIcon className="h-4 w-4" />}
              />
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
                {isTiff ? (
                  <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                    <ImageIcon className="h-8 w-8 text-slate-500" />
                    <p className="mt-3 text-xs font-medium text-slate-300">
                      TIFF preview not supported in browser
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {file?.name} will be processed server-side by the
                      analysis pipeline.
                    </p>
                  </div>
                ) : (
                  <img
                    src={previewUrl ?? ""}
                    alt="Uploaded microstructure"
                    className="h-64 w-full object-contain"
                  />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Processed image"
                subtitle="Pore segmentation — placeholder overlay"
                icon={<ScanLine className="h-4 w-4" />}
                aside={<DataStatusTag label="Simulated" />}
              />
              <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
                {isTiff || !previewUrl ? (
                  <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                    <ScanLine className="h-8 w-8 text-slate-500" />
                    <p className="mt-3 text-xs font-medium text-slate-300">
                      Processed output pending
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Segmentation output will appear here once the pipeline is connected.
                    </p>
                  </div>
                ) : (
                  <div className="relative h-64">
                    <img
                      src={previewUrl}
                      alt="Processed microstructure"
                      className="h-full w-full object-contain opacity-90 grayscale contrast-125"
                    />
                    {overlayDots.map((d, i) => (
                      <span
                        key={i}
                        className="absolute rounded-full border border-teal-300/90 bg-teal-400/15"
                        style={{
                          left: `${d.x}%`,
                          top: `${d.y}%`,
                          width: d.r * 2,
                          height: d.r * 2,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Scale bar and calibration assumed for demo ({result.imageWidthPx} × {result.imageHeightPx} px).
              </p>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Pore count" value={String(result.poreCount)} />
            <StatCard label="Total porosity" value={String(result.porosity)} unit="%" />
            <StatCard label="Avg pore size" value={String(result.avgPoreSize)} unit="μm" />
            <StatCard label="Maximum pore size" value={String(result.maxPoreSize)} unit="μm" />
            <StatCard label="Minimum pore size" value={String(result.minPoreSize)} unit="μm" />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <PoreSizeHistogram distribution={result.distribution} />
            <Card>
              <CardHeader
                title="Pore morphology notes"
                subtitle="Interpretation guidance"
                icon={<ScanLine className="h-4 w-4" />}
              />
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-500">
                <p>
                  Pores in plasma-electrolytic oxide coatings form where the
                  discharge channels cool and solidify. Size and density are
                  controlled primarily by current density, frequency and duty
                  cycle.
                </p>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <span>Porosity class</span>
                  <Badge tone="teal">Low · dense coating</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <span>Distribution shape</span>
                  <Badge tone="neutral">Right-skewed · lognormal-like</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Classification is derived from the demo statistics above and
                  is not a scientific determination.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge tone="neutral">
              Analyzed {file?.name} · {new Date(result.analyzedAt).toLocaleString()}
            </Badge>
            <button
              onClick={() => {
                setPhase("idle");
                setFile(null);
                setPreviewUrl(null);
                setResult(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Analyze another image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
