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
  Sparkles,
  AlertTriangle,
  Building2,
  Clock,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { BuildAppealResponse, ComposioActionResponse } from "@/lib/types";

type Tab = "letter" | "email" | "phone" | "checklist" | "nextsteps";

interface Props {
  result: BuildAppealResponse;
}

interface ComposioState {
  loading: boolean;
  result: ComposioActionResponse | null;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "letter", label: "Appeal Letter", icon: <FileText className="w-4 h-4" /> },
  { id: "email", label: "Email Draft", icon: <Mail className="w-4 h-4" /> },
  { id: "phone", label: "Phone Script", icon: <Phone className="w-4 h-4" /> },
  { id: "checklist", label: "Documents", icon: <CheckSquare className="w-4 h-4" /> },
  { id: "nextsteps", label: "Next Steps", icon: <ListTodo className="w-4 h-4" /> },
];

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
    setComposio((prev) => ({
      ...prev,
      [action]: { loading: true, result: null },
    }));
    try {
      const res = await fetch("/api/actions/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const json = (await res.json()) as ComposioActionResponse;
      setComposio((prev) => ({
        ...prev,
        [action]: { loading: false, result: json },
      }));
    } catch {
      setComposio((prev) => ({
        ...prev,
        [action]: {
          loading: false,
          result: { status: "error", message: "Action failed. Try again." },
        },
      }));
    }
  };

  const { parsed, package: pkg } = result;

  const activeContent = {
    letter: pkg.appealLetter,
    email: pkg.emailDraft,
    phone: pkg.phoneScript,
    checklist: "",
    nextsteps: "",
  }[activeTab];

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" />
          <p className="text-sm leading-relaxed opacity-95">{pkg.summary}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<Building2 className="w-4 h-4 text-blue-500" />}
          label="Insurer"
          value={parsed.insuranceCompany}
        />
        <InfoCard
          icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
          label="Denial Reason"
          value={parsed.denialReason}
        />
        <InfoCard
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          label="Appeal Deadline"
          value={parsed.appealDeadline}
          highlight
        />
        <InfoCard
          icon={<Stethoscope className="w-4 h-4 text-emerald-500" />}
          label="Treatment"
          value={parsed.treatment}
        />
      </div>

      {/* Document Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 bg-slate-50">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white -mb-px"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === "checklist" ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-4">
                Gather these documents before submitting your appeal:
              </p>
              {pkg.documentChecklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          ) : activeTab === "nextsteps" ? (
            <div className="space-y-3">
              {pkg.nextSteps.map((step, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => copy(activeContent, activeTab)}
                className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
              >
                {copiedId === activeTab ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 rounded-xl p-4 overflow-auto max-h-[420px] mt-6">
                {activeContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Composio Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <h3 className="font-semibold text-slate-800">One-Click Actions</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium ml-1">
            via Composio
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Instantly send your appeal package to Gmail, Google Drive, and Calendar.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ComposioButton
            icon={<MailIcon className="w-4 h-4" />}
            label="Create Gmail Draft"
            color="blue"
            state={composio["gmail_draft"]}
            onClick={() =>
              runComposio("gmail_draft", {
                subject: `Insurance Appeal — ${parsed.treatment}`,
                content: pkg.emailDraft,
              })
            }
          />
          <ComposioButton
            icon={<FolderOpen className="w-4 h-4" />}
            label="Create Drive Folder"
            color="emerald"
            state={composio["drive_folder"]}
            onClick={() =>
              runComposio("drive_folder", {
                folderName: `Appeal — ${parsed.treatment} — ${new Date().toLocaleDateString()}`,
              })
            }
          />
          <ComposioButton
            icon={<Calendar className="w-4 h-4" />}
            label="Add Calendar Reminder"
            color="amber"
            state={composio["calendar_reminder"]}
            onClick={() =>
              runComposio("calendar_reminder", {
                title: `Appeal Deadline: ${parsed.treatment}`,
                deadline: parsed.appealDeadline,
              })
            }
          />
        </div>

        {/* Composio result messages */}
        {Object.entries(composio)
          .filter(([, s]) => s.result)
          .map(([action, s]) => (
            <div
              key={action}
              className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
                s.result?.status === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-700"
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
      className={`rounded-xl p-3 border ${
        highlight
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p
        className={`text-xs font-semibold leading-snug ${
          highlight ? "text-amber-700" : "text-slate-800"
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
  color,
  state,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: "blue" | "emerald" | "amber";
  state?: ComposioState;
  onClick: () => void;
}) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
  };
  const done = state?.result && state.result.status !== "error";

  return (
    <button
      onClick={onClick}
      disabled={!!state?.loading || !!done}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        done
          ? "bg-emerald-100 text-emerald-700 cursor-default"
          : state?.loading
          ? "opacity-70 cursor-not-allowed " + colors[color]
          : colors[color]
      } shadow-sm`}
    >
      {state?.loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : done ? (
        <CheckCheck className="w-4 h-4" />
      ) : (
        icon
      )}
      {done ? "Done" : label}
    </button>
  );
}
