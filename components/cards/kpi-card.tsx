import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "amber" | "blue" | "teal" | "green" | "red";

export function KpiCard({
  icon,
  label,
  value,
  sub,
  status,
  statusTone = "amber",
  accent = "text-slate-500",
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  status?: string;
  statusTone?: Tone;
  accent?: string;
  href?: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-shadow hover:shadow-md">
      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-10 rounded-xl"
          aria-label={`Open ${label}`}
        />
      )}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50",
            accent,
          )}
        >
          {icon}
        </span>
        {status && <Badge tone={statusTone}>{status}</Badge>}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
          {sub}
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-blue-600" />
          )}
        </p>
      )}
    </div>
  );
}
