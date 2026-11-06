"use client";

import { useEffect, useRef } from "react";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// Mg HCP crystal structure atoms (fractional-inspired, normalized)
const ATOMS: Vec3[] = [
  // Bottom hexagonal layer (z = -1.0)
  { x: 1.0, y: 0.0, z: -1.0 },
  { x: 0.5, y: 0.866, z: -1.0 },
  { x: -0.5, y: 0.866, z: -1.0 },
  { x: -1.0, y: 0.0, z: -1.0 },
  { x: -0.5, y: -0.866, z: -1.0 },
  { x: 0.5, y: -0.866, z: -1.0 },
  { x: 0.0, y: 0.0, z: -1.0 }, // center

  // Middle layer — HCP interlayer positions (z = 0.0)
  { x: 0.5, y: 0.289, z: 0.0 },
  { x: -0.5, y: 0.289, z: 0.0 },
  { x: 0.0, y: -0.577, z: 0.0 },

  // Top hexagonal layer (z = 1.0)
  { x: 1.0, y: 0.0, z: 1.0 },
  { x: 0.5, y: 0.866, z: 1.0 },
  { x: -0.5, y: 0.866, z: 1.0 },
  { x: -1.0, y: 0.0, z: 1.0 },
  { x: -0.5, y: -0.866, z: 1.0 },
  { x: 0.5, y: -0.866, z: 1.0 },
  { x: 0.0, y: 0.0, z: 1.0 }, // center
];

// Auto-compute bonds by distance threshold
function computeBonds(atoms: Vec3[], threshold: number): [number, number][] {
  const bonds: [number, number][] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].x - atoms[j].x;
      const dy = atoms[i].y - atoms[j].y;
      const dz = atoms[i].z - atoms[j].z;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) <= threshold) {
        bonds.push([i, j]);
      }
    }
  }
  return bonds;
}

const BONDS = computeBonds(ATOMS, 1.15);

function rotateY(v: Vec3, a: number): Vec3 {
  return {
    x: v.x * Math.cos(a) + v.z * Math.sin(a),
    y: v.y,
    z: -v.x * Math.sin(a) + v.z * Math.cos(a),
  };
}

function rotateX(v: Vec3, a: number): Vec3 {
  return {
    x: v.x,
    y: v.y * Math.cos(a) - v.z * Math.sin(a),
    z: v.y * Math.sin(a) + v.z * Math.cos(a),
  };
}

function project(v: Vec3, scale: number, cx: number, cy: number): { px: number; py: number; scale: number } {
  const fov = 3.5;
  const s = fov / (fov + v.z);
  return { px: v.x * s * scale + cx, py: v.y * s * scale + cy, scale: s };
}

export function Crystal3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const autoRotRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const autoRotSpeed = prefersReduced ? 0.0008 : 0.004;

    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const toHover = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - canvas.width / 2) / canvas.width,
        y: (e.clientY - rect.top - canvas.height / 2) / canvas.height,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      velRef.current = { x: 0, y: 0 };
      lastRef.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (draggingRef.current) {
        const dx = e.clientX - lastRef.current.x;
        const dy = e.clientY - lastRef.current.y;
        lastRef.current = { x: e.clientX, y: e.clientY };
        dragRef.current.y += dx * 0.006;
        dragRef.current.x = clamp(dragRef.current.x + dy * 0.006, -1.1, 1.1);
        velRef.current = { x: dy * 0.006, y: dx * 0.006 };
        return;
      }
      if (!isTouch) {
        const h = toHover(e);
        hoverRef.current.x = clamp(h.x, -1, 1);
        hoverRef.current.y = clamp(h.y, -1, 1);
      }
    };

    const endDrag = () => {
      draggingRef.current = false;
      canvas.style.cursor = "grab";
    };

    const onPointerLeave = () => {
      if (!draggingRef.current) {
        hoverRef.current = { x: 0, y: 0 };
      }
    };

    const draw = () => {
      if (!visible) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      autoRotRef.current += autoRotSpeed;
      const auto = autoRotRef.current;

      if (!draggingRef.current) {
        dragRef.current.x = clamp(dragRef.current.x + velRef.current.x, -1.1, 1.1);
        dragRef.current.y += velRef.current.y;
        velRef.current.x *= 0.95;
        velRef.current.y *= 0.95;
      }

      const interactive = draggingRef.current;
      const mx = interactive ? 0 : hoverRef.current.x * 1.4;
      const my = interactive ? 0 : hoverRef.current.y * 1.4;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) * 0.28;

      const transformed = ATOMS.map((a) => {
        let v = rotateY(a, auto + dragRef.current.y + mx);
        v = rotateX(v, 0.35 + dragRef.current.x + my);
        return v;
      });

      const projected = transformed.map((v, i) => ({ ...project(v, scale, cx, cy), z: v.z, i }));
      projected.sort((a, b) => a.z - b.z);

      for (const [ai, bi] of BONDS) {
        const pa = projected.find((p) => p.i === ai)!;
        const pb = projected.find((p) => p.i === bi)!;
        const avgZ = (pa.z + pb.z) / 2;
        const alpha = 0.12 + ((avgZ + 1.5) / 3) * 0.28;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(20,184,166,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(pa.px, pa.py);
        ctx.lineTo(pb.px, pb.py);
        ctx.stroke();
      }

      for (const p of projected) {
        const depthFactor = (p.z + 1.5) / 3;
        const r = (2.2 + depthFactor * 2.5) * p.scale;
        const alpha = 0.4 + depthFactor * 0.55;

        const grd = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 3);
        grd.addColorStop(0, `rgba(20,184,166,${alpha * 0.25})`);
        grd.addColorStop(1, "rgba(20,184,166,0)");
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        const core = ctx.createRadialGradient(p.px - r * 0.3, p.py - r * 0.3, 0, p.px, p.py, r);
        core.addColorStop(0, `rgba(167,243,234,${alpha})`);
        core.addColorStop(0.6, `rgba(20,184,166,${alpha * 0.85})`);
        core.addColorStop(1, `rgba(13,148,136,${alpha * 0.6})`);
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.px - r * 0.28, p.py - r * 0.28, r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", onPointerLeave);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full touch-none overflow-hidden ${className}`}
      style={{ cursor: "grab" }}
      aria-hidden="true"
    />
  );
}
