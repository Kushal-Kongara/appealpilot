"use client";

import { useState } from "react";
import {
  FileText,
  Mail,
  Phone,
  CheckSquare,
  ListTodo,
  Copy,
  CheckCheck,
  Mail as MailIcon,
  FolderOpen,
  Calendar,
  Loader2,
  AlertTriangle,
  Building2,
  Clock,
  Stethoscope,
  ShieldAlert,
  Brain,
  PhoneCall,
  Target,
  XCircle,
  CheckCircle2,
  ChevronRight,
  GitCompare,
} from "lucide-react";
import { BuildAppealResponse, ComposioActionResponse } from "@/lib/types";
import AppealDiffView from "@/components/denial/AppealDiffView";

type Tab = "letter" | "email" | "phone" | "callsim" | "checklist" | "nextsteps" | "diff";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "letter", label: "Appeal Letter", icon: <FileText className="w-4 h-4" /> },
  { id: "email", label: "Email Draft", icon: <Mail className="w-4 h-4" /> },
  { id: "phone", label: "Phone Script", icon: <Phone className="w-4 h-4" /> },
  { id: "callsim", label: "Call Guide", icon: <PhoneCall className="w-4 h-4" /> },
  { id: "checklist", label: "Documents", icon: <CheckSquare className="w-4 h-4" /> },
  { id: "nextsteps", label: "Next Steps", icon: <ListTodo className="w-4 h-4" /> },
  { id: "diff", label: "AI vs Basic", icon: <GitCompare className="w-4 h-4" /> },
];

interface ComposioState {
  loading: boolean;
  result: ComposioActionResponse | null;
}

interface Props {
  result: BuildAppealResponse;
}

export default function ResultsPanel({ result }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("letter");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [composio, setComposio] = useState<Record<string, ComposioState>>({});

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runComposio = async (
    action: "gmail_draft" | "drive_folder" | "calendar_reminder",
    data: Record<string, string>
  ) => {
    setComposio((prev) => ({ ...prev, [action]: { loading: true, result: null } }));
    try {
      const res = await fetch("/api/actions/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const json = (await res.json()) as ComposioActionResponse;
      setComposio((prev) => ({ ...prev, [action]: { loading: false, result: json } }));
    } catch {
      setComposio((prev) => ({
        ...prev,
        [action]: { loading: false, result: { status: "error", message: "Action failed. Try again." } },
      }));
    }
  };

  const { parsed, package: pkg, strength, memoryRecall } = result;

  const textContent: Partial<Record<Tab, string>> = {
    letter: pkg.appealLetter,
    email: pkg.emailDraft,
    phone: pkg.phoneScript,
    callsim: pkg.callSimScript,
  };

  const activeText = textContent[activeTab] ?? "";

  return (
    <div className="space-y-5">
      {/* Appeal Strength */}
      {strength && (
        <div className="clay-card p-6 bg-white/90">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-neutral-600" />
                <h3 className="font-semibold text-neutral-900 uppercase text-xs tracking-wider">Appeal strength</h3>
                <span className="text-[10px] text-neutral-400 font-semibold">— not legal advice</span>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Based on documentation available in your denial letter
              </p>

              {/* Score bar */}
              <div className="mb-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-neutral-900">{strength.score}</span>
                  <span className="text-sm font-semibold text-neutral-400">/ 100</span>
                  <span
                    className={`text-sm font-bold ml-2 ${
                      strength.score >= 80
                        ? "text-emerald-600"
                        : strength.score >= 60
                        ? "text-amber-600"
                        : strength.score >= 40
                        ? "text-orange-600"
                        : "text-red-500"
                    }`}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 w-full max-w-xs bg-neutral-200/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all ${
                      strength.score >= 80
                        ? "bg-emerald-500"
                        : strength.score >= 60
                        ? "bg-amber-500"
                        : strength.score >= 40
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {strength.factors.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs p-2.5 rounded-xl bg-white/60 border border-neutral-200/30 shadow-[inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.01),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)]"
                  >
                    {f.present ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                    )}
                    <span className={f.present ? "text-neutral-700 font-bold" : "text-neutral-400 font-medium"}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>

              {strength.missingEvidence.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50/30 border border-amber-100 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wider">
                    Strengthen your case
                  </p>
                  {strength.missingEvidence.map((item, i) => (
                    <p key={i} className="text-xs text-amber-700 leading-relaxed font-medium">
                      • {item}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <StrengthRing score={strength.score} label={strength.label} />
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="clay-card border-l-4 border-l-[#C04000] p-6 bg-white/90">
        <p className="text-sm leading-relaxed text-neutral-700 font-medium">{pkg.summary}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<Building2 className="w-4 h-4 text-neutral-500" />}
          label="Insurer"
          value={parsed.insuranceCompany}
        />
        <InfoCard
          icon={<ShieldAlert className="w-4 h-4 text-neutral-500" />}
          label="Denial Reason"
          value={parsed.denialReason}
        />
        <InfoCard
          icon={<Clock className="w-4 h-4 text-neutral-500" />}
          label="Appeal Deadline"
          value={parsed.appealDeadline}
          highlight
        />
        <InfoCard
          icon={<Stethoscope className="w-4 h-4 text-neutral-500" />}
          label="Treatment"
          value={parsed.treatment}
        />
      </div>

      {/* Document Tabs */}
      <div className="clay-card overflow-hidden bg-white/90">
        <div className="flex overflow-x-auto scrollbar-hide gap-1.5 p-2.5 border-b border-neutral-200/20 bg-neutral-50/20">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 rounded-lg ${
                activeTab === tab.id
                  ? "text-neutral-900 bg-white shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.05),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.95)]"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-white/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "checklist" ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4">
                Gather these documents before submitting your appeal
              </p>
              {pkg.documentChecklist.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200/30 bg-white/70 shadow-[inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.01),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)] hover:border-neutral-200 transition-colors group"
                >
                  <div className="w-5 h-5 rounded-md border-2 border-neutral-350 bg-white group-hover:border-[#C04000] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-neutral-700 font-semibold">{item}</span>
                </div>
              ))}
            </div>
          ) : activeTab === "nextsteps" ? (
            <div className="space-y-2">
              {pkg.nextSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-xl border border-neutral-200/30 bg-white/60 shadow-[inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.01),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)]"
                >
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-xs text-neutral-700 leading-relaxed font-semibold">{step}</span>
                </div>
              ))}
            </div>
          ) : activeTab === "diff" ? (
            <AppealDiffView appealLetter={pkg.appealLetter} />
          ) : (
            <div className="relative">
              <button
                onClick={() => copy(activeText, activeTab)}
                className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-full border border-neutral-200/60 bg-white shadow-sm"
              >
                {copiedId === activeTab ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-semibold">Copy</span>
                  </>
                )}
              </button>
              <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed bg-[#FCFCFA]/80 border border-neutral-200/40 rounded-xl p-5 overflow-auto max-h-[420px] mt-12 shadow-inner">
                {activeText}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Composio Actions */}
      <div className="clay-card p-6 bg-white/90">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-neutral-900 uppercase text-xs tracking-wider">One-click actions</h3>
          <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
            via Composio
          </span>
        </div>
        <p className="text-xs text-neutral-500 mb-5">
          Dispatch your generated appeal details directly to Gmail, Google Drive, and Google Calendar.
        </p>
        <div className="space-y-2.5">
          <ComposioButton
            icon={<MailIcon className="w-4 h-4 text-neutral-600" />}
            label="Create Gmail Draft"
            state={composio["gmail_draft"]}
            onClick={() =>
              runComposio("gmail_draft", {
                subject: `Insurance Appeal — ${parsed.treatment}`,
                content: pkg.emailDraft,
              })
            }
          />
          <ComposioButton
            icon={<FolderOpen className="w-4 h-4 text-neutral-600" />}
            label="Create Drive Folder"
            state={composio["drive_folder"]}
            onClick={() =>
              runComposio("drive_folder", {
                folderName: `Appeal — ${parsed.treatment} — ${new Date().toLocaleDateString()}`,
              })
            }
          />
          <ComposioButton
            icon={<Calendar className="w-4 h-4 text-neutral-600" />}
            label="Add Calendar Reminder"
            state={composio["calendar_reminder"]}
            onClick={() =>
              runComposio("calendar_reminder", {
                title: `Appeal Deadline: ${parsed.treatment}`,
                deadline: parsed.appealDeadline,
              })
            }
          />
        </div>
        {Object.entries(composio)
          .filter(([, s]) => s.result)
          .map(([action, s]) => (
            <div
              key={action}
              className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                s.result?.status === "error"
                  ? "bg-red-50/50 text-red-600 border-red-100"
                  : "bg-emerald-50/50 text-emerald-700 border-emerald-100"
              }`}
            >
              {s.result?.status === "error" ? (
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              )}
              {s.result?.message}
            </div>
          ))}
      </div>

      {/* Memory Recall */}
      {memoryRecall && (
        <div className="clay-card overflow-hidden bg-white/90">
          <div className="px-6 py-4 border-b border-violet-100 bg-violet-50/20 flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-600" />
            <h3 className="font-semibold text-neutral-950 uppercase text-xs tracking-wider">Case memory</h3>
            <span className="text-[9px] bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full font-bold">
              via mem0
            </span>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 mb-3">
                Remembered this session
              </p>
              <div className="space-y-2">
                {memoryRecall.remembered.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-xl border border-neutral-200/30 bg-white/60 shadow-[inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.01),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)]"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-neutral-600 font-semibold leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 mb-3">
                Will recall in future sessions
              </p>
              <div className="space-y-2">
                {memoryRecall.willRecall.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-xl border border-neutral-200/30 bg-white/60 shadow-[inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.01),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)]"
                  >
                    <Brain className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-neutral-600 font-semibold leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StrengthRing({ score, label }: { score: number; label: string }) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="hidden sm:flex flex-col items-center gap-1.5 flex-shrink-0 bg-white/40 p-3 rounded-2xl border border-white/60 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#EBEBE8" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] p-4 border transition-all ${
        highlight 
          ? "bg-amber-50/60 border-amber-200/50 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.03),inset_2px_2px_4px_rgba(255,255,255,0.7)]" 
          : "bg-white/80 border-neutral-200/50 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.02),inset_2px_2px_4px_rgba(255,255,255,0.95)]"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-xs font-bold leading-snug uppercase tracking-wide ${
          highlight ? "text-amber-800" : "text-neutral-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ComposioButton({
  icon,
  label,
  state,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  state?: ComposioState;
  onClick: () => void;
}) {
  const done = state?.result && state.result.status !== "error";

  return (
    <button
      onClick={onClick}
      disabled={!!state?.loading || !!done}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
        done
          ? "bg-emerald-50/40 text-emerald-700 border-emerald-100 cursor-default shadow-[inset_-2.5px_-2.5px_5px_rgba(0,0,0,0.04),inset_2.5px_2.5px_5px_rgba(255,255,255,0.5)]"
          : state?.loading
          ? "bg-neutral-50 text-neutral-500 border-neutral-200/50 opacity-70 cursor-not-allowed"
          : "bg-white/95 hover:bg-white text-neutral-800 border-neutral-200/50 shadow-[2px_2px_4px_rgba(0,0,0,0.03),inset_-2.5px_-2.5px_5px_rgba(0,0,0,0.04),inset_2.5px_2.5px_5px_rgba(255,255,255,0.95)] active:shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.06),inset_-1.5px_-1.5px_3px_rgba(255,255,255,0.9)] active:scale-[0.98]"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-[#EFEFE9] border border-neutral-200/50 flex items-center justify-center">
          {state?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : done ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : icon}
        </span>
        {done ? "Done" : label}
      </span>
      {!done && !state?.loading && <ChevronRight className="w-4 h-4 text-neutral-450" />}
    </button>
  );
}
