"use client";

import { Search, Brain, Zap, Cpu } from "lucide-react";

const sponsors = [
  {
    icon: <Search className="w-5 h-5 text-[#C04000]" />,
    name: "Tavily",
    role: "Web research",
    desc: "Queries real-time insurance rules, insurer policies, and clinical standards on the fly.",
    accent: "text-orange-700 bg-orange-50 border-orange-100",
  },
  {
    icon: <Brain className="w-5 h-5 text-[#556B2F]" />,
    name: "mem0",
    role: "Memory",
    desc: "Saves claim context securely to remember your historical cases across multiple runs.",
    accent: "text-neutral-700 bg-neutral-100 border-neutral-200",
  },
  {
    icon: <Zap className="w-5 h-5 text-blue-700" />,
    name: "Composio",
    role: "Tool actions",
    desc: "Hook into GSuite and calendars to trigger Gmail drafts and calendar tasks on completion.",
    accent: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    icon: <Cpu className="w-5 h-5 text-emerald-700" />,
    name: "Nebius",
    role: "AI reasoning",
    desc: "Powers the primary LLM reasoning models to write structured, customized appeal briefs.",
    accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
  },
];

export default function SponsorBadges() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Technology stack</p>
          <h2 className="font-handdrawn text-3xl text-neutral-800 uppercase">Integrations & API Partners</h2>
          <p className="text-neutral-500 mt-2 text-sm max-w-md mx-auto">
            Four specialized tools collaborating in real-time to research, recall, write, and submit.
          </p>
        </div>

        {/* Explanatory cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {sponsors.map((s) => (
            <div key={s.name} className="card-editorial p-6 flex gap-4 bg-white border border-neutral-300/40">
              <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-neutral-800 text-sm uppercase tracking-wider">{s.name}</p>
                  <span
                    className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${s.accent}`}
                  >
                    {s.role}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
