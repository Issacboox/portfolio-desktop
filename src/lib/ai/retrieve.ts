import "server-only";
import type { Chunk } from "./knowledge";

// BM25 keyword search: no embeddings, no vector database, no cost. It works well for a
// personal knowledge base of a few hundred passages.

const STOP = new Set(
  "a an and are as at be by can do does for from has have her his how i in is it its me my of on or she so that the their them they this to was what when where which who why will with you your about".split(
    " ",
  ),
);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[^\p{L}\p{N}#+.]+/u)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t));

type Index = { docs: { chunk: Chunk; tf: Map<string, number>; len: number }[]; df: Map<string, number>; avg: number };
let index: Index | null = null;
let indexedFor: Chunk[] | null = null;

function build(chunks: Chunk[]): Index {
  const df = new Map<string, number>();
  const docs = chunks.map((chunk) => {
    const toks = tokens(`${chunk.source} ${chunk.section ?? ""} ${chunk.text}`);
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return { chunk, tf, len: toks.length };
  });
  return { docs, df, avg: docs.reduce((a, d) => a + d.len, 0) / Math.max(1, docs.length) };
}

/** Top-k passages for a question. Falls back to the core profile when little matches (e.g. Thai text). */
export function retrieve(chunks: Chunk[], question: string, k = 6): Chunk[] {
  if (indexedFor !== chunks || !index) {
    index = build(chunks);
    indexedFor = chunks;
  }
  const { docs, df, avg } = index;
  const q = [...new Set(tokens(question))];
  const N = docs.length;
  const k1 = 1.4;
  const b = 0.75;
  const scored = docs
    .map((d) => {
      let s = 0;
      for (const t of q) {
        const f = d.tf.get(t);
        if (!f) continue;
        const n = df.get(t) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avg)));
      }
      return { chunk: d.chunk, s };
    })
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, k)
    .map((x) => x.chunk);

  if (scored.length >= 3) return scored;
  // Little matched: add the essentials so the model can still give a grounded answer.
  const core = chunks.filter((c) => ["profile", "focus", "work", "skills"].includes(c.id) || c.id.startsWith("exp:"));
  return [...scored, ...core.filter((c) => !scored.includes(c))].slice(0, k + 3);
}
