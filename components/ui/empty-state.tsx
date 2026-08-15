import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "demo-pattern flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.12] bg-white/[0.03] text-center",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0c1428] text-slate-400">
          {icon}
        </div>
      )}
      <p className={cn("font-medium text-slate-200", compact ? "text-xs" : "text-sm")}>
        {title}
      </p>
      {description && (
        <p
          className={cn(
            "mt-1 max-w-sm leading-relaxed text-slate-400",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StateBanner({
  tone = "amber",
  icon,
  title,
  description,
}: {
  tone?: "amber" | "blue" | "red" | "neutral";
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  const tones = {
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    red: "border-red-500/25 bg-red-500/10 text-red-300",
    neutral: "border-white/[0.07] bg-white/[0.03] text-slate-200",
  };
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", tones[tone])}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        <p className="text-[13px] font-medium leading-snug">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed opacity-80">{description}</p>
        )}
      </div>
    </div>
  );
}
