import { DenialInfo } from "../types";

export function parseDenialLetter(text: string): DenialInfo {
  const lower = text.toLowerCase();

  // Extract insurance company
  const knownInsurers =
    /\b(Aetna|Cigna|Humana|UnitedHealth|United Health|UnitedHealthcare|Kaiser|Anthem|BlueCross|Blue Cross|BCBS|Molina|Centene|Elevance|Oscar|Bright Health|Ambetter|Magellan|Tricare|Medicare|Medicaid)\b/i;
  const insurerMatch = text.match(knownInsurers);
  const insuranceCompany = insurerMatch
    ? insurerMatch[1]
    : "Your Health Insurance Provider";

  // Extract denial reason
  let denialReason = "Not medically necessary";
  if (
    lower.includes("not medically necessary") ||
    lower.includes("not considered medically necessary")
  ) {
    denialReason = "Not medically necessary";
  } else if (
    lower.includes("experimental") ||
    lower.includes("investigational")
  ) {
    denialReason = "Experimental or investigational treatment";
  } else if (
    lower.includes("prior authorization") ||
    lower.includes("pre-authorization") ||
    lower.includes("preauthorization")
  ) {
    denialReason = "Lack of prior authorization";
  } else if (
    lower.includes("out of network") ||
    lower.includes("out-of-network")
  ) {
    denialReason = "Out-of-network provider";
  } else if (lower.includes("not a covered benefit") || lower.includes("benefit exclusion")) {
    denialReason = "Not a covered benefit";
  } else if (lower.includes("duplicate claim")) {
    denialReason = "Duplicate claim";
  } else if (lower.includes("step therapy") || lower.includes("fail first")) {
    denialReason = "Step therapy/fail-first requirement";
  } else {
    const reasonMatch = text.match(
      /denied?\s+(?:because|as|since)\s+(?:it\s+is\s+)?(.{10,120}?)(?:\.|$)/i
    );
    if (reasonMatch) {
      denialReason = reasonMatch[1].trim();
    }
  }

  // Extract appeal deadline
  let appealDeadline = "60 days from denial date";
  const deadlinePatterns = [
    /(?:appeal|file\s+an\s+appeal)\s+(?:this\s+decision\s+)?within\s+(\d+\s+(?:calendar\s+)?days?)/i,
    /within\s+(\d+\s+days?)\s+(?:of|from|to)/i,
    /(\d+)[\s-]day\s+(?:appeal|window|period)/i,
    /(?:deadline|due\s+date)[:\s]+([A-Za-z]+ \d+,?\s+\d{4}|\d{2}\/\d{2}\/\d{4})/i,
  ];
  for (const pattern of deadlinePatterns) {
    const m = text.match(pattern);
    if (m) {
      appealDeadline = m[1].trim();
      if (/^\d+$/.test(appealDeadline)) appealDeadline += " days from denial date";
      break;
    }
  }

  // Extract treatment/service
  let treatment = "";

  // Try specific condition extraction first
  const conditions = [
    "psoriasis", "rheumatoid arthritis", "multiple sclerosis", "crohn's disease",
    "diabetes", "cancer", "chemotherapy", "immunotherapy", "biologics",
    "asthma", "hypertension", "physical therapy", "mental health", "psychiatric",
    "surgery", "MRI", "CT scan",
  ];
  for (const c of conditions) {
    if (lower.includes(c)) {
      treatment = `continued treatment for ${c}`;
      break;
    }
  }

  // Try regex patterns if no condition matched
  if (!treatment) {
    const treatmentPatterns = [
      // "request for continued treatment for X" — stop at first period
      /request\s+for\s+(?:continued\s+treatment\s+for\s+|coverage\s+of\s+|authorization\s+(?:of|for)\s+)?([^.]{3,60})(?:\s+(?:is|was|has been)\s+(?:denied|not\s+approved))/i,
      /treatment\s+for\s+([a-zA-Z0-9 ,\-]{3,50})(?:\.|,|\s+(?:is|was)\s+denied)/i,
      /service\s+(?:of\s+|for\s+)?([a-zA-Z0-9 ,\-]{3,50})(?:\s+(?:is|was)\s+denied|\.|,)/i,
      /claim\s+for\s+([a-zA-Z0-9 ,\-]{3,50})(?:\s+(?:is|was)\s+denied|\.|,)/i,
    ];
    for (const pattern of treatmentPatterns) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const candidate = m[1].trim().replace(/\s+/g, " ");
        if (candidate.length > 2 && candidate.length < 80) {
          treatment = candidate;
          break;
        }
      }
    }
  }

  if (!treatment) treatment = "the requested medical service";

  // Extract required documents
  const requiredDocuments: string[] = [];
  const docSectionMatch = text.match(
    /(?:please include|you must include|you must submit|you must provide|required documents?|attach)[:\s](.+)/i
  );
  const docSection = docSectionMatch?.[1]?.split("\n\n")[0];

  if (docSection) {
    const items = docSection
      .split(/[,\n]|and\s+(?:any\s+)?/)
      .map((s) => s.replace(/^\s*[-•*]\s*/, "").trim())
      .filter((s) => s.length > 3 && s.length < 150);
    requiredDocuments.push(...items);
  }

  if (lower.includes("medical record") && !requiredDocuments.some(d => d.toLowerCase().includes("medical record")))
    requiredDocuments.push("Medical records");
  if ((lower.includes("physician note") || lower.includes("doctor note")) && requiredDocuments.length === 0)
    requiredDocuments.push("Physician notes");
  if (lower.includes("previous treatment") || lower.includes("prior treatment"))
    requiredDocuments.push("Documentation of previous treatments");
  if (lower.includes("lab result") || lower.includes("lab report"))
    requiredDocuments.push("Laboratory results");

  if (requiredDocuments.length === 0) {
    requiredDocuments.push(
      "Medical records from treating physician",
      "Letter of medical necessity",
      "Relevant diagnostic test results",
      "Treatment history documentation"
    );
  }

  return {
    insuranceCompany,
    denialReason,
    appealDeadline,
    treatment,
    requiredDocuments: [...new Set(requiredDocuments)].filter(Boolean),
  };
}
