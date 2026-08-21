"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/png", "image/jpeg"];

export function UploadZone({
  onFile,
  previewUrl,
  loading = false,
  title = "Drop an image here",
  description = "PNG or JPG, up to ~10 MB",
  className,
}: {
  onFile: (file: File) => void;
  previewUrl?: string | null;
  loading?: boolean;
  title?: string;
  description?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file type — please use PNG or JPG.");
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={loading}
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!loading && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!loading) handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "demo-pattern flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40",
          dragging
            ? "border-teal-500/60 bg-teal-500/[0.07]"
            : "border-white/[0.12] bg-white/[0.03] hover:border-white/25",
          loading && "cursor-wait opacity-70",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Upload preview"
            className="mb-4 max-h-44 max-w-full rounded-lg border border-white/[0.07] object-contain"
          />
        ) : (
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0c1428] text-slate-400">
            <UploadCloud className="h-5 w-5" />
          </div>
        )}
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
