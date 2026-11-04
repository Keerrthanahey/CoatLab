import { cn } from "@/lib/utils";

type Tone = "neutral" | "amber" | "blue" | "teal" | "green" | "red";

const tones: Record<Tone, string> = {
  neutral: "border-white/10 bg-white/[0.05] text-slate-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  teal: "border-teal-500/25 bg-teal-500/10 text-teal-300",
  green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  red: "border-red-500/25 bg-red-500/10 text-red-300",
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
