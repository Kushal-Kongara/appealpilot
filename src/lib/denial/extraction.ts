export interface DenialSignals {
  denialReason: string | null;
  deadline: string | null;
  claimNumber: string | null;
  insurer: string | null;
  deniedService: string | null;
}

const KNOWN_INSURERS = [
  "BlueCross BlueShield",
  "Blue Cross Blue Shield",
  "BlueCross",
  "Aetna",
  "Cigna",
  "United Healthcare",
  "UnitedHealthcare",
  "Humana",
  "Kaiser",
  "Anthem",
  "Molina",
  "Centene",
];

export function extractSignals(text: string): DenialSignals {
  const lower = text.toLowerCase();

  // Denial reason — priority order
  let denialReason: string | null = null;
  if (lower.includes("not medically necessary") || lower.includes("not considered medically necessary")) {
    denialReason = "Not medically necessary";
  } else if (lower.includes("prior authorization") || lower.includes("prior auth")) {
    denialReason = "Prior authorization required";
  } else if (lower.includes("out of network") || lower.includes("out-of-network")) {
    denialReason = "Out of network";
  } else if (lower.includes("experimental") || lower.includes("investigational")) {
    denialReason = "Experimental / investigational";
  } else if (lower.includes("not covered") || lower.includes("excluded benefit")) {
    denialReason = "Not covered / excluded benefit";
  } else if (lower.includes("insufficient documentation")) {
    denialReason = "Insufficient documentation";
  }

  // Deadline — try "within X days" first, then bare "X days"
  let deadline: string | null = null;
  const withinMatch = text.match(/within\s+(\d+)\s+days?/i);
  const bareMatch = text.match(/(\d+)\s+days?\s+(?:from|of|to)/i) ?? text.match(/(\d+)[- ]day\s+appeal/i);
  const anyDaysMatch = text.match(/(\d+)\s+days?/i);
  if (withinMatch) {
    deadline = `${withinMatch[1]} days`;
  } else if (bareMatch) {
    deadline = `${bareMatch[1]} days`;
  } else if (anyDaysMatch) {
    deadline = `${anyDaysMatch[1]} days`;
  }

  // Claim number
  let claimNumber: string | null = null;
  const claimMatch = text.match(/claim\s+(?:number|#|no\.?)[:\s]*([A-Z0-9\-]{4,20})/i);
  if (claimMatch) claimNumber = claimMatch[1];

  // Insurer — check known names
  let insurer: string | null = null;
  for (const name of KNOWN_INSURERS) {
    if (text.toLowerCase().includes(name.toLowerCase())) {
      insurer = name;
      break;
    }
  }

  // Denied service
  let deniedService: string | null = null;
  const serviceMatch = text.match(
    /(?:request for|claim for|coverage for|treatment for|request for (?:continued )?)\s+([^.]{3,50})/i
  );
  if (serviceMatch) {
    deniedService = serviceMatch[1].trim().replace(/\s+/g, " ");
    // Cap at first comma or parenthesis
    deniedService = deniedService.split(/[,(]/)[0].trim();
    if (deniedService.length > 60) deniedService = deniedService.slice(0, 57) + "…";
  }

  return { denialReason, deadline, claimNumber, insurer, deniedService };
}
