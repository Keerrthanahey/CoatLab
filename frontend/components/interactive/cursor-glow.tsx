"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor + mouse-reactive glow system.
 *
 * - Glowing orb cursor with inertial following (rAF-driven, refs only — no
 *   React state on mousemove).
 * - Ambient "mouse glow" field that follows the pointer.
 * - Click ripple pulses at the click position.
 * - Buttons / links with `data-magnetic` are gently pulled toward the cursor.
 * - Disabled on touch (coarse pointer) and for prefers-reduced-motion users.
 */
export function CursorGlow() {
  const orbRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rippleHostRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;
    enabledRef.current = true;

    document.documentElement.classList.add("cursor-glow-active");

    const orb = orbRef.current;
    const halo = haloRef.current;
    const glow = glowRef.current;
    const rippleHost = rippleHostRef.current;
    if (!orb || !halo || !glow || !rippleHost) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const smooth = { x: target.x, y: target.y };
    let raf = 0;
    let visible = false;
    let scale = 1;

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        smooth.x = target.x;
        smooth.y = target.y;
        orb.style.opacity = "1";
        halo.style.opacity = "1";
        glow.style.opacity = "1";
      }
      orb.style.left = `${target.x}px`;
      orb.style.top = `${target.y}px`;
      glow.style.left = `${target.x}px`;
      glow.style.top = `${target.y}px`;

      // Magnetic pull for interactive elements
      const el = (e.target as Element | null)?.closest?.("[data-magnetic]");
      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect();
        const dx = target.x - (rect.left + rect.width / 2);
        const dy = target.y - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
        scale = 1.6;
      } else {
        const interactive = (e.target as Element | null)?.closest?.(
          "a, button, [role='button'], input, select, textarea, [data-cursor]",
        );
        scale = interactive ? 1.5 : 1;
      }
    };

    const onMouseLeave = () => {
      visible = false;
      orb.style.opacity = "0";
      halo.style.opacity = "0";
      glow.style.opacity = "0";
      (document.querySelectorAll("[data-magnetic]") as NodeListOf<HTMLElement>).forEach((el) => {
        el.style.transform = "";
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      rippleHost.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    };

    const loop = () => {
      smooth.x += (target.x - smooth.x) * 0.18;
      smooth.y += (target.y - smooth.y) * 0.18;
      halo.style.left = `${smooth.x}px`;
      halo.style.top = `${smooth.y}px`;
      const s = scale + (1 - scale) * 0.15;
      halo.style.transform = `translate(-50%, -50%) scale(${s})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("pointerdown", onPointerDown, true);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("cursor-glow-active");
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("pointerdown", onPointerDown, true);
      cancelAnimationFrame(raf);
      (document.querySelectorAll("[data-magnetic]") as NodeListOf<HTMLElement>).forEach((el) => {
        el.style.transform = "";
      });
    };
  }, []);

  return (
    <div ref={rippleHostRef} className="cursor-fx pointer-events-none fixed inset-0 z-[9999]">
      {/* Ambient mouse glow */}
      <div
        ref={glowRef}
        className="mouse-glow fixed h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ opacity: 0, transition: "opacity 0.3s ease" }}
        aria-hidden="true"
      />
      {/* Cursor orb + aura */}
      <div
        ref={orbRef}
        className="cursor-orb fixed h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ opacity: 0, transition: "opacity 0.2s ease" }}
        aria-hidden="true"
      />
      <div
        ref={haloRef}
        className="cursor-halo fixed h-10 w-10 ring-1 ring-teal-400/40"
        style={{ opacity: 0, transition: "opacity 0.2s ease" }}
        aria-hidden="true"
      />
    </div>
  );
}