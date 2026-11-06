import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { posts, type Block } from "@/content/posts";
import { focusAreas, languages, process as workProcess, profile, projects, skillGroups, timeline, workingStyle } from "@/content/profile";

/** One passage the AI can read and cite. */
export type Chunk = { id: string; source: string; section?: string; text: string };

const DOCS_DIR = path.join(process.cwd(), "src", "content", "docs");

function blockText(b: Block): string {
  switch (b.type) {
    case "p":
    case "h2":
    case "h3":
      return b.text;
    case "list":
      return b.items.map((i) => `- ${i}`).join("\n");
    case "code":
      return `${b.caption ?? "Code"} (${b.lang}):\n${b.code}`;
    case "callout":
      return `${b.title ? `${b.title}: ` : ""}${b.text}`;
    case "flow":
      return `${b.caption ? `${b.caption}: ` : ""}${b.steps.map((s) => `${s.title}${s.body ? ` (${s.body})` : ""}`).join(" → ")}`;
    case "table":
      return [b.head.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
  }
}

/** Split Markdown into passages at ## headings. */
function markdownChunks(file: string, raw: string): Chunk[] {
  const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file);
  const out: Chunk[] = [];
  raw.split(/^##\s+/m).forEach((part, i) => {
    if (i === 0) {
      const intro = part.replace(/^#\s+.+$/m, "").trim();
      if (intro) out.push({ id: `doc:${file}#0`, source: title, text: intro });
      return;
    }
    const [heading, ...rest] = part.split("\n");
    const text = rest.join("\n").trim();
    if (text) out.push({ id: `doc:${file}#${i}`, source: title, section: heading.trim(), text });
  });
  return out;
}

function docChunks(): Chunk[] {
  try {
    return readdirSync(DOCS_DIR)
      .filter((f) => /\.(md|txt)$/i.test(f) && f.toLowerCase() !== "readme.md")
      .flatMap((f) => markdownChunks(f, readFileSync(path.join(DOCS_DIR, f), "utf8")));
  } catch {
    return [];
  }
}

function siteChunks(): Chunk[] {
  const c: Chunk[] = [];
  c.push({
    id: "profile",
    source: "About me",
    text: `${profile.name} (also called Maru) is a ${profile.role} based in ${profile.location}. ${profile.headline} ${profile.availability}. ${profile.relocation} Languages: ${languages.join(", ")}. Email ${profile.email}, GitHub ${profile.github}, LinkedIn ${profile.linkedin}.`,
  });
  c.push({ id: "focus", source: "About me", section: "Focus areas", text: focusAreas.map((f) => `${f.title}: ${f.body}`).join("\n") });
  for (const t of timeline) {
    c.push({
      id: `exp:${t.org}`,
      source: "Experience",
      section: t.org,
      text: `${t.period}: ${t.title} at ${t.org}. ${t.body}${t.points ? `\n${t.points.map((p) => `- ${p}`).join("\n")}` : ""}`,
    });
  }
  c.push({ id: "skills", source: "Skills & stack", text: skillGroups.map((g) => `${g.title}: ${g.items.join(", ")}`).join("\n") });
  c.push({
    id: "work",
    source: "How I work",
    text: `${workProcess.map((p, i) => `${i + 1}. ${p.step}: ${p.body}`).join("\n")}\n${workingStyle.map((w) => `${w.title}: ${w.body}`).join("\n")}`,
  });
  for (const p of projects) {
    c.push({
      id: `project:${p.slug}`,
      source: "Projects",
      section: p.title,
      text: `${p.title} [${p.status}]. ${p.summary} Stack: ${p.stack.join(", ")}.${p.url ? ` Live at ${p.url}.` : ""}`,
    });
  }
  // Blog posts: one passage per section so citations point at the right part.
  for (const post of posts) {
    let section = "Introduction";
    let buf: string[] = [];
    let n = 0;
    const flush = () => {
      if (buf.length) c.push({ id: `post:${post.slug}#${n++}`, source: `Blog: ${post.title}`, section, text: buf.join("\n") });
      buf = [];
    };
    for (const b of post.blocks) {
      if (b.type === "h2") {
        flush();
        section = b.text;
      } else buf.push(blockText(b));
    }
    flush();
  }
  return c;
}

let cache: Chunk[] | null = null;
/** All passages, built once per server instance. */
export function knowledge(): Chunk[] {
  cache ??= [...siteChunks(), ...docChunks()];
  return cache;
}
