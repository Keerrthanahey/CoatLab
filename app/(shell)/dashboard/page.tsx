"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  BrainCircuit,
  Database,
  Gauge,
  ScanLine,
  Atom,
  ArrowUpRight,
  Boxes,
  ArrowRight,
  Server,
  Radio,
  Ruler,
} from "lucide-react";
import { ParticleCanvas } from "@/components/interactive/particle-canvas";
import { Crystal3D } from "@/components/interactive/crystal-3d";
import { StatCounter } from "@/components/interactive/stat-counter";
import { TiltCard } from "@/components/interactive/tilt-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api/client";

const quickActions = [
  {
    href: "/prediction",
    icon: Gauge,
    title: "Predict Properties",
    description: "Enter process parameters and generate coating-property predictions.",
    accent: "#14b8a6",
  },
  {
    href: "/microstructure",
    icon: ScanLine,
    title: "Analyze Microstructure",
    description: "Upload an SEM / microscopy image and analyze porosity and pore morphology.",
    accent: "#3b82f6",
  },
  {
    href: "/materials",
    icon: Atom,
    title: "Explore Material",
    description: "View crystal structure, thermodynamic and mechanical property data.",
    accent: "#8b5cf6",
  },
  {
    href: "/literature",
    icon: FileText,
    title: "Literature Intelligence",
    description: "Ask questions about the indexed research literature.",
    accent: "#f59e0b",
  },
];

const KPI_CARDS = [
  { label: "Current Material", value: "Mg", sub: "Magnesium · mp-153", status: "active" },
  { label: "Material ID", value: "mp-153", sub: "Materials Project", status: "active", mono: true },
  { label: "Literature Sources", value: "0", sub: "Not indexed", status: "pending" },
  { label: "ML Model", value: "—", sub: "Not trained", status: "inactive" },
  { label: "Dataset", value: "—", sub: "Awaiting literature", status: "inactive" },
  { label: "Predictions", value: "0", sub: "Run first prediction", status: "pending" },
];

const STATUS_COLOR: Record<string, string> = {
  active: "#14b8a6",
  pending: "#f59e0b",
  inactive: "#64748b",
};

const pipeline = [
  { name: "Literature", detail: "0 sources", status: "Not indexed", tone: "amber" as const, icon: FileText },
  { name: "Extraction", detail: "Not started", status: "Idle", tone: "neutral" as const, icon: Boxes },
  { name: "Dataset", detail: "0 records", status: "Awaiting literature", tone: "amber" as const, icon: Database },
  { name: "Training", detail: "—", status: "Not trained", tone: "amber" as const, icon: BrainCircuit },
  { name: "Prediction API", detail: "Mock responder", status: "Demo", tone: "blue" as const, icon: Radio },
];

const endpointStatuses = [
  { endpoint: API_ENDPOINTS.predict, service: "Property prediction", state: "Mock responder", tone: "blue" as const },
  { endpoint: API_ENDPOINTS.analyzeMicrostructure, service: "Microstructure analysis", state: "Mock responder", tone: "blue" as const },
  { endpoint: API_ENDPOINTS.literature.query, service: "Literature query", state: "Not connected", tone: "amber" as const },
  { endpoint: API_ENDPOINTS.materials.get("mp-153"), service: "Materials database", state: "Demo record", tone: "amber" as const },
  { endpoint: API_ENDPOINTS.dataset.records, service: "Dataset service", state: "Empty", tone: "neutral" as const },
  { endpoint: API_ENDPOINTS.model.status, service: "Model service", state: "Not trained", tone: "amber" as const },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden rounded-2xl border border-white/[0.06]">
        <ParticleCanvas />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(20,184,166,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 80% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 sm:px-8">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/5 px-3 py-1 font-mono text-xs text-teal-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
              Mg Coating Analysis Platform
            </div>

            <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">
              Materials
              <br />
              <span style={{ color: "#14b8a6" }}>Intelligence</span> Platform
            </h2>
            <p className="mb-8 mt-4 max-w-md text-base leading-relaxed text-slate-400">
              AI-assisted prediction and analysis of coating properties for advanced magnesium
              materials. Connect your research data and unlock model-driven insights.
            </p>

            <div className="mb-12 flex flex-wrap gap-3">
              <Link
                href="/prediction"
                className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-teal-400"
              >
                Run Prediction
              </Link>
              <Link
                href="/materials"
                className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Explore Material
              </Link>
            </div>

            <div className="flex flex-wrap gap-10">
              <StatCounter value={6} label="Predicted Properties" />
              <StatCounter value={8} label="Process Parameters" />
              <StatCounter value={3} label="Analysis Modules" />
            </div>
          </motion.div>

          {/* Right — interactive 3D crystal scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden items-center justify-center lg:flex"
          >
            <div className="relative aspect-square w-full max-w-sm">
              <div
                className="absolute inset-8 animate-float rounded-full border border-teal-500/10"
                style={{ animationDuration: "6s" }}
              />
              <div
                className="absolute inset-16 animate-float rounded-full border border-teal-500/10"
                style={{ animationDuration: "8s", animationDelay: "1s" }}
              />
              <div className="absolute inset-0 z-10">
                <Crystal3D />
              </div>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
                <span className="font-display text-sm text-teal-400">Mg</span>
                <span className="font-mono text-xs text-slate-500">
                  HCP crystal — P6₃/mmc
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gradient divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.4) 30%, rgba(59,130,246,0.3) 60%, transparent 100%)",
        }}
      />

      {/* Research status */}
      <section className="py-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Research Status
          </h3>
          <span className="font-mono text-xs text-slate-600">mp-153 · Mg</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {KPI_CARDS.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-xl border border-white/[0.06] bg-[#0c1428] p-4"
            >
              <div className="mb-3 flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[card.status] }}
                />
                <span className="text-xs text-slate-500">{card.label}</span>
              </div>
              <div
                className={`mb-0.5 text-xl font-semibold ${card.mono ? "font-mono text-base" : "font-display"}`}
                style={{
                  color:
                    card.status === "active"
                      ? "#14b8a6"
                      : card.status === "pending"
                        ? "#f59e0b"
                        : "#64748b",
                }}
              >
                {card.value}
              </div>
              <div className="text-xs text-slate-500">{card.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="pb-12">
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action, i) => (
            <TiltCard key={action.href} className="rounded-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  href={action.href}
                  className="group flex h-full w-full flex-col rounded-xl border border-white/[0.06] bg-[#0c1428] p-5 transition-colors hover:border-white/[0.12]"
                >
                  <span
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${action.accent}15`, color: action.accent }}
                  >
                    <action.icon className="h-5 w-5" />
                  </span>
                  <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">
                    {action.title}
                    <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-teal-400" />
                  </span>
                  <span className="text-xs leading-relaxed text-slate-500">
                    {action.description}
                  </span>
                </Link>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="pb-10">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Research pipeline</h3>
          <Badge tone="neutral">End-to-end flow</Badge>
        </div>
        <div className="grid gap-2.5 md:grid-cols-5">
          {pipeline.map((stage, i) => (
            <div key={stage.name} className="relative flex items-center">
              <div className="flex flex-1 flex-col rounded-xl border border-white/[0.06] bg-[#0c1428] p-3.5">
                <div className="flex items-center gap-2">
                  <stage.icon className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-200">{stage.name}</span>
                </div>
                <span className="mt-2 font-mono text-[11px] text-slate-500">{stage.detail}</span>
                <span className="mt-1.5">
                  <Badge tone={stage.tone}>{stage.status}</Badge>
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight className="mx-1 hidden h-4 w-4 shrink-0 text-slate-700 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="grid gap-4 pb-10 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Service endpoints"
            subtitle="Boundaries for the future FastAPI backend. All services currently answer with mock data."
            icon={<Server className="h-4 w-4" />}
          />
          <div className="mt-4 divide-y divide-white/[0.05]">
            {endpointStatuses.map((item) => (
              <div key={item.endpoint} className="flex items-center gap-3 py-2.5">
                <code className="min-w-0 flex-1 truncate rounded bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-slate-400">
                  {item.endpoint}
                </code>
                <span className="hidden w-40 truncate text-[11px] text-slate-500 sm:block">
                  {item.service}
                </span>
                <Badge tone={item.tone}>{item.state}</Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-white/[0.05] pt-3 text-[11px] leading-relaxed text-slate-500">
            Set <code className="rounded bg-white/[0.05] px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_API_BASE_URL</code>{" "}
            to connect the real backend.
          </p>
        </Card>

        <Card>
          <CardHeader
            title="Data provenance"
            subtitle="Clear separation of data sources — nothing is mixed between stages."
            icon={<Ruler className="h-4 w-4" />}
          />
          <div className="mt-4 space-y-3">
            {[
              { label: "Experimental data", desc: "Extracted from literature — not yet available", tone: "neutral" as const },
              { label: "Model predictions", desc: "ML model not trained — demo outputs only", tone: "amber" as const },
              { label: "Literature information", desc: "Papers not indexed", tone: "neutral" as const },
              { label: "Material database", desc: "Demo record — connect Materials Project API", tone: "amber" as const },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-slate-200">{row.label}</p>
                  <p className="text-[11px] text-slate-500">{row.desc}</p>
                </div>
                <Badge tone={row.tone}>
                  {row.tone === "amber" ? "Demo" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Bottom gradient fade */}
      <div
        className="h-32 w-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(20,184,166,0.03) 40%, rgba(59,130,246,0.03) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
