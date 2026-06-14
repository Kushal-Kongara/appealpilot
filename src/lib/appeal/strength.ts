import { DenialInfo, AppealStrength, StrengthFactor, StrengthLabel } from "../types";

export function calculateAppealStrength(
  parsed: DenialInfo,
  denialText: string
): AppealStrength {
  const lower = denialText.toLowerCase();

  const factors: StrengthFactor[] = [
    {
      name: "Denial reason identified",
      present: parsed.denialReason.length > 3,
      impact: 10,
    },
    {
      name: "Appeal deadline specified",
      present: /\d+/.test(parsed.appealDeadline),
      impact: 15,
    },
    {
      name: "Insurance company named",
      present: parsed.insuranceCompany !== "Your Health Insurance Provider",
      impact: 15,
    },
    {
      name: "Medical records mentioned",
      present:
        lower.includes("medical record") ||
        lower.includes("clinical record") ||
        lower.includes("health record"),
      impact: 20,
    },
    {
      name: "Physician documentation available",
      present:
        lower.includes("physician") ||
        lower.includes("doctor") ||
        lower.includes("provider note") ||
        lower.includes("clinical note"),
      impact: 20,
    },
    {
      name: "Prior treatment history referenced",
      present:
        lower.includes("previous treatment") ||
        lower.includes("prior treatment") ||
        lower.includes("tried") ||
        lower.includes("history") ||
        lower.includes("conservative"),
      impact: 20,
    },
  ];

  const score = Math.min(
    100,
    factors.filter((f) => f.present).reduce((sum, f) => sum + f.impact, 0)
  );

  let label: StrengthLabel;
  if (score >= 80) label = "Strong";
  else if (score >= 60) label = "Good";
  else if (score >= 40) label = "Fair";
  else label = "Weak";

  const missingFactorMessages: Record<string, string> = {
    "Denial reason identified":
      "Locate the specific denial reason code in your Explanation of Benefits (EOB)",
    "Appeal deadline specified":
      "Find the exact appeal deadline in your denial letter — deadlines are strict",
    "Insurance company named":
      "Identify the insurer name — look at your insurance card or plan documents",
    "Medical records mentioned":
      "Gather complete medical records from your treating physician",
    "Physician documentation available":
      "Obtain a signed Letter of Medical Necessity from your treating physician",
    "Prior treatment history referenced":
      "Document all prior treatments tried and their outcomes — essential for step-therapy denials",
  };

  const missingEvidence = factors
    .filter((f) => !f.present)
    .map((f) => missingFactorMessages[f.name] ?? f.name);

  const improvements: string[] = [
    "Request a peer-to-peer review between your physician and the insurer's medical director",
    "Cite specific clinical guidelines (AAD, ACR, AHA) that support your treatment",
    "Include 2–3 peer-reviewed studies validating the medical necessity of your treatment",
    score < 80
      ? "Collect missing documentation before filing — each gap weakens your position"
      : "Strong case — submit promptly before your deadline",
  ];

  return { score, label, factors, missingEvidence, improvements };
}
