export async function searchAppealGuidance(
  insurer: string,
  denialReason: string
): Promise<string> {
  const key = process.env.TAVILY_API_KEY;

  if (!key) return getDemoResearch(insurer, denialReason);

  try {
    const query = `${insurer} health insurance appeal "${denialReason}" how to win`;

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

    if (!res.ok) return getDemoResearch(insurer, denialReason);

    const data = await res.json();
    const answer: string = data.answer || "";
    const snippets: string = (
      data.results?.slice(0, 3) as Array<{ title: string; content: string }>
    )
      ?.map((r) => `• ${r.title}: ${r.content?.slice(0, 200)}`)
      .join("\n") || "";

    return answer || snippets || getDemoResearch(insurer, denialReason);
  } catch {
    return getDemoResearch(insurer, denialReason);
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
