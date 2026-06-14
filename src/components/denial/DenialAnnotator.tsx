"use client";

import { useMemo } from "react";
import { annotateText, type HighlightColor } from "@/lib/denial/annotation";
import { extractSignals } from "@/lib/denial/extraction";

interface Props {
  text: string;
}

const COLOR_CLASSES: Record<HighlightColor, string> = {
  red:    "bg-red-100 text-red-800 rounded px-0.5",
  yellow: "bg-amber-100 text-amber-800 rounded px-0.5",
  green:  "bg-emerald-100 text-emerald-800 rounded px-0.5",
  none:   "",
};

const LEGEND = [
  { color: "bg-red-100 text-red-800",     label: "Denial Trigger" },
  { color: "bg-amber-100 text-amber-800", label: "Action Required" },
  { color: "bg-emerald-100 text-emerald-800", label: "Supports Appeal" },
];

export default function DenialAnnotator({ text }: Props) {
  const spans = useMemo(() => annotateText(text), [text]);
  const signals = useMemo(() => extractSignals(text), [text]);

  const signalRows = [
    { label: "Denial Reason",  value: signals.denialReason },
    { label: "Deadline",       value: signals.deadline },
    { label: "Insurer",        value: signals.insurer },
    { label: "Denied Service", value: signals.deniedService },
    { label: "Claim #",        value: signals.claimNumber },
  ];

  const hasAnySignal = signalRows.some((r) => r.value !== null);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3 space-y-3">
      {/* Legend */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs text-slate-400 font-medium">Highlights:</span>
        {LEGEND.map((l) => (
          <span key={l.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.color}`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Annotated preview */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 max-h-48 overflow-auto">
        <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
          {spans.map((span, i) =>
            span.color === "none" ? (
              <span key={i}>{span.text}</span>
            ) : (
              <span key={i} className={COLOR_CLASSES[span.color]}>
                {span.text}
              </span>
            )
          )}
        </p>
      </div>

      {/* Extracted signals */}
      {hasAnySignal && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Extracted signals:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {signalRows.map((row) => (
              <div key={row.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 font-medium">{row.label}</p>
                <p className={`text-xs font-semibold mt-0.5 leading-snug ${row.value ? "text-slate-800" : "text-slate-300"}`}>
                  {row.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
