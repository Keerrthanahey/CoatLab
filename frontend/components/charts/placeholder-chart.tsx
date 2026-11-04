import { ChartCard } from "./base";

export function PlaceholderChart({
  title,
  subtitle,
  icon,
  label = "Chart appears after model training",
  description,
  height = 220,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  label?: string;
  description?: string;
  height?: number;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle} demo="Awaiting">
      <div
        className="demo-pattern flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.03] px-4 text-center"
        style={{ height }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0c1428] text-slate-400 shadow-sm">
          {icon}
        </div>
        <p className="mt-3 text-xs font-medium text-slate-400">{label}</p>
        {description && <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">{description}</p>}
      </div>
    </ChartCard>
  );
}
