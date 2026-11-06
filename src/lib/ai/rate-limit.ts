import "server-only";

// Simple in-memory limits. Each serverless instance keeps its own counters, so they're
// approximate, but they stop casual abuse from burning through the free AI quota.
// Tune with AI_LIMIT_PER_MINUTE, AI_LIMIT_PER_DAY (per visitor) and AI_LIMIT_GLOBAL_PER_DAY.

const perMinute = Number(process.env.AI_LIMIT_PER_MINUTE ?? 5);
const perDay = Number(process.env.AI_LIMIT_PER_DAY ?? 40);
const globalPerDay = Number(process.env.AI_LIMIT_GLOBAL_PER_DAY ?? 800);

const hits = new Map<string, number[]>();
let day = new Date().toISOString().slice(0, 10);
let globalCount = 0;

export function checkLimit(key: string): { ok: true } | { ok: false; retryAfter: number; reason: string } {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    globalCount = 0;
    hits.clear();
  }
  if (globalCount >= globalPerDay) return { ok: false, retryAfter: 3600, reason: "The AI has answered a lot of questions today. Please try again tomorrow." };

  const list = (hits.get(key) ?? []).filter((t) => now - t < 86_400_000);
  const lastMinute = list.filter((t) => now - t < 60_000);
  if (lastMinute.length >= perMinute) return { ok: false, retryAfter: Math.ceil((60_000 - (now - lastMinute[0])) / 1000), reason: "You're asking quickly! Please wait a moment." };
  if (list.length >= perDay) return { ok: false, retryAfter: 3600, reason: "You've reached today's question limit. Email me instead and I'll reply myself." };

  list.push(now);
  hits.set(key, list);
  globalCount++;
  // Keep memory bounded.
  if (hits.size > 5000) hits.delete(hits.keys().next().value!);
  return { ok: true };
}
