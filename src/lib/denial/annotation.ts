export type HighlightColor = "red" | "yellow" | "green" | "none";

export interface TokenSpan {
  text: string;
  color: HighlightColor;
}

interface Pattern {
  regex: RegExp;
  color: HighlightColor;
}

const PATTERNS: Pattern[] = [
  // Red — denial triggers
  { regex: /not medically necessary/gi, color: "red" },
  { regex: /experimental/gi, color: "red" },
  { regex: /investigational/gi, color: "red" },
  { regex: /not covered/gi, color: "red" },
  { regex: /prior authorization required/gi, color: "red" },
  { regex: /out[- ]of[- ]network/gi, color: "red" },
  { regex: /insufficient documentation/gi, color: "red" },
  { regex: /excluded benefit/gi, color: "red" },
  // Yellow — action / deadline markers
  { regex: /additional information/gi, color: "yellow" },
  { regex: /medical records/gi, color: "yellow" },
  { regex: /letter of medical necessity/gi, color: "yellow" },
  { regex: /\bappeal\b/gi, color: "yellow" },
  { regex: /180 days/gi, color: "yellow" },
  { regex: /\bdeadline\b/gi, color: "yellow" },
  { regex: /member responsibility/gi, color: "yellow" },
  { regex: /\d+\s+days?/gi, color: "yellow" },
  // Green — strength signals
  { regex: /physician documented/gi, color: "green" },
  { regex: /prior treatment/gi, color: "green" },
  { regex: /conservative treatment/gi, color: "green" },
  { regex: /clinical notes/gi, color: "green" },
  { regex: /\bdiagnosis\b/gi, color: "green" },
  { regex: /test results/gi, color: "green" },
  { regex: /physician.*?determined/gi, color: "green" },
  { regex: /physician.*?confirmed/gi, color: "green" },
];

interface Interval {
  start: number;
  end: number;
  color: HighlightColor;
}

export function annotateText(text: string): TokenSpan[] {
  const intervals: Interval[] = [];

  for (const { regex, color } of PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      intervals.push({ start: m.index, end: m.index + m[0].length, color });
    }
  }

  // Sort by start; on tie, longer match first
  intervals.sort((a, b) => a.start - b.start || b.end - a.end);

  // Merge: skip intervals that overlap with already-accepted ones
  const merged: Interval[] = [];
  let cursor = 0;
  for (const iv of intervals) {
    if (iv.start >= cursor) {
      merged.push(iv);
      cursor = iv.end;
    }
  }

  // Walk string and emit spans
  const spans: TokenSpan[] = [];
  let pos = 0;
  for (const iv of merged) {
    if (iv.start > pos) {
      spans.push({ text: text.slice(pos, iv.start), color: "none" });
    }
    spans.push({ text: text.slice(iv.start, iv.end), color: iv.color });
    pos = iv.end;
  }
  if (pos < text.length) {
    spans.push({ text: text.slice(pos), color: "none" });
  }

  return spans;
}
