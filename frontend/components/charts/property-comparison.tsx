"use client";

import type { PredictedProperty } from "@/lib/types";
import { ChartCard } from "./base";
import { cn } from "@/lib/utils";

const barColors = [
  "bg-blue-600",
  "bg-teal-600",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-600",
  "bg-indigo-500",
];

/**
 * Clean horizontal bar comparison of predicted properties.
 * Values are scaled relative to the maximum for visual comparison.
 */
export function PropertyComparison({
  properties,
}: {
  properties: PredictedProperty[];
}) {
  const max = Math.max(...properties.map((p) => p.value), 1);

  return (
    <ChartCard
      title="Predicted properties"
      subtitle="Relative magnitude comparison — demo values only."
      demo="Mock"
    >
      <div className="space-y-3.5">
        {properties.map((p, i) => (
          <div key={p.id} className="grid grid-cols-[130px_1fr_auto] items-center gap-3">
            <span className="truncate text-[11px] font-medium text-slate-400" title={p.label}>
              {p.label}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barColors[i])}
                style={{ width: `${Math.max((p.value / max) * 100, 3)}%` }}
              />
            </div>
            <span className="min-w-[64px] text-right font-mono text-[12px] font-medium tabular-nums text-slate-100">
              {p.value}
              {p.unit && <span className="ml-0.5 text-[10px] text-slate-400">{p.unit}</span>}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
