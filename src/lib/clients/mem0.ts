export async function saveCase(
  caseData: Record<string, string>
): Promise<boolean> {
  const key = process.env.MEM0_API_KEY;
  if (!key) return false;

  try {
    const res = await fetch("https://api.mem0.ai/v1/memories/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${key}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Insurance appeal case: treatment="${caseData.treatment}", denial="${caseData.denialReason}", insurer="${caseData.insurer}"`,
          },
        ],
        user_id: "appealpilot-user",
        metadata: { source: "appealpilot", ...caseData },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getRelatedCases(treatment: string): Promise<string> {
  const key = process.env.MEM0_API_KEY;
  if (!key) return "";

  try {
    const res = await fetch(
      `https://api.mem0.ai/v1/memories/search/?query=${encodeURIComponent(treatment)}&user_id=appealpilot-user`,
      { headers: { Authorization: `Token ${key}` } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const count = (data.memories as unknown[])?.length ?? 0;
    return count > 0 ? `Found ${count} related case(s) in memory.` : "";
  } catch {
    return "";
  }
}
