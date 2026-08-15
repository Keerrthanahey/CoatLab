"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PoreBin } from "@/lib/types";
import { chartTheme, ChartCard } from "./base";

export function PoreSizeHistogram({
  distribution,
  height = 220,
}: {
  distribution: PoreBin[];
  height?: number;
}) {
  return (
    <ChartCard
      title="Pore-size distribution"
      subtitle="Pore counts by size bin — demonstration histogram."
      demo="Demo"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={distribution} margin={{ top: 8, right: 12, bottom: 0, left: -22 }}>
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="bin"
            tick={{ ...chartTheme.font, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: chartTheme.grid }}
          />
          <YAxis tick={chartTheme.font} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(100,116,139,0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const bin = payload[0].payload as PoreBin;
              return (
                <div className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2 shadow-lg">
                  <p className="font-mono text-[11px] font-semibold text-slate-200">
                    {bin.bin} μm
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {bin.count} pores
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" fill={chartTheme.colors.teal} radius={[3, 3, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] text-slate-400">
        Bin width 1 μm. Not derived from real image segmentation.
      </p>
    </ChartCard>
  );
}
