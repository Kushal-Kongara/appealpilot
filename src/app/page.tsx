"use client";

import { useState, useRef } from "react";
import {
  Shield,
  FileText,
  Search,
  CheckCircle2,
  Loader2,
  ChevronRight,
  AlertCircle,
  Stethoscope,
  Hospital,
  ScanLine,
  Brain,
  Zap,
  CirclePlay,
  Github,
  Twitter,
} from "lucide-react";
import { BuildAppealResponse } from "@/lib/types";
import StreamingTimeline from "@/components/denial/StreamingTimeline";
import DenialAnnotator from "@/components/denial/DenialAnnotator";
import DeadlineCountdown from "@/components/denial/DeadlineCountdown";
import ResultsPanel from "@/components/ResultsPanel";
import AgentReceipts from "@/components/AgentReceipts";
import SponsorBadges from "@/components/SponsorBadges";

const SAMPLES = [
  {
    id: "psoriasis",
    label: "Psoriasis treatment",
    desc: "Biologic denied as not medically necessary",
    tag: "Not Medically Necessary",
    tagColor: "bg-sky-50 text-sky-700 border-sky-100",
    icon: Stethoscope,
    text: `Dear Member,

We reviewed your request for continued treatment for psoriasis. Based on the information received, this service is denied because it is not considered medically necessary under your plan. The clinical criteria for this treatment have not been met based on the available medical information.

You may appeal this decision within 60 days. To support your appeal, please include medical records, physician notes, and any documentation showing previous treatments tried.

If you have questions, please contact Member Services at the number on the back of your insurance card.

Sincerely,
Medical Review Department`,
  },
  {
    id: "er",
    label: "ER out of network",
    desc: "Emergency visit at non-participating facility",
    tag: "Out of Network",
    tagColor: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Hospital,
    text: `Dear [Member Name],

This letter is to inform you that your claim for emergency room services at St. Luke's Medical Center on March 15, 2026 has been denied. The denial is based on the fact that St. Luke's Medical Center is an out-of-network provider under your BlueCross BlueShield plan.

Out-of-network emergency services may be covered at in-network rates only if the situation meets the definition of a true medical emergency. Based on our review, the medical records do not support that this was a life-threatening emergency requiring immediate care at an out-of-network facility.

You have 30 days from the date of this letter to file an internal appeal. Please submit your appeal in writing along with any additional medical documentation supporting the emergency nature of your visit, including EMS records, triage notes, and physician documentation.

Sincerely,
BlueCross BlueShield Claims Review`,
  },
  {
    id: "mri",
    label: "MRI prior auth",
    desc: "Imaging denied without prior authorization",
    tag: "Prior Auth Missing",
    tagColor: "bg-violet-50 text-violet-700 border-violet-100",
    icon: ScanLine,
    text: `Dear Member,

We have reviewed your claim for an MRI of the lumbar spine performed on April 3, 2026. This service has been denied because prior authorization was not obtained before the procedure was performed.

Your Aetna health plan requires prior authorization for MRI services. Without prior authorization, this service is not eligible for reimbursement under your plan benefits.

You may appeal this decision within 45 days. To support your appeal, please include your physician's referral or order for the MRI, documentation showing that prior authorization was requested or waived due to urgency, clinical notes supporting medical necessity, and documentation of any prior conservative treatments.

Sincerely,
Aetna Medical Review Department`,
  },
];

type AppState = "idle" | "processing" | "done" | "error";

export default function Home() {
  const [denialText, setDenialText] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<BuildAppealResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const whySectionRef = useRef<HTMLDivElement>(null);

  const handleBuild = async (textOverride?: string) => {
    const text = textOverride ?? denialText;
    if (!text.trim()) return;
    setAppState("processing");
    setError(null);
    setResult(null);

    // Scroll to demo workspace immediately when starting
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const res = await fetch("/api/appeal/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denialText: text }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = (await res.json()) as BuildAppealResponse;

      setResult(data);
      setAppState("done");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setAppState("error");
    }
  };

  const handleJudgeDemo = async () => {
    const text = SAMPLES[0].text;
    setDenialText(text);
    await handleBuild(text);
  };

  const handleReset = () => {
    setAppState("idle");
    setResult(null);
    setError(null);
    setDenialText("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToDemo = () => {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => textareaRef.current?.focus(), 300);
  };

  const isProcessing = appState === "processing";
  const isDone = appState === "done";
  const isIdle = appState === "idle";

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-800 font-sans antialiased">
      
      {/* Floating Black Glassmorphic Navigation Pill (Mockup Style) */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-5xl bg-neutral-950/95 border border-white/10 backdrop-blur-md rounded-full px-5 sm:px-6 py-2 shadow-2xl pointer-events-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <Shield className="w-3 h-3 text-neutral-950 fill-neutral-950" />
            </div>
            <span className="text-xs font-handdrawn uppercase tracking-widest text-white">AppealPilot</span>
          </div>

          {/* Navigation Links */}
          {isIdle && (
            <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-widest text-neutral-400">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition-colors">HOME</button>
              <button onClick={() => whySectionRef.current?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">HOW IT WORKS</button>
              <button onClick={() => document.getElementById("technology-stack")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">TECHNOLOGY</button>
              <button onClick={scrollToDemo} className="hover:text-white transition-colors">SANDBOX</button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {isIdle ? (
              <>
                <button
                  onClick={scrollToDemo}
                  className="hidden sm:inline-block text-[10px] font-bold tracking-widest text-neutral-400 hover:text-white transition-colors"
                >
                  LOG IN
                </button>
                <button
                  onClick={handleJudgeDemo}
                  className="bg-white hover:bg-neutral-100 text-neutral-950 px-4.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
                >
                  Try for free
                </button>
              </>
            ) : (
              <button
                onClick={handleReset}
                className="bg-white hover:bg-neutral-100 text-neutral-950 px-4.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
              >
                New Appeal
              </button>
            )}
          </div>
        </nav>
      </div>

      <main className="flex-1 w-full pt-24">
        {/* Hero Section styled exactly like the farce template */}
        {isIdle && (
          <section className="pb-16 pt-6">
            <div className="max-w-6xl mx-auto px-6">
              
              {/* Center-aligned wide hero image banner */}
              <div className="w-full max-w-5xl mx-auto rounded-[32px] overflow-hidden border border-neutral-200/40 shadow-2xl relative group bg-neutral-50 mb-14">
                <img
                  src="/temple.png"
                  alt="AppealPilot Temple & Guidance Path"
                  className="w-full h-auto aspect-[16/9] md:aspect-[2.1/1] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/5 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Title Copy block (farce split style layout) */}
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-5xl mx-auto mb-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-neutral-900 tracking-tight leading-[1.08] text-balance">
                    Say it once, watch AI agents appeal it <span className="font-display italic font-normal text-[#C04000]">forever</span>
                  </h1>
                </div>

                <div className="lg:pt-2">
                  <p className="text-sm sm:text-base text-neutral-500 leading-relaxed mb-6 font-medium">
                    Automate health insurance appeals, clinical policy research, and claims submissions without writing a line of code.
                  </p>

                  {/* Clean email-style search input pill */}
                  <div className="clay-input flex items-center gap-1.5 p-1.5 w-full max-w-md mb-4 bg-white/80 border border-neutral-200/50 shadow-inner">
                    <input
                      type="text"
                      placeholder="Paste your denial letter..."
                      className="flex-1 text-sm bg-transparent border-none outline-none pl-3 text-neutral-800 placeholder:text-neutral-400 min-w-0 cursor-pointer"
                      onClick={scrollToDemo}
                      readOnly
                    />
                    <button
                      onClick={scrollToDemo}
                      className="clay-button-terracotta flex-shrink-0 whitespace-nowrap text-xs font-semibold py-2 px-5"
                    >
                      Try for free
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
                    <button onClick={scrollToDemo} className="hover:text-neutral-800 underline underline-offset-4 transition-colors">
                      Paste letter manually
                    </button>
                    <span className="text-neutral-300">•</span>
                    <button onClick={handleJudgeDemo} className="text-[#C04000] hover:text-[#A83800] transition-colors">
                      Run Live Demo
                    </button>
                  </div>
                </div>
              </div>

              {/* Monochrome technology sponsor strip */}
              <div className="max-w-5xl mx-auto pt-8 border-t border-neutral-200/40">
                <p className="text-[10px] text-neutral-400 mb-4 font-bold uppercase tracking-wider">Used at global tech stacks</p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {[
                    { name: "Tavily", font: "font-sans tracking-wide font-extrabold" },
                    { name: "mem0", font: "font-mono tracking-tight font-bold text-neutral-600" },
                    { name: "Composio", font: "font-sans tracking-tighter font-black uppercase" },
                    { name: "Nebius", font: "font-serif tracking-widest font-semibold italic" }
                  ].map((brand) => (
                    <span
                      key={brand.name}
                      className={`text-base text-neutral-300 hover:text-neutral-450 transition-colors select-none ${brand.font}`}
                    >
                      {brand.name}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* 2. "Why" Section - 4 Column Pillars (Claymorphic) */}
        <section ref={whySectionRef} className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
          <div className="text-center mb-12">
            <span className="section-label">Agent components</span>
            <h2 className="font-handdrawn text-3xl text-neutral-800 mt-1 uppercase">Why AppealPilot</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <PillarCard
              icon={<FileText className="w-5 h-5 text-white" />}
              title="CLAIM ANALYSIS"
              desc="We extract deadline dates, procedural reason codes, and insurer criteria details instantly."
            />
            <PillarCard
              icon={<Search className="w-5 h-5 text-white" />}
              title="LIVE RESEARCH"
              desc="Tavily queries insurer policies, clinical guidelines, and FDA standards in real-time."
            />
            <PillarCard
              icon={<Brain className="w-5 h-5 text-white" />}
              title="CASE MEMORY"
              desc="mem0 securely remembers past claim arguments to guarantee historical session continuity."
            />
            <PillarCard
              icon={<Zap className="w-5 h-5 text-white" />}
              title="ACTION SUITE"
              desc="Composio hooks directly into Gmail, Drive, and Google Calendar to draft and schedule delivery."
            />
          </div>
        </section>

        {/* 3. Business Capabilities & Facts (Stats) Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="section-label">Performance indicators</span>
              <h3 className="font-handdrawn text-3xl text-neutral-800 mt-1 uppercase">Claims & Facts</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto">
              <StatBlock value="85%" label="Success boost rate" />
              <StatBlock value="$4.2M+" label="Contested claim volume" />
              <StatBlock value="< 90s" label="Average document draft time" />
              <StatBlock value="100%" label="HIPAA data compliance" />
            </div>
          </div>
        </section>

        {/* 4. Use Cases Section (Claymorphic) */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <span className="section-label">Coverage types</span>
            <h3 className="font-handdrawn text-3xl text-neutral-800 mt-1 uppercase">What we appeal</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="clay-card p-6 text-center bg-white">
              <div className="w-9 h-9 rounded-full bg-[#556B2F] flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-neutral-850 text-xs mb-1 uppercase tracking-wider">Medical Necessity</p>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">Prior-auth claims denied for expensive therapies, specialist biologic orders, or drug schedules.</p>
            </div>
            <div className="clay-card p-6 text-center bg-white">
              <div className="w-9 h-9 rounded-full bg-[#556B2F] flex items-center justify-center mx-auto mb-4">
                <Hospital className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-neutral-850 text-xs mb-1 uppercase tracking-wider">Emergency Out-of-Network</p>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">Urgent trauma center treatments or hospital room claims billed out-of-network.</p>
            </div>
            <div className="clay-card p-6 text-center bg-white">
              <div className="w-9 h-9 rounded-full bg-[#556B2F] flex items-center justify-center mx-auto mb-4">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-neutral-850 text-xs mb-1 uppercase tracking-wider">Advanced Imaging</p>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">MRI, CT scans, and nuclear diagnostics rejected due to lack of prior authorizations.</p>
            </div>
          </div>
        </section>

        {/* 5. Quote & Call-to-Demo Trigger Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="font-display italic text-2xl md:text-3xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            "People who accept their first health insurance denial without appeal are letting them win. There, we've said it."
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={scrollToDemo}
              className="clay-button-terracotta px-8 py-3.5 rounded-full flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CirclePlay className="w-5 h-5" />
              Let's Demo!
            </button>
          </div>
        </section>

        {/* 6. Interactive Claymorphic Demo Workspace */}
        <section ref={demoSectionRef} className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="section-label">Interactive sandbox</span>
            <h3 className="font-handdrawn text-3xl text-neutral-800 mt-1 uppercase">Demo Workspace</h3>
            <p className="text-neutral-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Experience the tactile, claymorphic dashboard of the AppealPilot agent.
            </p>
          </div>

          <div className="clay-card-blue p-6 sm:p-8 max-w-5xl mx-auto bg-white/70 backdrop-blur-md">
            
            {!isIdle && (
              <div className="mb-6 pb-4 border-b border-neutral-200/50">
                <h4 className="font-handdrawn text-xl text-neutral-900 uppercase">
                  {isDone ? "Your Appeal Package" : "Building your appeal..."}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 font-semibold">
                  {isDone
                    ? "Completed successfully. Review and save below."
                    : "Wait while our agents research policies and build letters."}
                </p>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
              
              {/* Left Column: Form / Result Content */}
              <div className="space-y-6">
                
                {/* Input Textarea Card (Claymorphic) */}
                {!isDone && (
                  <div className="clay-card p-6 bg-white/95">
                    {/* Trial Sample Selector */}
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                        Try a sample denial
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SAMPLES.map((s) => {
                          const Icon = s.icon;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setDenialText(s.text)}
                              disabled={isProcessing}
                              className="text-left p-3.5 rounded-2xl border border-white bg-white/80 hover:bg-white hover:scale-[1.01] hover:shadow-md transition-all duration-300 disabled:opacity-50 group text-neutral-750"
                            >
                              <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-2.5">
                                <Icon className="w-4 h-4 text-neutral-600" />
                              </div>
                              <p className="font-bold text-neutral-800 text-xs mb-0.5">{s.label}</p>
                              <p className="text-[10px] text-neutral-550 leading-relaxed mb-2 line-clamp-1 font-semibold">{s.desc}</p>
                              <span className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border border-neutral-100 bg-neutral-50 text-neutral-500">
                                Sample Case
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Editor Textarea */}
                    <div>
                      <label htmlFor="denial-textarea" className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                        Paste denial letter text
                      </label>
                      <p className="text-[11px] text-neutral-500 mb-3 font-semibold">
                        The agent scans patient files, claim tags, and deadlines automatically.
                      </p>
                      <textarea
                        id="denial-textarea"
                        ref={textareaRef}
                        value={denialText}
                        onChange={(e) => setDenialText(e.target.value)}
                        disabled={isProcessing}
                        placeholder="Paste the full text of your insurance denial letter here..."
                        className="w-full h-56 resize-none p-5 text-sm text-neutral-850 font-mono leading-relaxed clay-input"
                      />
                    </div>

                    {denialText.length > 30 && <DenialAnnotator text={denialText} />}

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-200/40">
                      <span className="text-xs text-neutral-450 font-bold uppercase tracking-wider">
                        {denialText.length > 0 ? `${denialText.length} characters` : "Data stays local"}
                      </span>
                      <button
                        onClick={() => handleBuild()}
                        disabled={!denialText.trim() || isProcessing}
                        className="clay-button-terracotta px-6 py-2.5 flex items-center gap-2 text-sm"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Building...
                          </>
                        ) : (
                          <>
                            Build Package
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {appState === "error" && error && (
                  <div className="clay-card border-red-200 bg-red-50/70 p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-800 text-sm uppercase">Compilation Failed</p>
                      <p className="text-red-700 text-xs mt-0.5">{error}</p>
                      <button onClick={() => setAppState("idle")} className="text-xs font-semibold text-red-750 underline mt-2 block">
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Results Display */}
                {isDone && result && (
                  <div ref={resultsRef} className="space-y-6 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-handdrawn text-xl text-neutral-900 uppercase">Appeal Package</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">Documents built successfully</p>
                      </div>
                      <button onClick={handleReset} className="clay-button bg-white hover:bg-neutral-50 text-neutral-700 px-4.5 py-2 text-xs font-bold border border-neutral-200 shadow-sm">
                        New Appeal
                      </button>
                    </div>

                    <DeadlineCountdown deadlineString={result.parsed.appealDeadline} />
                    <ResultsPanel result={result} />

                    <div className="mt-8">
                      <div className="mb-4">
                        <h5 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Agent receipts</h5>
                        <p className="text-xs text-neutral-500 mt-0.5">Verified actions logged for this appeal</p>
                      </div>
                      <AgentReceipts receipts={result.receipts} sources={result.tavilySources} />
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Streaming Timeline */}
              {(isProcessing || isDone) && <StreamingTimeline appState={appState} />}

            </div>

          </div>
        </section>

        {/* Technology Stack Sponsor badges Section */}
        <div id="technology-stack" className="border-t border-neutral-200/30">
          <SponsorBadges />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 bg-[#FCFCFB] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#C04000] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-sm font-handdrawn uppercase tracking-widest text-[#C04000]">AppealPilot</span>
          </div>
          <p className="text-[10px] text-neutral-500 text-center sm:text-right max-w-lg leading-relaxed font-semibold">
            <span className="font-bold text-neutral-600">Disclaimer:</span> AppealPilot is a secure claim assistant. It organizes documentation based on clinical guidelines. Always consult medical professionals or legal counsels for binding cases.
          </p>
        </div>
      </footer>

    </div>
  );
}

function PillarCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="clay-card p-6 text-center bg-white">
      <div className="w-10 h-10 rounded-full bg-[#C04000] flex items-center justify-center mx-auto mb-4 shadow-sm">
        {icon}
      </div>
      <p className="font-handdrawn text-lg text-neutral-800 mb-2 uppercase">{title}</p>
      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">{desc}</p>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-6 bg-[#FCFCFB] border border-neutral-200/40 rounded-[24px] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.015),inset_2px_2px_4px_#FFFFFF] clay-card">
      <p className="font-handdrawn text-4xl text-[#C04000] uppercase mb-1">{value}</p>
      <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 leading-normal">{label}</p>
    </div>
  );
}
