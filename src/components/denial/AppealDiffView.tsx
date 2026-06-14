"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Copy, CheckCheck, AlertTriangle } from "lucide-react";
import {
  WEAK_LETTER,
  TYPE_CLASSES,
  TYPE_LABELS,
  WHY_STRONGER,
  buildHighlightSpans,
  type HighlightType,
} from "@/lib/denial/appealTemplates";

interface Props {
  appealLetter: string;
}

const LEGEND_TYPES: HighlightType[] = [
  "medical-necessity",
  "doc-reference",
  "policy-request",
  "clear-ask",
  "deadline-aware",
];

export default function AppealDiffView({ appealLetter }: Props) {
  const [copied, setCopied] = useState(false);
  const spans = useMemo(() => buildHighlightSpans(appealLetter), [appealLetter]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(appealLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Simulated data notice */}
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        Simulated demo data — basic letter is illustrative only. AI letter is your generated appeal.
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-600">Basic Letter</span>
            <span className="text-xs text-slate-400 ml-auto">Likely to fail</span>
          </div>
          <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 p-4 max-h-80 overflow-auto">
            {WEAK_LETTER}
          </pre>
        </div>

        {/* Enhanced */}
        <div className="rounded-xl border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-50 px-4 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-emerald-800">AI-Enhanced Letter</span>
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-white p-4 max-h-80 overflow-auto">
            {spans.map((span, i) =>
              span.type === "none" ? (
                <span key={i}>{span.text}</span>
              ) : (
                <span key={i} className={TYPE_CLASSES[span.type as HighlightType]}>
                  {span.text}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Why stronger panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Why the AI letter is stronger</p>
        <div className="space-y-2">
          {WHY_STRONGER.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-600">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {LEGEND_TYPES.map((type) => (
          <span
            key={type}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_CLASSES[type]}`}
          >
            {TYPE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
