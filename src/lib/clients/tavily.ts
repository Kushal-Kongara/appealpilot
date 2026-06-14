import type { TavilySource, TavilySearchResult } from "../types";

const DEMO_SOURCES: TavilySource[] = [
  {
    title: "How to Appeal a Health Insurance Denial — HealthCare.gov",
    snippet:
      "You have the right to appeal any decision your health insurance plan makes to deny payment for a claim. Both internal and external appeals are available under the ACA.",
    url: "https://www.healthcare.gov/appeal-insurance-company-decision/",
    isDemo: true,
  },
  {
    title: "Consumer Assistance — CMS.gov",
    snippet:
      "Under the Affordable Care Act, insurers must allow you to appeal a coverage decision. You may request an expedited appeal (72 hours) for urgent medical situations.",
    url: "https://www.cms.gov/CCIIO/Programs-and-Initiatives/Consumer-Support-and-Information",
    isDemo: true,
  },
  {
    title: "How to Write an Effective Insurance Appeal — Patient Advocate Foundation",
    snippet:
      "An effective appeal letter cites specific clinical criteria, includes a Letter of Medical Necessity, and references relevant clinical practice guidelines from recognized medical associations.",
    url: "https://www.patientadvocate.org/explore-our-resources/dealing-with-insurance/",
    isDemo: true,
  },
];

export async function searchAppealGuidance(
  insurer: string,
  denialReason: string
): Promise<TavilySearchResult> {
  const key = process.env.TAVILY_API_KEY;
  const query = `${insurer} health insurance appeal "${denialReason}" how to win rights`;

  if (!key) {
    return {
      summary: getDemoResearch(insurer, denialReason),
      sources: DEMO_SOURCES,
      query,
    };
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      return { summary: getDemoResearch(insurer, denialReason), sources: DEMO_SOURCES, query };
    }

    const data = await res.json();
    const answer: string = (data.answer as string) || "";
    const rawResults = (data.results || []) as Array<{
      title: string;
      url: string;
      content: string;
    }>;

    const sources: TavilySource[] = rawResults.slice(0, 4).map((r) => ({
      title: r.title,
      snippet:
        (r.content?.slice(0, 220) ?? "") +
        (r.content?.length > 220 ? "..." : ""),
      url: r.url,
      isDemo: false,
    }));

    const snippets = rawResults
      .slice(0, 3)
      .map((r) => `• ${r.title}: ${r.content?.slice(0, 200)}`)
      .join("\n");

    const summary =
      answer || snippets || getDemoResearch(insurer, denialReason);

    return {
      summary,
      sources: sources.length > 0 ? sources : DEMO_SOURCES,
      query,
    };
  } catch {
    return {
      summary: getDemoResearch(insurer, denialReason),
      sources: DEMO_SOURCES,
      query,
    };
  }
}

function getDemoResearch(insurer: string, denialReason: string): string {
  return `Appeal research for ${insurer || "your insurer"} — denial reason: "${denialReason}":

• File your appeal within the deadline in the denial letter (typically 30–180 days under ACA)
• Request the specific clinical criteria used to deny the claim — insurers must provide this
• Obtain a detailed Letter of Medical Necessity from your treating physician
• Reference peer-reviewed literature that supports the medical necessity of the treatment
• If denied for "not medically necessary," escalate to an External Independent Review (IRO)
• Under the ACA, you have the right to an expedited appeal (72 hours) for urgent situations
• Request a peer-to-peer review between your doctor and the insurer's medical director
• Contact your state insurance commissioner if internal appeals are delayed or denied
• ERISA plans have additional federal appeal rights if your insurance is employer-sponsored`;
}
