"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComparisonColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

interface IndexedRow {
  row: Record<string, unknown>;
  idx: number;
}

export function ComparisonTable({
  columns,
  data,
  highlightIndex,
  className,
}: {
  columns: ComparisonColumn[];
  data: Record<string, unknown>[];
  highlightIndex?: number;
  className?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const indexed = useMemo<IndexedRow[]>(
    () => data.map((row, idx) => ({ row, idx })),
    [data],
  );

  const sorted = useMemo(() => {
    if (!sortKey) return indexed;
    return [...indexed].sort((a, b) => {
      const av = a.row[sortKey];
      const bv = b.row[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else if (av == null) {
        cmp = bv == null ? 0 : 1;
      } else if (bv == null) {
        cmp = -1;
      } else {
        const an = Number(av);
        const bn = Number(bv);
        cmp =
          Number.isFinite(an) && Number.isFinite(bn)
            ? an - bn
            : String(av).localeCompare(String(bv));
      }
      return cmp * sortDir;
    });
  }, [indexed, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 1) {
        setSortDir(-1);
      } else {
        setSortKey(null);
        setSortDir(1);
      }
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const renderCell = (row: Record<string, unknown>, key: string, col?: ComparisonColumn) => {
    const value = row[key];
    if (col?.format) return col.format(value);
    if (value == null) return "—";
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
    return String(value);
  };

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-white/[0.07] bg-[#0c1428]",
        className,
      )}
    >
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.07]">
            {columns.map((col) => {
              const active = sortKey === col.key;
              const Icon = !active ? ArrowUpDown : sortDir === 1 ? ArrowUp : ArrowDown;
              return (
                <th key={col.key} scope="col" className="whitespace-nowrap px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-slate-200",
                      active ? "text-teal-400" : "text-slate-400",
                    )}
                  >
                    {col.label}
                    <Icon className={cn("h-3 w-3", !active && "opacity-50")} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-xs text-slate-400"
              >
                No data to display.
              </td>
            </tr>
          )}
          {sorted.map(({ row, idx }) => {
            const highlighted = highlightIndex != null && idx === highlightIndex;
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b border-white/[0.05] last:border-b-0",
                  highlighted && "bg-teal-500/5",
                )}
              >
                {columns.map((col, cellIdx) => (
                  <td
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 font-mono text-[13px] tabular-nums text-white",
                      highlighted && cellIdx === 0 && "border-l-2 border-teal-500",
                    )}
                  >
                    {renderCell(row, col.key, col)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
