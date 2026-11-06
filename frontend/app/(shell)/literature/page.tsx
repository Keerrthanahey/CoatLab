"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { LiteratureIndex } from "@/components/literature/literature-index";
import { ResearchAssistant } from "@/components/literature/research-assistant";

export default function LiteraturePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Research knowledge base"
        title="Literature Intelligence"
        description="Index research papers and query the corpus with an AI research assistant backed by LangChain / LlamaIndex."
        demoLabel="Not indexed"
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LiteratureIndex />
        </div>
        <div className="lg:col-span-3">
          <ResearchAssistant />
        </div>
      </div>
    </div>
  );
}
