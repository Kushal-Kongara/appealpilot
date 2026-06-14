export interface DenialInfo {
  insuranceCompany: string;
  denialReason: string;
  appealDeadline: string;
  treatment: string;
  requiredDocuments: string[];
}

export interface AppealPackage {
  summary: string;
  appealLetter: string;
  emailDraft: string;
  phoneScript: string;
  callSimScript: string;
  documentChecklist: string[];
  nextSteps: string[];
}

export interface AgentStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

// --- New types ---

export interface TavilySource {
  title: string;
  snippet: string;
  url: string;
  isDemo?: boolean;
}

export interface TavilySearchResult {
  summary: string;
  sources: TavilySource[];
  query: string;
}

export interface StrengthFactor {
  name: string;
  present: boolean;
  impact: number;
}

export type StrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export interface AppealStrength {
  score: number;
  label: StrengthLabel;
  factors: StrengthFactor[];
  missingEvidence: string[];
  improvements: string[];
}

export interface AgentReceipts {
  tavily: {
    status: "live" | "fallback";
    query: string;
    resultsCount: number;
  };
  mem0: {
    status: "saved" | "fallback";
    memorySaved: boolean;
    detail: string;
  };
  composio: {
    status: "ready" | "demo";
    actionsAvailable: string[];
  };
  nebius: {
    status: "live" | "fallback";
    model?: string;
    detail: string;
  };
}

export interface MemoryRecall {
  remembered: string[];
  willRecall: string[];
}

// --- Request / Response ---

export interface BuildAppealRequest {
  denialText: string;
}

export interface BuildAppealResponse {
  parsed: DenialInfo;
  researchSummary: string;
  memorySaved: boolean;
  package: AppealPackage;
  steps: AgentStep[];
  strength: AppealStrength;
  receipts: AgentReceipts;
  memoryRecall: MemoryRecall;
  tavilySources: TavilySource[];
}

export interface ComposioActionRequest {
  action: "gmail_draft" | "drive_folder" | "calendar_reminder";
  data: Record<string, string>;
}

export interface ComposioActionResponse {
  status: "demo" | "success" | "error";
  message: string;
  actionId?: string;
}
