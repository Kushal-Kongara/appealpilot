"use client";

import { Search, Brain, Zap, Cpu, ExternalLink } from "lucide-react";
import { AgentReceipts as AgentReceiptsType, TavilySource } from "@/lib/types";

interface Props {
  receipts: AgentReceiptsType;
  sources: TavilySource[];
}

type StatusKey = "live" | "fallback" | "demo" | "saved" | "ready";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; bg: string; text: string; border: string }
> = {
  live: { label: "LIVE", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  saved: { label: "SAVED", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  ready: { label: "READY", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
  fallback: { label: "FALLBACK", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80" },
  demo: { label: "DEMO", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
};

export default function AgentReceipts({ receipts, sources }: Props) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/80">
        <h3 className="text-sm font-semibold text-slate-900">Agent receipts</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified sponsor activity for this appeal
        </p>
      </div>

      {/* Receipt rows */}
      <div className="divide-y divide-slate-100">
        <ReceiptRow
          icon={<Search className="w-4 h-4 text-orange-500" />}
          name="Tavily"
          role="Web Research"
          statusKey={receipts.tavily.status}
          lines={[
            `Query: "${receipts.tavily.query.slice(0, 55)}${receipts.tavily.query.length > 55 ? "…" : ""}"`,
            `Returned ${receipts.tavily.resultsCount} source${receipts.tavily.resultsCount !== 1 ? "s" : ""} — used for appeal guidance`,
          ]}
        />
        <ReceiptRow
          icon={<Brain className="w-4 h-4 text-violet-500" />}
          name="mem0"
          role="Persistent Memory"
          statusKey={receipts.mem0.memorySaved ? "saved" : "fallback"}
          lines={[
            receipts.mem0.detail,
            receipts.mem0.memorySaved
              ? "User: appealpilot-user — memory available next session"
              : "Case logged locally as fallback",
          ]}
        />
        <ReceiptRow
          icon={<Zap className="w-4 h-4 text-blue-500" />}
          name="Composio"
          role="Tool Actions"
          statusKey={receipts.composio.status}
          lines={[
            `Actions ready: ${receipts.composio.actionsAvailable.join(" · ")}`,
            "OAuth connection required for live execution — demo mode active",
          ]}
        />
        <ReceiptRow
          icon={<Cpu className="w-4 h-4 text-emerald-500" />}
          name="Nebius"
          role="AI Inference"
          statusKey={receipts.nebius.status}
          lines={[
            receipts.nebius.detail,
            receipts.nebius.status === "live"
              ? "Generating appeal content with Nebius LLM"
              : "Template engine active — production-quality output",
          ]}
        />
      </div>

      {/* Tavily source cards */}
      {sources.length > 0 && (
        <div className="border-t border-slate-200/80 p-6 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-3.5 h-3.5 text-orange-500" />
            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Tavily sources
            </p>
            {sources[0]?.isDemo && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-medium">
                demo fallback
              </span>
            )}
          </div>
          <div className="space-y-3">
            {sources.slice(0, 3).map((s, i) => {
              let domain = "";
              try {
                domain = new URL(s.url).hostname.replace("www.", "");
              } catch {
                domain = s.url;
              }
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-orange-200/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{s.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{domain}</p>
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-8 h-8 rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.snippet}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptRow({
  icon,
  name,
  role,
  statusKey,
  lines,
}: {
  icon: React.ReactNode;
  name: string;
  role: string;
  statusKey: StatusKey;
  lines: string[];
}) {
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.fallback;

  return (
    <div className="px-6 py-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">{name}</span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
                {role}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              {cfg.label}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            {lines.map((line, i) => (
              <p key={i} className="text-xs text-slate-500 font-mono leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
