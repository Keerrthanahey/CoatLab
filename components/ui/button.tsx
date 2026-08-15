"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white border border-transparent hover:bg-blue-500 focus-visible:ring-teal-500/30",
  secondary:
    "bg-[#0c1428] text-slate-200 border border-white/15 hover:bg-white/[0.05] hover:border-white/25 focus-visible:ring-white/20",
  ghost:
    "bg-transparent text-slate-400 border border-transparent hover:bg-white/[0.05] hover:text-slate-200 focus-visible:ring-white/20",
  danger:
    "bg-red-600 text-white border border-transparent hover:bg-red-500 focus-visible:ring-red-600/30",
  subtle:
    "bg-white/[0.06] text-slate-200 border border-transparent hover:bg-white/[0.1] focus-visible:ring-white/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9.5 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-sm gap-2",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
