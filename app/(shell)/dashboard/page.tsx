import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Hash,
  FileText,
  BrainCircuit,
  Database,
  Activity,
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
import { KpiCard } from "@/components/cards/kpi-card";
import { Badge, DataStatusTag } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/api/client";

export const metadata: Metadata = { title: "Dashboard" };

const quickActions = [
  {
    href: "/prediction",
    icon: Gauge,
    title: "Predict Properties",
    description: "Enter process parameters and generate coating-property predictions.",
    accent: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    href: "/microstructure",
    icon: ScanLine,
    title: "Analyze Microstructure",
    description: "Upload an SEM / microscopy image and analyze porosity and pore morphology.",
    accent: "bg-teal-50 text-teal-700 border-teal-100",
  },
  {
    href: "/materials",
    icon: Atom,
    title: "Explore Material",
    description: "View crystal structure, thermodynamic and mechanical property data.",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    href: "/literature",
    icon: FileText,
    title: "Literature Intelligence",
    description: "Ask questions about the indexed research literature.",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
  },
];

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
    <div className="space-y-8">
      {/* Hero header */}
      <section className="blueprint-dots relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-50/70 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-widest text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Research workspace
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
              Materials Intelligence Platform
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              AI-assisted prediction and analysis of coating properties for advanced materials.
              Mg — Magnesium is the active research material.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <DataStatusTag label="Mock data" />
            <span className="text-[11px] text-slate-400">
              Pipeline status · live data pending
            </span>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Research pipeline</h3>
          <Badge tone="neutral">End-to-end flow</Badge>
        </div>
        <div className="grid gap-2.5 md:grid-cols-5">
          {pipeline.map((stage, i) => (
            <div key={stage.name} className="relative flex items-center">
              <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                <div className="flex items-center gap-2">
                  <stage.icon className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-800">{stage.name}</span>
                </div>
                <span className="mt-2 font-mono text-[11px] text-slate-500">{stage.detail}</span>
                <span className="mt-1.5">
                  <Badge tone={stage.tone}>{stage.status}</Badge>
                </span>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight className="mx-1 hidden h-4 w-4 shrink-0 text-slate-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={<Layers className="h-4 w-4" />}
          label="Current material"
          value="Mg"
          sub="Magnesium · mp-153"
          href="/materials"
          accent="text-blue-700"
        />
        <KpiCard
          icon={<Hash className="h-4 w-4" />}
          label="Material ID"
          value="mp-153"
          sub="Materials Project ref"
          href="/materials"
          accent="text-slate-500"
        />
        <KpiCard
          icon={<FileText className="h-4 w-4" />}
          label="Literature sources"
          value="0"
          sub="Not indexed"
          status="Not indexed"
          href="/literature"
          accent="text-amber-600"
        />
        <KpiCard
          icon={<BrainCircuit className="h-4 w-4" />}
          label="ML model"
          value="Not trained"
          sub="Awaiting dataset"
          status="Not trained"
          href="/model"
          accent="text-slate-500"
        />
        <KpiCard
          icon={<Database className="h-4 w-4" />}
          label="Dataset"
          value="Awaiting"
          sub="0 records extracted"
          status="Awaiting lit."
          href="/dataset"
          accent="text-teal-600"
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Predictions"
          value="0"
          sub="No runs yet"
          status="Idle"
          href="/prediction"
          accent="text-slate-500"
        />
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${action.accent}`}
              >
                <action.icon className="h-5 w-5" />
              </span>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                {action.title}
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-600" />
              </span>
              <span className="mt-1 text-xs leading-relaxed text-slate-500">
                {action.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Service endpoints"
            subtitle="Boundaries for the future FastAPI backend. All services currently answer with mock data."
            icon={<Server className="h-4 w-4" />}
          />
          <div className="mt-4 divide-y divide-slate-100">
            {endpointStatuses.map((item) => (
              <div key={item.endpoint} className="flex items-center gap-3 py-2.5">
                <code className="min-w-0 flex-1 truncate rounded bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
                  {item.endpoint}
                </code>
                <span className="hidden w-40 truncate text-[11px] text-slate-400 sm:block">
                  {item.service}
                </span>
                <Badge tone={item.tone}>{item.state}</Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
            Set <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_API_BASE_URL</code>{" "}
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
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{row.label}</p>
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
    </div>
  );
}
