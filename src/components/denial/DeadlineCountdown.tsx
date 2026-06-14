"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { parseDeadlineDate, computeTimeLeft, type TimeLeft } from "@/lib/denial/dateUtils";

interface Props {
  deadlineString: string;
}

type UrgencyLevel = "low" | "medium" | "high";

function getUrgency(days: number): UrgencyLevel {
  if (days < 15) return "high";
  if (days < 60) return "medium";
  return "low";
}

const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { bar: string; bg: string; border: string; textColor: string; msg: string }
> = {
  low: {
    bar: "bg-emerald-500",
    bg: "bg-white",
    border: "border-slate-200",
    textColor: "text-emerald-600",
    msg: "Low urgency — you have time to prepare",
  },
  medium: {
    bar: "bg-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-600",
    msg: "Start preparing documents now",
  },
  high: {
    bar: "bg-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-600",
    msg: "Urgent — submit appeal soon",
  },
};

export default function DeadlineCountdown({ deadlineString }: Props) {
  const parsed = useMemo(() => parseDeadlineDate(deadlineString), [deadlineString]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    computeTimeLeft(parsed.date, parsed.totalWindowDays)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(parsed.date, parsed.totalWindowDays));
    }, 1000);
    return () => clearInterval(id);
  }, [parsed]);

  const urgency = getUrgency(timeLeft.days);
  const cfg = URGENCY_CONFIG[urgency];

  const progressPct = timeLeft.isExpired
    ? 100
    : Math.min(
        100,
        Math.round((1 - timeLeft.days / parsed.totalWindowDays) * 100)
      );

  return (
    <div className={`rounded-2xl border ${cfg.border} shadow-sm p-5 mb-5 ${cfg.bg}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Appeal Deadline</span>
        {parsed.isEstimated && (
          <span className="text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            estimated
          </span>
        )}
      </div>

      {/* Countdown */}
      {timeLeft.isExpired ? (
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-lg">Deadline has passed</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 mb-4">
          <TimeUnit value={timeLeft.days}    unit="days"    urgency={urgency} />
          <TimeUnit value={timeLeft.hours}   unit="hours"   urgency={urgency} />
          <TimeUnit value={timeLeft.minutes} unit="mins"    urgency={urgency} />
          <TimeUnit value={timeLeft.seconds} unit="secs"    urgency={urgency} />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Urgency message */}
      <p className={`text-sm font-medium ${cfg.textColor}`}>{cfg.msg}</p>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 mt-2">
        Deadlines vary by plan and state. Confirm with your insurer.
      </p>
    </div>
  );
}

function TimeUnit({
  value,
  unit,
  urgency,
}: {
  value: number;
  unit: string;
  urgency: UrgencyLevel;
}) {
  const numColor =
    urgency === "high"   ? "text-red-600"     :
    urgency === "medium" ? "text-amber-600"   :
    "text-emerald-600";

  return (
    <div className="flex flex-col items-center min-w-[52px]">
      <span className={`text-3xl font-extrabold leading-none ${numColor}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-slate-400 mt-1">{unit}</span>
    </div>
  );
}
