"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TooltipEntry {
  payload?: { axis: string; value: number; raw: number };
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-slate-200">{entry.axis}</p>
      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-teal-400">
        {entry.raw.toFixed(2)} · {entry.value.toFixed(0)}/100
      </p>
    </div>
  );
}

export function PerformanceRadar({
  data,
  maxValues,
  height = 280,
}: {
  data: Record<string, number>;
  maxValues?: Record<string, number>;
  height?: number;
}) {
  const chartData = Object.entries(data).map(([axis, raw]) => {
    const max = maxValues?.[axis];
    const scale = typeof max === "number" && max > 0 ? max : 100;
    const normalized = Math.min(100, Math.max(0, (raw / scale) * 100));
    return { axis, value: +normalized.toFixed(1), raw };
  });

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.09)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Tooltip content={<RadarTooltip />} />
        <Radar
          dataKey="value"
          stroke="#ffffff"
          strokeWidth={1.5}
          fill="#14b8a6"
          fillOpacity={0.3}
          dot={{ r: 2.5, fill: "#14b8a6", stroke: "transparent" }}
          activeDot={{ r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
