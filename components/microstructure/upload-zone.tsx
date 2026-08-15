"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = [".png", ".jpg", ".jpeg", ".tif", ".tiff"];

export function UploadZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20",
        dragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/[0.12] bg-[#0c1428] hover:border-blue-500/30 hover:bg-blue-500/10",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors",
          dragging
            ? "border-blue-500/25 bg-[#0c1428] text-blue-400"
            : "border-white/[0.07] bg-white/[0.03] text-slate-400",
        )}
      >
        {dragging ? (
          <UploadCloud className="h-6 w-6" />
        ) : (
          <ImagePlus className="h-6 w-6" />
        )}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-100">
        Upload Microstructure Image
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Drag &amp; drop an SEM / microscopy image here, or click to browse
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-slate-400">
        PNG · JPG · JPEG · TIFF
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
