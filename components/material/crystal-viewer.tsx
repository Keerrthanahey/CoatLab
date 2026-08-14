"use client";

import { Box, RotateCw, Minimize2 } from "lucide-react";

/**
 * Placeholder for the interactive 3D crystal structure viewer.
 * Renders a static schematic of the Mg hcp unit cell until a real viewer
 * (e.g. Materials Project 3D / three.js) is connected.
 */
export function CrystalViewerPlaceholder() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Crystal structure</h3>
          <p className="text-xs text-slate-500">hcp · P63/mmc · schematic</p>
        </div>
        <span className="rounded border border-dashed border-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600">
          Placeholder
        </span>
      </div>

      <div className="demo-pattern relative flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 [perspective:800px]">
        <svg
          viewBox="0 0 220 190"
          className="h-full max-h-72 w-full transition-transform duration-500 hover:[transform:rotateY(10deg)_rotateX(4deg)]"
          aria-label="Schematic hexagonal close-packed unit cell of magnesium"
        >
          {/* vertical dashed edges (back) */}
          <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3">
            <line x1="50" y1="70" x2="50" y2="100" />
            <line x1="125" y1="35" x2="125" y2="65" />
            <line x1="150" y1="70" x2="150" y2="100" />
          </g>

          {/* top face */}
          <polygon
            points="150,70 125,105 75,105 50,70 75,35 125,35"
            fill="#eef5ff"
            stroke="#60a5fa"
            strokeWidth="1.6"
          />
          {/* front-left face */}
          <polygon
            points="50,70 50,100 125,135 125,105"
            fill="#ffffff"
            stroke="#93c5fd"
            strokeWidth="1.2"
          />
          {/* front-right face */}
          <polygon
            points="125,105 125,135 150,100 150,70"
            fill="#f8fafc"
            stroke="#93c5fd"
            strokeWidth="1.2"
          />

          {/* corner atoms */}
          {[
            [50, 70],
            [125, 35],
            [150, 70],
            [125, 105],
            [75, 105],
            [75, 35],
          ].map(([cx, cy]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="6"
              fill="#dbeafe"
              stroke="#60a5fa"
              strokeWidth="1.2"
            />
          ))}

          {/* central atom + vertical bond */}
          <circle cx="100" cy="70" r="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.4" />
          <circle cx="97.5" cy="67" r="3" fill="rgba(255,255,255,0.55)" />
          <line x1="100" y1="80" x2="100" y2="103" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />

          {/* lattice vector a */}
          <line x1="125" y1="70" x2="150" y2="70" stroke="#0f172a" strokeWidth="1" />
          <polygon points="150,70 145,66.5 145,73.5" fill="#0f172a" />
          <text x="137" y="64" fontSize="9" fill="#475569" fontFamily="monospace">
            a
          </text>

          {/* lattice vector c */}
          <line x1="50" y1="100" x2="50" y2="128" stroke="#0f172a" strokeWidth="1" strokeDasharray="2 2" />
          <text x="54" y="126" fontSize="9" fill="#475569" fontFamily="monospace">
            c
          </text>
        </svg>
      </div>

      {/* viewer controls (disabled — placeholder) */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { icon: RotateCw, label: "Orbit" },
          { icon: Minimize2, label: "Fit" },
          { icon: Box, label: "Toggle atoms" },
        ].map((ctrl) => (
          <button
            key={ctrl.label}
            disabled
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-400"
          >
            <ctrl.icon className="h-3.5 w-3.5" />
            {ctrl.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Interactive viewer not connected. Link the Materials Project structure
        renderer to enable rotation, zoom and atom toggling.
      </p>
    </div>
  );
}
