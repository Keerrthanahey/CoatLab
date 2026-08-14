"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Server,
  KeyRound,
  Palette,
  Save,
  Check,
  ExternalLink,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/lib/api/client";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-blue-700" : "bg-slate-200"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [projectName, setProjectName] = useState("CoatLab");
  const [apiUrl, setApiUrl] = useState("");
  const [mpKey, setMpKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState({
    telemetry: false,
    experimentalViewer: false,
    autoExtract: true,
  });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="System configuration"
        title="Settings"
        description="Workspace preferences and backend connection details for the CoatLab platform."
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Workspace"
              subtitle="General project identity."
              icon={<SettingsIcon className="h-4 w-4" />}
            />
            <div className="mt-5 space-y-4">
              <Field label="Project name">
                <TextInput value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </Field>
              <Field
                label="Active research material"
                hint="Managed from the Material Explorer. Only Mg is registered in the demo index."
              >
                <TextInput value="Magnesium (Mg) — mp-153" readOnly />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Backend connections"
              subtitle="Where the future FastAPI + ML services live."
              icon={<Server className="h-4 w-4" />}
            />
            <div className="mt-5 space-y-4">
              <Field
                label="Backend API base URL"
                unit="NEXT_PUBLIC_API_BASE_URL"
                hint="When set, the app switches from mock responses to the live API."
              >
                <TextInput
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </Field>
              <Field label="Materials Project API key" unit="optional">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    type="password"
                    value={mpKey}
                    onChange={(e) => setMpKey(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9"
                  />
                </div>
              </Field>
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Materials database
                  </span>
                  <Badge tone="amber">Demo record</Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Connect a key to pull live data from{" "}
                  <code className="font-mono">GET /api/materials/&#123;id&#125;</code>.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Service endpoints"
              subtitle="Routes the platform exposes (FastAPI contract)."
              icon={<Server className="h-4 w-4" />}
            />
            <div className="mt-4 divide-y divide-slate-100">
              {Object.entries(API_ENDPOINTS)
                .flatMap(([group, value]) =>
                  typeof value === "object" && value !== null
                    ? Object.entries(value).map(([name, ep]) => ({
                        group,
                        name,
                        ep: typeof ep === "function" ? ep("mp-153") : ep,
                      }))
                    : [{ group, name: group, ep: value as string }],
                )
                .map((item) => (
                  <div key={`${item.group}.${item.name}`} className="flex items-center gap-3 py-2.5">
                    <code className="flex-1 truncate font-mono text-[11px] text-slate-600">
                      {item.ep}
                    </code>
                    <Badge tone="neutral">{item.name}</Badge>
                  </div>
                ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              <ExternalLink className="h-3 w-3" />
              Contract docs will live at <code className="font-mono">/docs</code> on the backend.
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Appearance"
              subtitle="Interface preferences."
              icon={<Palette className="h-4 w-4" />}
            />
            <div className="mt-5 space-y-4">
              {[
                { key: "autoExtract" as const, label: "Auto-extract from new papers", desc: "Trigger dataset extraction when literature is indexed." },
                { key: "experimentalViewer" as const, label: "3D structure viewer", desc: "Enable interactive crystal viewer once connected." },
                { key: "telemetry" as const, label: "Anonymous usage telemetry", desc: "Share anonymous product analytics." },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">{row.label}</p>
                    <p className="text-[11px] text-slate-400">{row.desc}</p>
                  </div>
                  <Toggle
                    checked={toggles[row.key]}
                    onChange={(v) => setToggles((t) => ({ ...t, [row.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-700">Danger zone</p>
                <p className="text-xs text-slate-500">
                  Clear locally stored demo state and reset preferences.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setProjectName("CoatLab")}>
                Reset
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button size="md" onClick={save} disabled={saved}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save settings"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-600">
            Settings saved to local state (demo — no backend to persist to yet).
          </span>
        )}
      </div>
    </div>
  );
}
