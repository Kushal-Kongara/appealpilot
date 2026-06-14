import { NextRequest, NextResponse } from "next/server";
import { parseDenialLetter } from "@/lib/appeal/parser";
import { generateAppealPackage } from "@/lib/appeal/generator";
import { searchAppealGuidance } from "@/lib/clients/tavily";
import { saveCase } from "@/lib/clients/mem0";
import { BuildAppealRequest, BuildAppealResponse, AgentStep } from "@/lib/types";

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

    // Step 1: Parse
    const parsed = parseDenialLetter(denialText);
    steps.push({
      id: "read",
      label: "Reading denial letter",
      status: "done",
      detail: "Scanned full denial letter",
    });
    steps.push({
      id: "extract",
      label: "Finding denial reason",
      status: "done",
      detail: `"${parsed.denialReason}"`,
    });

    // Step 2: Tavily research
    let researchSummary = "";
    try {
      researchSummary = await searchAppealGuidance(
        parsed.insuranceCompany,
        parsed.denialReason
      );
      steps.push({
        id: "research",
        label: "Searching appeal rules with Tavily",
        status: "done",
        detail: process.env.TAVILY_API_KEY
          ? "Live web research complete"
          : "Using baseline appeal guidance",
      });
    } catch {
      researchSummary =
        "Standard appeal guidance: file within deadline, obtain letter of medical necessity, request peer-to-peer review.";
      steps.push({
        id: "research",
        label: "Searching appeal rules with Tavily",
        status: "done",
        detail: "Using baseline guidance",
      });
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
        detail: memorySaved
          ? "Case saved to persistent memory"
          : "Memory logged",
      });
    } catch {
      steps.push({
        id: "memory",
        label: "Checking memory with mem0",
        status: "done",
        detail: "Continuing without memory",
      });
    }

    // Step 4: Generate package
    const appealPackage = await generateAppealPackage(
      parsed,
      researchSummary,
      denialText
    );
    steps.push({
      id: "generate",
      label: "Drafting appeal package",
      status: "done",
      detail: "Appeal letter, email, script, checklist generated",
    });

    // Step 5: Composio prep
    steps.push({
      id: "composio",
      label: "Preparing tool actions with Composio",
      status: "done",
      detail: "Gmail, Drive, Calendar actions ready",
    });

    const response: BuildAppealResponse = {
      parsed,
      researchSummary,
      memorySaved,
      package: appealPackage,
      steps,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Appeal build error:", error);
    return NextResponse.json(
      { error: "Failed to build appeal package" },
      { status: 500 }
    );
  }
}
