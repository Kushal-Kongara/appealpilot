# AppealPilot

> AI-powered agent that turns confusing health insurance denial letters into a complete, professional appeal package — in seconds.

Built for hackathon demo. Powered by Tavily, mem0, Composio, and Nebius.

## What It Does

1. **Paste** your insurance denial letter
2. **AI agent** extracts key info (insurer, denial reason, deadline, required documents)
3. **Tavily** searches real-time appeal rules and insurer-specific guidance
4. **mem0** saves your case to persistent memory for future reference
5. **Generator** drafts: appeal letter, email draft, phone script, document checklist, next steps
6. **Composio** prepares one-click actions: Gmail draft, Drive folder, Calendar reminder

## Sponsor Stack

| Sponsor | Role |
|---------|------|
| **Tavily** | Real-time web research on appeal rules and insurer policies |
| **mem0** | Persistent agent memory — stores each case for future sessions |
| **Composio** | Tool actions — Gmail, Google Drive, Google Calendar integration |
| **Nebius** | AI inference (OpenAI-compatible endpoint) — falls back to templates if key missing |

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# AI model / inference (optional — templates used as fallback)
NEBIUS_API_KEY=
NEBIUS_BASE_URL=
NEBIUS_MODEL=

# Web research (real-time appeal guidance)
TAVILY_API_KEY=

# Tool actions: Gmail, Drive, Calendar
COMPOSIO_API_KEY=

# Agent memory
MEM0_API_KEY=
```

The app works without any keys — all sponsors have graceful fallbacks for demo mode.

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Main UI — form, timeline, results
│   ├── api/appeal/build/         # POST: parse + research + generate
│   └── api/actions/composio/     # POST: Gmail / Drive / Calendar actions
├── lib/
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── appeal/
│   │   ├── parser.ts             # Extract info from denial letter
│   │   └── generator.ts          # Generate appeal package (AI + templates)
│   └── clients/
│       ├── ai-provider.ts        # Nebius (OpenAI-compatible) with null fallback
│       ├── tavily.ts             # Web search with demo fallback
│       ├── mem0.ts               # Persistent memory with graceful skip
│       └── composio.ts           # Tool actions with demo mode
└── components/
    ├── AgentTimeline.tsx         # Animated step-by-step agent activity
    ├── ResultsPanel.tsx          # Tabbed results + Composio buttons
    └── SponsorBadges.tsx         # Sponsor info cards
```

## Demo Flow

1. Click **"Try Sample Letter"** to load a psoriasis denial example
2. Click **"Build Appeal Package"** — watch the agent timeline animate
3. Review the generated: Summary → Appeal Letter → Email Draft → Phone Script → Checklist → Next Steps
4. Click Composio action buttons to simulate Gmail / Drive / Calendar integration

## Design

- Clean white/blue medical-trust theme
- Tailwind CSS + lucide-react icons
- Mobile responsive
- Animated agent timeline
- Tabbed document viewer with copy-to-clipboard
