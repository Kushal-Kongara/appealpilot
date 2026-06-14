"use client";

import { Search, Brain, Zap, Cpu } from "lucide-react";

const sponsors = [
  {
    icon: <Search className="w-5 h-5 text-orange-500" />,
    name: "Tavily",
    role: "Web Research",
    color: "orange",
    desc: "Searches appeal rules, insurer policies, and medical guidelines in real time.",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
  },
  {
    icon: <Brain className="w-5 h-5 text-purple-500" />,
    name: "mem0",
    role: "Persistent Memory",
    color: "purple",
    desc: "Saves each appeal case so the agent remembers your history across sessions.",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    icon: <Zap className="w-5 h-5 text-blue-500" />,
    name: "Composio",
    role: "Tool Actions",
    color: "blue",
    desc: "Executes real Gmail drafts, Google Drive folders, and Calendar reminders.",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    icon: <Cpu className="w-5 h-5 text-emerald-500" />,
    name: "Nebius",
    role: "AI Inference",
    color: "emerald",
    desc: "Powers the AI generation engine for appeal letters and documents at scale.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

export default function SponsorBadges() {
  return (
    <section className="mt-20 mb-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Powered By
        </p>
        <h2 className="text-2xl font-bold text-slate-800">Sponsor Technology Stack</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Four best-in-class APIs working together to build your appeal
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sponsors.map((s) => (
          <div
            key={s.name}
            className={`rounded-2xl border ${s.border} ${s.bg} p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                {s.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
                {s.role}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{s.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
