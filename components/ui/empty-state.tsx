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
        "demo-pattern flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm">
          {icon}
        </div>
      )}
      <p className={cn("font-medium text-slate-700", compact ? "text-xs" : "text-sm")}>
        {title}
      </p>
      {description && (
        <p
          className={cn(
            "mt-1 max-w-sm leading-relaxed text-slate-500",
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
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    red: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
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
