import "server-only";

/**
 * Any OpenAI-compatible chat API. Pick a provider with env vars, no code changes:
 *
 *   Groq (default, free tier)  AI_BASE_URL=https://api.groq.com/openai/v1                        AI_MODEL=llama-3.3-70b-versatile
 *   Google Gemini (free tier)  AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai  AI_MODEL=gemini-2.5-flash
 *   Your own Ollama            AI_BASE_URL=https://<your-tunnel>/v1                                 AI_MODEL=qwen3:8b
 */
export const aiConfig = () => ({
  baseUrl: (process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, ""),
  apiKey: process.env.AI_API_KEY ?? "",
  model: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
});

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class LlmError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function chat(messages: ChatMessage[], { maxTokens = 600, signal }: { maxTokens?: number; signal?: AbortSignal } = {}) {
  const { baseUrl, apiKey, model } = aiConfig();
  if (!apiKey && !baseUrl.includes("localhost")) throw new LlmError("AI_API_KEY is not set", 503);

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.2 }),
    signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LlmError(`AI provider returned ${res.status}: ${detail.slice(0, 200)}`, res.status === 429 ? 429 : 502);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  // Reasoning models (qwen3 etc.) may wrap their thinking in <think> tags; drop it.
  const text = (data.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return { text, usage: data.usage, model };
}
