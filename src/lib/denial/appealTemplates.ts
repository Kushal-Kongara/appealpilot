export const WEAK_LETTER = `To Whom It May Concern,

I disagree with your decision to deny my claim. I believe this decision is incorrect and I am requesting that you reconsider.

Please review my case again.

Sincerely,
[Your Name]`;

export type HighlightType =
  | "medical-necessity"
  | "doc-reference"
  | "policy-request"
  | "clear-ask"
  | "deadline-aware";

export const TYPE_CLASSES: Record<HighlightType, string> = {
  "medical-necessity": "bg-emerald-100 text-emerald-900 rounded px-0.5",
  "doc-reference":     "bg-blue-100 text-blue-900 rounded px-0.5",
  "policy-request":    "bg-violet-100 text-violet-900 rounded px-0.5",
  "clear-ask":         "bg-amber-100 text-amber-900 rounded px-0.5",
  "deadline-aware":    "bg-red-100 text-red-900 rounded px-0.5",
};

export const TYPE_LABELS: Record<HighlightType, string> = {
  "medical-necessity": "Medical Necessity",
  "doc-reference":     "Documentation",
  "policy-request":    "Legal Rights",
  "clear-ask":         "Direct Appeal",
  "deadline-aware":    "Deadline Aware",
};

export const WHY_STRONGER: string[] = [
  "Cites medical necessity using clinical evidence — the #1 reason appeals succeed",
  "References specific documentation (medical records, letter of medical necessity)",
  "Invokes legal rights under the ACA and requests an Independent External Review",
  "Makes a direct, unambiguous appeal request with specific remedy asked for",
  "Acknowledges the deadline and requests expedited review when appropriate",
];

export interface HighlightSpan {
  text: string;
  type: HighlightType | "none";
}

interface TypedPattern {
  regex: RegExp;
  type: HighlightType;
}

const TYPED_PATTERNS: TypedPattern[] = [
  { regex: /medically necessary|clinical evidence|physician.*?determined|peer-reviewed|clinical.*?guideline/gi, type: "medical-necessity" },
  { regex: /medical records|letter of medical necessity|clinical notes|documentation|diagnostic/gi,             type: "doc-reference" },
  { regex: /affordable care act|\bACA\b|\bERISA\b|independent review|external.*?review|\bIRO\b|Department of Insurance/gi, type: "policy-request" },
  { regex: /I respectfully request|I request|please.*?approve|overturn.*?denial|approve coverage/gi,           type: "clear-ask" },
  { regex: /within \d+ days?|expedited review|72 hours|\bdeadline\b|appeal.*?deadline/gi,                      type: "deadline-aware" },
];

interface Interval {
  start: number;
  end: number;
  type: HighlightType;
}

export function buildHighlightSpans(text: string): HighlightSpan[] {
  const intervals: Interval[] = [];

  for (const { regex, type } of TYPED_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      intervals.push({ start: m.index, end: m.index + m[0].length, type });
    }
  }

  intervals.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: Interval[] = [];
  let cursor = 0;
  for (const iv of intervals) {
    if (iv.start >= cursor) {
      merged.push(iv);
      cursor = iv.end;
    }
  }

  const spans: HighlightSpan[] = [];
  let pos = 0;
  for (const iv of merged) {
    if (iv.start > pos) {
      spans.push({ text: text.slice(pos, iv.start), type: "none" });
    }
    spans.push({ text: text.slice(iv.start, iv.end), type: iv.type });
    pos = iv.end;
  }
  if (pos < text.length) {
    spans.push({ text: text.slice(pos), type: "none" });
  }

  return spans;
}
