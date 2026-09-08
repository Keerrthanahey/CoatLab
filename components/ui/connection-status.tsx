"use client";

import { FlaskConical, Wifi, WifiOff, Loader2, Cable } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendHealth, type ConnectionState } from "@/lib/api/health";

const stateConfig: Record<
  ConnectionState,
  { label: string; detail: string; icon: React.ReactNode; tone: string }
> = {
  checking: {
    label: "Checking…",
    detail: "Verifying backend health",
    icon: <Loader2 className="h-4 w-4 animate-spin text-teal-400" />,
    tone: "border-white/[0.08] bg-white/[0.03]",
  },
  connected: {
    label: "Backend Connected",
    detail: "FastAPI health check OK",
    icon: <Wifi className="h-4 w-4 text-emerald-400" />,
    tone: "border-emerald-500/20 bg-emerald-500/[0.07]",
  },
  unavailable: {
    label: "Backend Unavailable",
    detail: "Health endpoint not reachable",
    icon: <WifiOff className="h-4 w-4 text-red-400" />,
    tone: "border-red-500/20 bg-red-500/[0.07]",
  },
  unconfigured: {
    label: "Mock mode",
    detail: "Set NEXT_PUBLIC_API_BASE_URL to connect",
    icon: <FlaskConical className="h-4 w-4 text-amber-400" />,
    tone: "border-amber-500/20 bg-amber-500/[0.07]",
  },
};

export function ConnectionStatus({ collapsed = false }: { collapsed?: boolean }) {
  const { state } = useBackendHealth();
  const cfg = stateConfig[state];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
        cfg.tone,
        collapsed && "justify-center px-2",
      )}
      role="status"
      aria-label={`${cfg.label}. ${cfg.detail}`}
    >
      <span className="shrink-0">{cfg.icon}</span>
      {!collapsed && (
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "text-[11px] font-medium leading-tight",
              state === "connected"
                ? "text-emerald-300"
                : state === "unavailable"
                  ? "text-red-300"
                  : state === "unconfigured"
                    ? "text-amber-300"
                    : "text-slate-200",
            )}
          >
            {cfg.label}
          </span>
          <span
            className={cn(
              "truncate text-[10px] leading-tight",
              state === "unconfigured" ? "text-amber-400/70" : "text-slate-500",
            )}
          >
            {cfg.detail}
          </span>
        </span>
      )}
    </div>
  );
}

export function FooterConnectionStatus() {
  const { state } = useBackendHealth();
  const icon = state === "connected" ? <Wifi /> : state === "unavailable" ? <WifiOff /> : <Cable />;
  const text =
    state === "connected"
      ? "Backend connected"
      : state === "unavailable"
        ? "Backend unavailable"
        : state === "unconfigured"
          ? "Mock API mode — connect NEXT_PUBLIC_API_BASE_URL for live backend"
          : "Checking backend connection…";
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {text}
    </span>
  );
}