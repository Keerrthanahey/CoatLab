"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, MessageSquareText, Bot, User, Quote } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Citation } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, DataStatusTag } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  demo?: boolean;
}

const suggestedQuestions = [
  "What electrolyte compositions were used for Mg coatings?",
  "What current densities were reported?",
  "Which parameters were associated with lower porosity?",
  "What coating thicknesses were reported?",
  "Compare the experimental conditions across papers.",
];

const initialAssistant: Message = {
  role: "assistant",
  content:
    "I'm your research assistant over the indexed magnesium coating literature. Ask a question and I'll answer with source citations. The knowledge base is empty for now — responses are demonstrations.",
  demo: true,
};

export function ResearchAssistant() {
  const [messages, setMessages] = useState<Message[]>([initialAssistant]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    const result = await api.literature.query(text);
    setBusy(false);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: result.answer, citations: result.citations, demo: result.demo },
    ]);
  };

  return (
    <Card className="flex h-full min-h-[560px] flex-col" pad={false}>
      <div className="border-b border-slate-100 p-5">
        <CardHeader
          title="AI Research Assistant"
          subtitle="Answers grounded in the indexed literature, with citations."
          icon={<MessageSquareText className="h-4 w-4" />}
          aside={
            connected ? (
              <Badge tone="teal" dot>
                LangChain / LlamaIndex · not connected
              </Badge>
            ) : (
              <Badge tone="neutral">Connecting…</Badge>
            )
          }
        />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        style={{ maxHeight: 460 }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
                <Bot className="h-4 w-4" />
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "rounded-tr-sm bg-blue-700 text-white"
                  : "rounded-tl-sm border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {m.content}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <Quote className="h-3 w-3" /> Sources
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {m.citations.map((c, j) => (
                      <li key={j} className="flex items-center gap-2 text-[11px] text-slate-500">
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-blue-700 ring-1 ring-slate-200">
                          {c.paperId}
                        </code>
                        {c.page && <span className="text-slate-400">p.{c.page}</span>}
                        {c.metric && (
                          <span className="truncate text-slate-400">· {c.metric}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {m.demo && (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600">
                  <Sparkles className="h-3 w-3" /> Mock response — knowledge base not connected
                </p>
              )}
            </div>
            {m.role === "user" && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <User className="h-4 w-4" />
              </span>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
              <Bot className="h-4 w-4" />
            </span>
            <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500 [animation-delay:240ms]" />
                <span className="ml-2 text-xs text-slate-400">
                  Searching indexed literature…
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            disabled={busy}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ask a question about the research literature…"
            className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
          />
          <button
            onClick={() => ask(input)}
            disabled={busy || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition-colors hover:bg-teal-800 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Answers are demonstration outputs until the literature is indexed and the retrieval pipeline is connected.
          <DataStatusTag label="Demo" className="ml-1" />
        </p>
      </div>
    </Card>
  );
}
