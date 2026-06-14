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
  documentChecklist: string[];
  nextSteps: string[];
}

export interface AgentStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

export interface BuildAppealRequest {
  denialText: string;
}

export interface BuildAppealResponse {
  parsed: DenialInfo;
  researchSummary: string;
  memorySaved: boolean;
  package: AppealPackage;
  steps: AgentStep[];
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
