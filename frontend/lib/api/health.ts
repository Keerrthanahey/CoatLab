"use client";

import { useEffect, useState } from "react";

export type ConnectionState = "checking" | "connected" | "unavailable" | "unconfigured";

/**
 * Polls the FastAPI health endpoint and reports a genuine connection status.
 *
 * - unconfigured — no NEXT_PUBLIC_API_BASE_URL set (mock client active)
 * - checking     — health request in flight
 * - connected    — GET /api/health returned HTTP 200
 * - unavailable  — request failed, timed out, or endpoint returned an error
 */
export function useBackendHealth(): { state: ConnectionState; baseUrl: string | null } {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || null;
  const [state, setState] = useState<ConnectionState>(
    baseUrl ? "checking" : "unconfigured",
  );

  useEffect(() => {
    if (!baseUrl) {
      return;
    }

    let active = true;

    const check = async () => {
      if (!active) return;
      setState("checking");
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${baseUrl}/api/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);
        if (!active) return;
        setState(res.ok ? "connected" : "unavailable");
      } catch {
        if (active) setState("unavailable");
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [baseUrl]);

  return { state, baseUrl };
}