"use client";

import { useState, useRef, useEffect } from "react";
import {
  Shield,
  FileText,
  Search,
  Brain,
  Zap,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { AgentStep, BuildAppealResponse } from "@/lib/types";
import AgentTimeline from "@/components/AgentTimeline";
import ResultsPanel from "@/components/ResultsPanel";
import SponsorBadges from "@/components/SponsorBadges";

const SAMPLE_LETTER = `Dear Member,

We reviewed your request for continued treatment for psoriasis. Based on the information received, this service is denied because it is not considered medically necessary under your plan. The clinical criteria for this treatment have not been met based on the available medical information.

You may appeal this decision within 60 days. To support your appeal, please include medical records, physician notes, and any documentation showing previous treatments tried.

If you have questions regarding this decision, please contact Member Services at the number on the back of your insurance card.

Sincerely,
Medical Review Department`;

const INITIAL_STEPS: AgentStep[] = [
  { id: "read", label: "Reading denial letter", status: "pending" },
  { id: "extract", label: "Finding denial reason", status: "pending" },
  { id: "research", label: "Searching appeal rules with Tavily", status: "pending" },
  { id: "memory", label: "Checking memory with mem0", status: "pending" },
  { id: "generate", label: "Drafting appeal package", status: "pending" },
  { id: "composio", label: "Preparing tool actions with Composio", status: "pending" },
];

const STEP_TIMINGS = [400, 900, 1600, 3200, 5000, 6500];

type AppState = "idle" | "processing" | "done" | "error";

export default function Home() {
  const [denialText, setDenialText] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [timelineSteps, setTimelineSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<BuildAppealResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const animateTimeline = () => {
    const steps = [...INITIAL_STEPS];
    setTimelineSteps(steps.map((s) => ({ ...s, status: "pending" as const })));

    STEP_TIMINGS.forEach((delay, i) => {
      const t = setTimeout(() => {
        setTimelineSteps((prev) => {
          const next = [...prev];
          if (next[i]) {
            if (i > 0 && next[i - 1]?.status === "running") {
              next[i - 1] = { ...next[i - 1], status: "done" };
            }
            next[i] = { ...next[i], status: "running" };
          }
          return next;
        });
      }, delay);
      timersRef.current.push(t);
    });
  };

  const handleBuild = async () => {
    if (!denialText.trim()) return;
    setAppState("processing");
    setError(null);
    setResult(null);
    clearTimers();
    animateTimeline();

    try {
      const res = await fetch("/api/appeal/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denialText }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = (await res.json()) as BuildAppealResponse;

      clearTimers();
      // Snap all steps to done with server-provided details
      setTimelineSteps(data.steps);
      setResult(data);
      setAppState("done");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (e) {
      clearTimers();
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setAppState("error");
      setTimelineSteps((prev) =>
        prev.map((s) =>
          s.status === "running" ? { ...s, status: "error" } : s
        )
      );
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setResult(null);
    setError(null);
    setTimelineSteps(INITIAL_STEPS);
    setDenialText("");
    clearTimers();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isProcessing = appState === "processing";
  const isDone = appState === "done";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              AppealPilot
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Agent Ready
            </span>
            {isDone && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
              >
                New Appeal
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-xs text-blue-700 font-medium mb-5">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Insurance Appeals
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            Turn a Denial Letter Into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              a Winning Appeal
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Paste your insurance denial letter. Our AI agent researches your rights,
            drafts your appeal, and prepares every document you need — in seconds.
          </p>
        </div>

        {/* Main layout: input + timeline side by side when processing */}
        <div className={`grid gap-6 ${isProcessing || isDone ? "lg:grid-cols-[1fr_340px]" : ""}`}>
          {/* Left: input + results */}
          <div className="space-y-6">
            {/* Input card */}
            {!isDone && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Paste Your Denial Letter
                  </label>
                  <button
                    onClick={() => setDenialText(SAMPLE_LETTER)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    disabled={isProcessing}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Try Sample Letter
                  </button>
                </div>
                <textarea
                  value={denialText}
                  onChange={(e) => setDenialText(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Paste the full text of your insurance denial letter here..."
                  className="w-full h-52 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    {denialText.length > 0 ? `${denialText.length} characters` : "Your letter stays private"}
                  </span>
                  <button
                    onClick={handleBuild}
                    disabled={!denialText.trim() || isProcessing}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Building Package...
                      </>
                    ) : (
                      <>
                        Build Appeal Package
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {appState === "error" && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Build Failed</p>
                  <p className="text-red-600 text-sm mt-0.5">{error}</p>
                  <button
                    onClick={() => setAppState("idle")}
                    className="text-xs text-red-600 underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {isDone && result && (
              <div ref={resultsRef}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Appeal Package</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Complete and ready to submit
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-4 py-2 rounded-xl transition-colors"
                  >
                    Start New Appeal
                  </button>
                </div>
                <ResultsPanel result={result} />
              </div>
            )}
          </div>

          {/* Right: timeline (shown when processing or done) */}
          {(isProcessing || isDone) && (
            <div className="space-y-4">
              <AgentTimeline steps={timelineSteps} />
              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2">What&apos;s happening:</p>
                  <div className="space-y-1.5 text-xs text-blue-600">
                    <MiniStep icon={<Search className="w-3 h-3" />} text="Tavily researching appeal rules" />
                    <MiniStep icon={<Brain className="w-3 h-3" />} text="mem0 storing your case" />
                    <MiniStep icon={<Zap className="w-3 h-3" />} text="AI drafting all documents" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature strip (shown when idle) */}
        {appState === "idle" && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureCard
              icon={<FileText className="w-5 h-5 text-blue-500" />}
              title="Instant Analysis"
              desc="Extracts insurer, denial reason, deadline, and required documents automatically."
            />
            <FeatureCard
              icon={<Search className="w-5 h-5 text-orange-500" />}
              title="Live Research"
              desc="Tavily searches real-time appeal rules and insurer-specific guidance."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              title="Complete Package"
              desc="Appeal letter, email draft, phone script, checklist — everything you need."
            />
          </div>
        )}

        {/* Step guide (idle only) */}
        {appState === "idle" && (
          <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-5">How It Works</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { n: "1", title: "Paste your letter", desc: "Copy the denial letter text and paste it above." },
                { n: "2", title: "AI builds your package", desc: "Our agent researches, analyzes, and drafts all appeal documents." },
                { n: "3", title: "Submit and track", desc: "Use Composio actions to send via Gmail, Drive, and Calendar." },
              ].map((step) => (
                <div key={step.n} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor section */}
        <SponsorBadges />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">AppealPilot</span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Built for hackathon demo purposes. Not legal or medical advice.
            Always consult qualified professionals for healthcare decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}

function MiniStep({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Circle className="w-1.5 h-1.5 text-blue-400 fill-blue-400 flex-shrink-0" />
      {icon}
      <span>{text}</span>
    </div>
  );
}
