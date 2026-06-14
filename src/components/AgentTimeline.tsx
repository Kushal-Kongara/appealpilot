"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { AgentStep } from "@/lib/types";

interface Props {
  steps: AgentStep[];
}

const icons = {
  done: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  running: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
  pending: <Circle className="w-5 h-5 text-slate-300" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
};

const labelColors = {
  done: "text-slate-800",
  running: "text-blue-700 font-semibold",
  pending: "text-slate-400",
  error: "text-red-500",
};

const detailColors = {
  done: "text-emerald-600",
  running: "text-blue-500",
  pending: "text-slate-300",
  error: "text-red-400",
};

export default function AgentTimeline({ steps }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Agent Activity
        </span>
      </div>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3 animate-step-in" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 mt-0.5">{icons[step.status]}</div>
              {i < steps.length - 1 && (
                <div
                  className={`w-px flex-1 my-1 ${
                    step.status === "done"
                      ? "bg-emerald-200"
                      : step.status === "running"
                      ? "bg-blue-200"
                      : "bg-slate-100"
                  }`}
                  style={{ minHeight: "20px" }}
                />
              )}
            </div>
            {/* Content */}
            <div className="pb-4 min-w-0">
              <p className={`text-sm leading-tight ${labelColors[step.status]}`}>
                {step.label}
              </p>
              {step.detail && (
                <p className={`text-xs mt-0.5 ${detailColors[step.status]}`}>
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
