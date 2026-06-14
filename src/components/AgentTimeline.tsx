"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { AgentStep } from "@/lib/types";

interface Props {
  steps: AgentStep[];
}

const labelColors = {
  done: "text-slate-700",
  running: "text-slate-900 font-semibold",
  pending: "text-slate-400",
  error: "text-red-600",
};

const detailColors = {
  done: "text-slate-400",
  running: "text-slate-500",
  pending: "text-slate-300",
  error: "text-red-400",
};

function StepIconBox({ status }: { status: AgentStep["status"] }) {
  const base = "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border";

  if (status === "running") {
    return (
      <div className={`${base} bg-slate-900 border-slate-900`}>
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className={`${base} bg-emerald-50 border-emerald-200/80`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className={`${base} bg-red-50 border-red-200/80`}>
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
      </div>
    );
  }
  return (
    <div className={`${base} bg-slate-50 border-slate-200/80`}>
      <Circle className="w-3 h-3 text-slate-300" />
    </div>
  );
}

export default function AgentTimeline({ steps }: Props) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Agent workflow
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className="flex gap-3 animate-step-in"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
          >
            <div className="flex flex-col items-center">
              <StepIconBox status={step.status} />
              {i < steps.length - 1 && (
                <div
                  className={`w-px flex-1 my-1 ${
                    step.status === "done" ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                  style={{ minHeight: "20px" }}
                />
              )}
            </div>
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
