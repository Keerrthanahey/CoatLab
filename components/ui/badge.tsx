import { cn } from "@/lib/utils";

type Tone = "neutral" | "amber" | "blue" | "teal" | "green" | "red";

const tones: Record<Tone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
};

const dotColors: Record<Tone, string> = {
  neutral: "bg-slate-400",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

export function Badge({
  children,
  tone = "neutral",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-4",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[tone])} />}
      {children}
    </span>
  );
}

/**
 * Tag used to clearly mark non-scientific / placeholder content so it can
 * never be mistaken for verified results.
 */
export function DataStatusTag({
  label = "Demo data",
  tone = "amber",
  className,
}: {
  label?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-dashed px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
