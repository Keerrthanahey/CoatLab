"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SensitivityPoint } from "@/lib/types";
import { chartTheme, ChartCard, ChartLegend } from "./base";

interface TooltipEntry {
  name?: string;
  color?: string;
  value?: number;
  payload?: { x: number };
}

function CustomTooltip({ active, payload, unit }: {
  active?: boolean;
  payload?: TooltipEntry[];
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2 shadow-lg">
      <p className="mb-1 font-mono text-[11px] font-semibold text-slate-200">
        {payload[0].payload?.x} {unit}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[11px]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="w-20 text-slate-400">{p.name}</span>
          <span className="ml-auto font-mono tabular-nums text-slate-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function SensitivityChart({
  points,
  unit,
  height = 260,
}: {
  points: SensitivityPoint[];
  unit: string;
  height?: number;
}) {
  const normalized = points.map((p) => {
    const arr = (key: "thickness" | "porosity" | "corrosion") => {
      const vals = points.map((q) => q[key]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      return { value: p[key], rel: max === min ? 50 : ((p[key] - min) / (max - min)) * 100 };
    };
    return {
      x: p.x,
      thickness: +arr("thickness").rel.toFixed(1),
      porosity: +arr("porosity").rel.toFixed(1),
      corrosion: +arr("corrosion").rel.toFixed(1),
    };
  });

  return (
    <ChartCard
      title="Process parameter sensitivity"
      subtitle={`Response to ${unit ? "changes in " + unit : "the selected parameter"} — relative scale, illustrative.`}
      demo="Demo"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalized} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="x"
            tick={chartTheme.font}
            tickLine={false}
            axisLine={{ stroke: chartTheme.grid }}
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `${v}${unit ? "" : ""}`}
          />
          <YAxis
            tick={chartTheme.font}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Line
            type="monotone"
            dataKey="thickness"
            name="Thickness"
            stroke={chartTheme.colors.blue}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="porosity"
            name="Porosity"
            stroke={chartTheme.colors.teal}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="corrosion"
            name="Corrosion"
            stroke={chartTheme.colors.amber}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] text-slate-400">
        Normalized 0–100 for cross-metric comparison. Not fitted to data.
      </p>
      <ChartLegend
        items={[
          { label: "Coating thickness", color: chartTheme.colors.blue },
          { label: "Porosity", color: chartTheme.colors.teal },
          { label: "Corrosion resistance", color: chartTheme.colors.amber },
        ]}
      />
    </ChartCard>
  );
}
