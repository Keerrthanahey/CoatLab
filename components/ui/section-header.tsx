import { cn } from "@/lib/utils";
import { DataStatusTag } from "@/components/ui/badge";

export function SectionHeader({
  eyebrow,
  title,
  description,
  aside,
  demoLabel,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  demoLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] font-medium uppercase tracking-widest text-teal-700">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {demoLabel && <DataStatusTag label={demoLabel} className="mt-1.5" />}
        </div>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
