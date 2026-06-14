# AppealPilot

> AI agent that turns confusing health insurance denial letters into a complete, ready-to-send appeal package — in seconds.

**Demo:** `npm run dev` → `http://localhost:3000`

---

## What It Does

1. **Paste** your insurance denial letter (or click a sample)
2. **Agent pipeline** extracts insurer, denial reason, deadline, required documents
3. **Tavily** searches real-time appeal rules and insurer-specific guidance
4. **mem0** saves the case to persistent memory for future sessions
5. **Generator** produces: appeal letter · email draft · phone script · call guide · document checklist · next steps
6. **Appeal Strength Score** rates your position 0–100 with missing evidence callouts
7. **Composio** prepares one-click Gmail draft, Drive folder, Calendar reminder
8. **Agent Receipts** shows exactly what each sponsor did — built for judge visibility

---

## Demo Flow (4-minute pitch)

1. Open `http://localhost:3000`
2. Click **"Run Live Demo"** (violet button) — auto-fills psoriasis sample + builds full package
3. Walk through **Agent Timeline** as it animates
4. Show **Appeal Strength Score** (85/100 Strong)
5. Click through **tabs**: Appeal Letter → Email → Call Guide → Checklist
6. Click **Composio actions** → show "Demo Mode: Gmail draft prepared"
7. Scroll down to **Agent Receipts** — terminal-style panel showing Tavily LIVE, mem0 SAVED, Composio DEMO, Nebius FALLBACK
8. Try a different sample: **ER Visit (Out of Network)** or **MRI (Prior Auth Missing)** — watch denial reason, letter, and call script change

---

## Sponsor Stack

| Sponsor | Role | Status |
|---------|------|--------|
| **Tavily** | Real-time web research on appeal rules and insurer policies | Live (key present) |
| **mem0** | Persistent agent memory — stores each case for future sessions | Live (key present) |
| **Composio** | Tool actions — Gmail Draft, Drive Folder, Calendar Reminder | Demo mode (OAuth not wired) |
| **Nebius** | AI inference via OpenAI-compatible endpoint | Fallback active (key not set) |

All sponsors have graceful fallbacks — the app never crashes.

---

## Local Setup

```bash
git clone <repo>
cd appealpilot
npm install
cp .env.local.example .env.local
# Fill in API keys (see below)
npm run dev
```

## Environment Variables

```env
# AI inference — optional, high-quality templates used as fallback
NEBIUS_API_KEY=
NEBIUS_BASE_URL=
NEBIUS_MODEL=

# Real-time appeal research
TAVILY_API_KEY=

# Gmail, Drive, Calendar tool actions
COMPOSIO_API_KEY=

# Persistent case memory
MEM0_API_KEY=
```

The app works without any keys in demo mode. Keys unlock live sponsor integrations.

---

## Features

| Feature | Description |
|---------|-------------|
| **Judge Demo Mode** | One-click: fills sample + builds full package automatically |
| **3 Sample Denials** | Psoriasis (not medically necessary), ER visit (out of network), MRI (prior auth) |
| **Appeal Strength Score** | 0–100 score with factor breakdown and missing evidence callouts |
| **6-tab Document Suite** | Letter · Email · Phone Script · Call Guide · Checklist · Next Steps |
| **Agent Timeline** | Animated 6-step pipeline showing each sponsor action |
| **Agent Receipts** | Terminal-style panel proving what Tavily, mem0, Composio, Nebius did |
| **Tavily Source Cards** | Real or demo-fallback web sources with titles, snippets, links |
| **Case Memory Panel** | mem0 save status + what will be recalled next session |
| **Composio Actions** | Demo-mode Gmail/Drive/Calendar — structured for real OAuth plug-in |

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                       # Main UI — hero, samples, timeline, results
│   ├── api/
│   │   ├── appeal/build/route.ts      # POST: full pipeline
│   │   └── actions/composio/route.ts  # POST: tool actions
├── lib/
│   ├── types.ts                       # All shared interfaces
│   ├── appeal/
│   │   ├── parser.ts                  # Regex-based denial letter parser
│   │   ├── generator.ts               # AI + template package generator
│   │   └── strength.ts                # Appeal strength calculator (0–100)
│   └── clients/
│       ├── ai-provider.ts             # Nebius (OpenAI-compat) — null if no key
│       ├── tavily.ts                  # Web search + sources — demo fallback
│       ├── mem0.ts                    # Persistent memory — graceful skip
│       └── composio.ts                # Tool actions — demo mode
└── components/
    ├── AgentTimeline.tsx              # Animated step-by-step status
    ├── AgentReceipts.tsx              # Terminal-style sponsor proof panel
    ├── ResultsPanel.tsx               # Tabs + strength + memory
    └── SponsorBadges.tsx             # Sponsor info cards
```

---

## Current Limitations

- **Composio OAuth** not wired — Gmail/Drive/Calendar return demo responses
- **Nebius** API key not configured — templates used (still high quality)
- **PDF export** not implemented (out of scope)
- **File upload** not implemented — paste text only
- **Auth/users** not implemented — single-user local demo
- Disclaimer: not legal or medical advice

---

## Scripts

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint check
```
