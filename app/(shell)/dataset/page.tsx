"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  TableProperties,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FlaskConical,
  Rows3,
} from "lucide-react";
import type { DatasetRecord } from "@/lib/types";
import { sampleDatasetRows } from "@/lib/api/mock";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { TextInput, SelectInput } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { StateBanner, EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const columns: { key: keyof DatasetRecord; label: string; unit?: string }[] = [
  { key: "paperId", label: "Paper ID" },
  { key: "material", label: "Material" },
  { key: "electrolyte", label: "Electrolyte" },
  { key: "concentration", label: "Concentration", unit: "mol/L" },
  { key: "currentDensity", label: "Current Density", unit: "A/dm²" },
  { key: "voltage", label: "Voltage", unit: "V" },
  { key: "frequency", label: "Frequency", unit: "Hz" },
  { key: "dutyCycle", label: "Duty Cycle", unit: "%" },
  { key: "time", label: "Time", unit: "min" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "coatingThickness", label: "Coating Thickness", unit: "μm" },
  { key: "porosity", label: "Porosity", unit: "%" },
  { key: "poreSize", label: "Pore Size", unit: "μm" },
  { key: "corrosionResistance", label: "Corrosion Resistance" },
  { key: "wearResistance", label: "Wear Resistance" },
  { key: "fractureParameter", label: "Fracture Parameter" },
];

const PAGE_SIZE = 15;

function cellText(row: DatasetRecord, key: keyof DatasetRecord): string {
  const v = row[key];
  return v === null || v === undefined ? "" : String(v);
}

export default function DatasetPage() {
  const [rows, setRows] = useState<DatasetRecord[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [electrolyteFilter, setElectrolyteFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof DatasetRecord | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const materials = useMemo(
    () => Array.from(new Set(rows.map((r) => r.material))).sort(),
    [rows],
  );
  const electrolytes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.electrolyte))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let list = [...rows];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((row) =>
        columns.some((c) => cellText(row, c.key).toLowerCase().includes(q)),
      );
    }
    if (materialFilter !== "all") list = list.filter((r) => r.material === materialFilter);
    if (electrolyteFilter !== "all")
      list = list.filter((r) => r.electrolyte === electrolyteFilter);

    if (sortKey) {
      const key = sortKey;
      const dir = sortDir === "asc" ? 1 : -1;
      list.sort((a, b) => {
        const va = a[key];
        const vb = b[key];
        if (va === null && vb === null) return 0;
        if (va === null) return 1;
        if (vb === null) return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }
    return list;
  }, [rows, search, materialFilter, electrolyteFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const handleSort = (key: keyof DatasetRecord) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const exportCsv = () => {
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const body = filtered.map((row) =>
      columns.map((c) => `"${(row[c.key] ?? "").toString().replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coatlab-dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSamples = () => {
    setRows(sampleDatasetRows);
    setIsSample(true);
    setPage(1);
  };

  const clearAll = () => {
    setRows([]);
    setIsSample(false);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Experimental data"
        title="Dataset"
        description="Structured experimental records extracted from the research literature — the training substrate for the ML model."
        demoLabel="Awaiting literature"
        aside={
          <div className="flex gap-2">
            {isSample ? (
              <Button variant="secondary" size="md" onClick={clearAll}>
                Clear sample rows
              </Button>
            ) : (
              <Button variant="secondary" size="md" onClick={loadSamples}>
                <Rows3 className="h-4 w-4" />
                Load sample rows
              </Button>
            )}
            <Button variant="primary" size="md" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<TableProperties className="h-5 w-5" />}
          title="Dataset awaiting literature extraction"
          description="Rows appear here after papers are indexed and process/property values are extracted. Use “Load sample rows” to exercise the table with illustrative data."
          className="min-h-[300px]"
        />
      ) : (
        <>
          {isSample && (
            <StateBanner
              tone="amber"
              icon={<FlaskConical className="h-4 w-4" />}
              title="Sample rows loaded — for UI testing only"
              description="These 48 illustrative records are not extracted from literature and must not be used for training or publication. Clear them to return to the awaiting-literature state."
            />
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search across all columns…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <SelectInput
                value={materialFilter}
                onChange={(e) => {
                  setMaterialFilter(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              >
                <option value="all">Material: all</option>
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                value={electrolyteFilter}
                onChange={(e) => {
                  setElectrolyteFilter(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              >
                <option value="all">Electrolyte: all</option>
                {electrolytes.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {columns.map((col) => (
                      <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-left">
                        <button
                          onClick={() => handleSort(col.key)}
                          className="group inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-blue-700"
                        >
                          {col.label}
                          {col.unit && (
                            <span className="font-normal normal-case text-slate-400">
                              ({col.unit})
                            </span>
                          )}
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-blue-600" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-slate-600">No matching records</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Adjust your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, i) => (
                      <tr
                        key={`${row.paperId}-${i}`}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40"
                      >
                        {columns.map((col) => {
                          const value = row[col.key];
                          return (
                            <td
                              key={col.key}
                              className={cn(
                                "whitespace-nowrap px-3 py-2.5",
                                col.key === "paperId"
                                  ? "font-mono text-[11px] text-blue-700"
                                  : value === null || value === undefined
                                    ? "text-slate-300"
                                    : typeof value === "number"
                                      ? "font-mono tabular-nums text-slate-700"
                                      : "text-slate-700",
                              )}
                            >
                              {value === null || value === undefined
                                ? "—"
                                : typeof value === "number"
                                  ? String(value)
                                  : value}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
              <p className="text-[11px] text-slate-500">
                Showing{" "}
                <span className="font-mono font-medium text-slate-700">
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-mono font-medium text-slate-700">{filtered.length}</span>{" "}
                records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono text-[11px] text-slate-500">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{filtered.length} visible records</Badge>
            <Badge tone="neutral">{sortKey ? `Sorted by ${sortKey}` : "No sort applied"}</Badge>
            {(search || materialFilter !== "all" || electrolyteFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setMaterialFilter("all");
                  setElectrolyteFilter("all");
                  setPage(1);
                }}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
