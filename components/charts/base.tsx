import { cn } from "@/lib/utils";

/** Shared Recharts style tokens for a consistent scientific look. */
export const chartTheme = {
  grid: "#e7ebf1",
  tick: "#64748b",
  font: { fontFamily: "inherit", fontSize: 11 },
  colors: {
    blue: "#2563eb",
    teal: "#0d9488",
    amber: "#d97706",
    slate: "#94a3b8",
    red: "#dc2626",
  },
};

export function ChartCard({
  title,
  subtitle,
  demo,
  aside,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  demo?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {demo && (
            <span className="rounded border border-dashed border-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              {demo}
            </span>
          )}
          {aside}
        </div>
      </div>
      {children}
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
