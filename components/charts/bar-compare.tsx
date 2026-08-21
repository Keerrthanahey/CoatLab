"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface BarCompareItem {
  name: string;
  score: number;
  color?: string;
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: BarCompareItem }>;
}) {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) return null;
  const item = payload[0].payload as BarCompareItem;
  return (
    <div className="rounded-lg border border-white/[0.07] bg-[#0c1428] px-3 py-2 shadow-lg">
      <p className="max-w-[220px] truncate text-[11px] font-medium text-slate-200">
        {item.name}
      </p>
      <p className="mt-0.5 font-mono text-[11px] tabular-nums text-teal-400">
        Score {item.score.toFixed(1)}
      </p>
    </div>
  );
}

export function BarCompare({
  data,
  height = 240,
}: {
  data: BarCompareItem[];
  height?: number;
}) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          stroke="rgba(255,255,255,0.07)"
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
        />
        <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} isAnimationActive>
          {data.map((item) => (
            <Cell key={item.name} fill={item.color ?? "#14b8a6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
