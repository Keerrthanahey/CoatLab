import { cn } from "@/lib/utils";

export function PropertyRow({
  label,
  value,
  mono = true,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 text-[13px] last:border-0",
        className,
      )}
    >
      <span className="text-slate-500">{label}</span>
      <span
        className={cn(
          "text-right text-slate-800",
          mono && "font-mono text-[13px] tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PropertyGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}
