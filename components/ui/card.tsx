import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  pad?: boolean;
  padded?: boolean;
}

export function Card({ className, pad = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.07] bg-[#0c1428]",
        pad && "p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  aside,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-slate-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {aside}
    </div>
  );
}
