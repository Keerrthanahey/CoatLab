"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, FileUp, Loader2, HardDriveDownload, Inbox } from "lucide-react";
import { api } from "@/lib/api/client";
import type { LiteratureStatus } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, DataStatusTag } from "@/components/ui/badge";
import { StateBanner } from "@/components/ui/empty-state";

export function LiteratureIndex() {
  const [status, setStatus] = useState<LiteratureStatus | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "done">("idle");
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.literature.status().then(setStatus);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const pdfs = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) return;
    setUploadedName(pdfs.map((f) => f.name).join(", "));
    setPhase("uploading");
    await api.literature.upload(pdfs);
    setPhase("done");
  };

  const notIndexed = !status || status.status === "not_indexed";

  return (
    <Card>
      <CardHeader
        title="Indexed literature"
        subtitle="PDF research papers processed into the knowledge base."
        icon={<FileText className="h-4 w-4" />}
        aside={
          <span className="rounded border border-dashed border-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600">
            Awaiting literature
          </span>
        }
      />

      {/* Status grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Documents", value: status?.documents ?? "—" },
          { label: "Indexed", value: status?.indexed ?? "—" },
          { label: "Status", value: notIndexed ? "Not indexed" : "Indexed", tone: "amber" as const },
          { label: "Last indexed", value: status?.lastIndexedAt ? new Date(status.lastIndexedAt).toLocaleDateString() : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {s.label}
            </p>
            <div className="mt-1">
              {"tone" in s && s.tone ? (
                <Badge tone={s.tone}>{s.value}</Badge>
              ) : (
                <span className="font-mono text-[13px] font-medium tabular-nums text-slate-800">
                  {s.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => phase === "idle" && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && phase === "idle") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (phase === "idle") setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (phase === "idle") handleFiles(e.dataTransfer.files);
        }}
        className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-9 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 ${
          dragging ? "border-blue-500 bg-blue-50/60" : "border-slate-300 bg-slate-50/50 hover:border-blue-300"
        } ${phase !== "idle" ? "cursor-wait opacity-60" : ""}`}
      >
        {phase === "uploading" ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Accepting submission (demo)…
            </p>
          </>
        ) : (
          <>
            <FileUp className="h-7 w-7 text-slate-400" />
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Upload / index literature
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Drag PDF papers here or browse. PDF only.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>

      {phase === "done" && uploadedName && (
        <div className="mt-4">
          <StateBanner
            tone="blue"
            icon={<Inbox className="h-4 w-4" />}
            title="Submission recorded — nothing stored"
            description={`${uploadedName}. The ingestion pipeline (document extraction → chunking → embeddings → vector DB via LangChain/LlamaIndex) is not connected, so the knowledge base remains empty.`}
          />
        </div>
      )}

      {notIndexed && phase === "idle" && (
        <div className="mt-4">
          <StateBanner
            tone="neutral"
            icon={<HardDriveDownload className="h-4 w-4" />}
            title="No literature indexed"
            description="Upload papers to build the searchable research knowledge base that powers the research assistant."
          />
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
        Ingestion will run against{" "}
        <code className="font-mono">POST /api/literature/upload</code> and{" "}
        <code className="font-mono">POST /api/literature/query</code>.{" "}
        <DataStatusTag label="Demo" className="ml-1" />
      </p>
    </Card>
  );
}
