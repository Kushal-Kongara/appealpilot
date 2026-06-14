export async function generateWithAI(prompt: string): Promise<string | null> {
  const key = process.env.NEBIUS_API_KEY;
  const baseUrl = process.env.NEBIUS_BASE_URL;
  const model = process.env.NEBIUS_MODEL;

  if (!key || !baseUrl || !model) return null;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.choices?.[0]?.message?.content as string) ?? null;
  } catch {
    return null;
  }
}
