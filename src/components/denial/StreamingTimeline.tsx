"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Search,
  Brain,
  Zap,
  Cpu,
} from "lucide-react";

type AppState = "idle" | "processing" | "done" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

interface TimelineStep {
  id: string;
  label: string;
  detail: string;
  ms: number;
  sponsor?: string;
}

const STEPS: TimelineStep[] = [
  {
    id: "read",
    label: "Reading denial letter",
    detail: "Scanning full letter content",
    ms: 700,
  },
  {
    id: "extract",
    label: "Extracting claim details",
    detail: "Member ID, claim #, service dates",
    ms: 600,
  },
  {
    id: "reason",
    label: "Identifying denial reason",
    detail: "Matching denial patterns",
    ms: 800,
  },
  {
    id: "deadline",
    label: "Checking appeal deadline",
    detail: "Parsing deadline window",
    ms: 500,
  },
  {
    id: "evidence",
    label: "Finding missing evidence",
    detail: "Gap analysis complete",
    ms: 1300,
    sponsor: "Tavily Research",
  },
  {
    id: "draft",
    label: "Drafting stronger appeal arguments",
    detail: "Building argument structure",
    ms: 1800,
    sponsor: "Nebius Reasoning",
  },
  {
    id: "packet",
    label: "Preparing appeal packet",
    detail: "Letter, email, script, checklist ready",
    ms: 1100,
    sponsor: "mem0 · Composio",
  },
];

function createStreamingTimeline(
  onUpdate: (statuses: StepStatus[]) => void,
  onComplete: () => void
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let elapsed = 0;

  STEPS.forEach((step, i) => {
    const activateAt = elapsed;
    timers.push(
      setTimeout(() => {
        onUpdate(
          STEPS.map((_, j) => {
            if (j < i) return "complete";
            if (j === i) return "active";
            return "pending";
          })
        );
      }, activateAt)
    );
    elapsed += step.ms;
  });

  timers.push(
    setTimeout(() => {
      onUpdate(STEPS.map(() => "complete"));
      onComplete();
    }, elapsed)
  );

  return () => timers.forEach(clearTimeout);
}

interface Props {
  appState: AppState;
}

export default function StreamingTimeline({ appState }: Props) {
  const [statuses, setStatuses] = useState<StepStatus[]>(STEPS.map(() => "pending"));
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (appState === "processing") {
      setStatuses(STEPS.map(() => "pending"));
      cancelRef.current?.();
      cancelRef.current = createStreamingTimeline(
        (next) => setStatuses(next),
        () => {}
      );
    } else if (appState === "done") {
      cancelRef.current?.();
      cancelRef.current = null;
      setStatuses(STEPS.map(() => "complete"));
    } else if (appState === "error") {
      cancelRef.current?.();
      cancelRef.current = null;
      setStatuses((prev) => {
        const next = [...prev];
        const activeIdx = next.findIndex((s) => s === "active");
        if (activeIdx !== -1) next[activeIdx] = "error";
        else {
          const lastPending = next.findLastIndex((s) => s !== "pending" && s !== "complete");
          if (lastPending !== -1) next[lastPending] = "error";
        }
        return next;
      });
    }
    return () => {
      cancelRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const isProcessing = appState === "processing";
  const isDone = appState === "done";

  if (appState === "idle") return null;

  return (
    <div className="space-y-4">
      {/* Workflow card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Agent workflow
          </p>
          {isProcessing && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          {isDone && (
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
        </div>

        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const status = statuses[i];
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIconBox status={status} />
                  {!isLast && (
                    <div
                      className={`w-px flex-1 mt-1 mb-1 transition-colors duration-500 ${
                        status === "complete" ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                      style={{ minHeight: 20 }}
                    />
                  )}
                </div>
                <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-medium leading-tight transition-colors duration-300 ${
                        status === "active"
                          ? "text-slate-900"
                          : status === "complete"
                          ? "text-slate-700"
                          : status === "error"
                          ? "text-red-600"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.sponsor && (status === "active" || status === "complete") && (
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded flex-shrink-0">
                        {step.sponsor}
                      </span>
                    )}
                  </div>
                  {(status === "active" || status === "complete") && (
                    <p className="text-xs text-slate-400 mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success banner */}
      {isDone && (
        <div className="card border-emerald-200/80 bg-emerald-50/30 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Appeal packet ready</p>
            <p className="text-xs text-emerald-700/80 mt-0.5">
              All documents generated and ready to review
            </p>
          </div>
        </div>
      )}

      {/* Sponsor activity panel (processing only) */}
      {isProcessing && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Sponsor activity
          </p>
          <div className="space-y-2">
            <SponsorRow
              icon={<Search className="w-3.5 h-3.5 text-orange-500" />}
              name="Tavily Research"
              detail="Searching appeal rules and insurer policies"
            />
            <SponsorRow
              icon={<Brain className="w-3.5 h-3.5 text-violet-500" />}
              name="mem0 Memory"
              detail="Storing case context for future sessions"
            />
            <SponsorRow
              icon={<Zap className="w-3.5 h-3.5 text-blue-500" />}
              name="Composio Actions"
              detail="Preparing Gmail, Drive, and Calendar actions"
            />
            <SponsorRow
              icon={<Cpu className="w-3.5 h-3.5 text-emerald-500" />}
              name="Nebius Reasoning"
              detail="Generating appeal letter and documents"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepIconBox({ status }: { status: StepStatus }) {
  const base = "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border";

  if (status === "active") {
    return (
      <div className={`${base} bg-slate-900 border-slate-900`}>
        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
      </div>
    );
  }
  if (status === "complete") {
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

function SponsorRow({
  icon,
  name,
  detail,
}: {
  icon: React.ReactNode;
  name: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-700">{name}</p>
        <p className="text-[11px] text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
