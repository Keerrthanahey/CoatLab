"use client";

import { useEffect, useRef } from "react";
import { Crystal3D } from "@/components/interactive/crystal-3d";

/**
 * The hero 3D visual.
 *
 * When NEXT_PUBLIC_SPLINE_SCENE_URL is configured, the Spline runtime is
 * loaded lazily — only once the host is in view on a non-mobile, fine-pointer
 * device — from the official package CDN (jsDelivr). The scene is then mounted
 * on a canvas. The runtime is never part of the app bundle; the cross-origin
 * dynamic import is passed through by the bundler untouched.
 *
 * Otherwise — no env var, mobile, or reduced motion — the in-house Mg HCP
 * crystal canvas is used. No external dependency, always available.
 */
export function Hero3D() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splineRef = useRef<{ dispose: () => void } | null>(null);

  const sceneUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !sceneUrl) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(min-width: 768px)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduceMotion || !mq.matches || !fine.matches) return;

    let destroyed = false;
    let observer: IntersectionObserver | null = null;

    const mountSpline = async () => {
      try {
        // URL import — passed through by the bundler, fetched at runtime.
        const runtimeUrl: string =
          "https://cdn.jsdelivr.net/npm/@splinetool/runtime@2.0.37/build/runtime.standalone.js";
        const mod = (await import(runtimeUrl)) as {
          Application: new (
            canvas: HTMLCanvasElement,
            opts?: { renderMode?: "auto" | "manual" | "continuous"; htmlContentMode?: "sandbox" | "inline" | "none" },
          ) => { load(path: string): Promise<void>; dispose(): void };
        };
        if (!mod.Application || destroyed) return;

        const app = new mod.Application(canvas, {
          renderMode: "auto",
          htmlContentMode: "sandbox",
        });
        splineRef.current = app;
        await app.load(sceneUrl);
      } catch {
        // Fall back silently to the crystal visual already underneath.
      }
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer?.disconnect();
          mountSpline();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(host);

    return () => {
      destroyed = true;
      observer?.disconnect();
      splineRef.current?.dispose();
      splineRef.current = null;
    };
  }, [sceneUrl]);

  return (
    <div ref={hostRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-label="Interactive 3D coating scene"
      />
      <div className="absolute inset-0">
        <Crystal3D />
      </div>
    </div>
  );
}