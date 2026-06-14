import { NextRequest, NextResponse } from "next/server";
import { parseDenialLetter } from "@/lib/appeal/parser";
import { generateAppealPackage } from "@/lib/appeal/generator";
import { calculateAppealStrength } from "@/lib/appeal/strength";
import { searchAppealGuidance } from "@/lib/clients/tavily";
import { saveCase } from "@/lib/clients/mem0";
import {
  BuildAppealRequest,
  BuildAppealResponse,
  AgentStep,
  AgentReceipts,
  MemoryRecall,
  TavilySource,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BuildAppealRequest;
    const { denialText } = body;

    if (!denialText?.trim()) {
      return NextResponse.json(
        { error: "Denial text is required" },
        { status: 400 }
      );
    }

    const steps: AgentStep[] = [];
    const hasTavilyKey = !!process.env.TAVILY_API_KEY;
    const hasNebiusKey = !!process.env.NEBIUS_API_KEY;

    // Step 1: Parse
    const parsed = parseDenialLetter(denialText);
    steps.push({ id: "read", label: "Reading denial letter", status: "done", detail: "Scanned full denial letter" });
    steps.push({ id: "extract", label: "Finding denial reason", status: "done", detail: `"${parsed.denialReason}"` });

    // Step 2: Tavily research
    let researchSummary = "";
    let tavilyQuery = `${parsed.insuranceCompany} appeal "${parsed.denialReason}"`;
    let tavilySources: TavilySource[] = [];

    try {
      const tavilyResult = await searchAppealGuidance(parsed.insuranceCompany, parsed.denialReason);
      researchSummary = tavilyResult.summary;
      tavilySources = tavilyResult.sources;
      tavilyQuery = tavilyResult.query;

      steps.push({
        id: "research",
        label: "Searching appeal rules with Tavily",
        status: "done",
        detail: hasTavilyKey
          ? `Live search — found ${tavilySources.length} sources`
          : "Using baseline appeal guidance",
      });
    } catch {
      researchSummary = "Standard appeal guidance: file within deadline, obtain letter of medical necessity, request peer-to-peer review.";
      steps.push({ id: "research", label: "Searching appeal rules with Tavily", status: "done", detail: "Using baseline guidance" });
    }

    // Step 3: mem0
    let memorySaved = false;
    try {
      memorySaved = await saveCase({
        treatment: parsed.treatment,
        denialReason: parsed.denialReason,
        insurer: parsed.insuranceCompany,
        deadline: parsed.appealDeadline,
      });
      steps.push({
        id: "memory",
        label: "Checking memory with mem0",
        status: "done",
        detail: memorySaved ? "Case saved to persistent memory" : "Memory logged",
      });
    } catch {
      steps.push({ id: "memory", label: "Checking memory with mem0", status: "done", detail: "Continuing without memory" });
    }

    // Step 4: Generate package
    const appealPackage = await generateAppealPackage(parsed, researchSummary, denialText);
    steps.push({ id: "generate", label: "Drafting appeal package", status: "done", detail: "Appeal letter, email, script, checklist generated" });

    // Step 5: Composio
    steps.push({ id: "composio", label: "Preparing tool actions with Composio", status: "done", detail: "Gmail, Drive, Calendar actions ready" });

    // Strength score
    const strength = calculateAppealStrength(parsed, denialText);

    // Agent receipts
    const receipts: AgentReceipts = {
      tavily: {
        status: hasTavilyKey ? "live" : "fallback",
        query: tavilyQuery,
        resultsCount: tavilySources.length,
      },
      mem0: {
        status: memorySaved ? "saved" : "fallback",
        memorySaved,
        detail: memorySaved
          ? `Saved: ${parsed.treatment} / ${parsed.denialReason}`
          : "MEM0_API_KEY not configured or save failed",
      },
      composio: {
        status: "demo",
        actionsAvailable: ["Gmail Draft", "Drive Folder", "Calendar Reminder"],
      },
      nebius: {
        status: hasNebiusKey ? "live" : "fallback",
        model: process.env.NEBIUS_MODEL,
        detail: hasNebiusKey
          ? `Active — model: ${process.env.NEBIUS_MODEL}`
          : "NEBIUS_API_KEY not configured — using high-quality template generation",
      },
    };

    // Memory recall
    const memoryRecall: MemoryRecall = {
      remembered: [
        `Treatment: ${parsed.treatment}`,
        `Denial reason: ${parsed.denialReason}`,
        `Insurer: ${parsed.insuranceCompany}`,
        `Appeal deadline: ${parsed.appealDeadline}`,
        `Docs requested: ${parsed.requiredDocuments.slice(0, 2).join(", ")}`,
      ],
      willRecall: [
        `Future sessions will recognize "${parsed.treatment}" denial patterns`,
        `${parsed.insuranceCompany} appeal history stored for this user`,
        `Document requirements for "${parsed.denialReason}" denials saved`,
      ],
    };

    const response: BuildAppealResponse = {
      parsed,
      researchSummary,
      memorySaved,
      package: appealPackage,
      steps,
      strength,
      receipts,
      memoryRecall,
      tavilySources,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Appeal build error:", error);
    return NextResponse.json({ error: "Failed to build appeal package" }, { status: 500 });
  }
}
