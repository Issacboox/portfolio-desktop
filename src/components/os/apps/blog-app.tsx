"use client";

import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Copy, Info, Lightbulb, Lock, RotateCw, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { plannedPosts } from "@/content/profile";
import { postBySlug, posts, type Block, type Post } from "@/content/posts";

const slugify = (t: string) => "sec-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Safari-style window: a post list, and an artifact-style reader for each post. */
export function BlogApp({ props }: { props?: Record<string, string> }) {
  const [slug, setSlug] = useState<string | null>(props?.post ?? null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const post = slug ? postBySlug(slug) : undefined;

  function go(next: string | null) {
    setHistory((h) => [...h, slug]);
    setSlug(next);
    scroller.current?.scrollTo({ top: 0 });
  }
  function back() {
    if (!history.length) return;
    setSlug(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    scroller.current?.scrollTo({ top: 0 });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2 dark:border-white/5">
        <button onClick={back} disabled={!history.length} aria-label="Back" className="rounded p-0.5 text-zinc-500 enabled:hover:bg-black/5 disabled:opacity-30 dark:enabled:hover:bg-white/10">
          <ChevronLeft className="size-4" />
        </button>
        <ChevronRight className="size-4 text-zinc-300 dark:text-zinc-600" />
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1.5 truncate rounded-lg bg-black/[0.05] px-3 py-1 text-xs text-zinc-500 dark:bg-white/10">
          <Lock className="size-3 shrink-0" /> nurarat.dev/blog{post ? `/${post.slug}` : ""}
        </div>
        <button onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top" className="rounded p-0.5 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10">
          <RotateCw className="size-3.5" />
        </button>
      </div>
      <div ref={scroller} className="@container relative flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
        {post ? <Article post={post} scroller={scroller} onOpen={go} /> : <Index onOpen={go} />}
      </div>
    </div>
  );
}

function Index({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase">Blog</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Notes on building things</h1>
      <p className="mt-3 text-zinc-500">What I&apos;ve learned about .NET, the web, AI and shipping products, written the way I&apos;d explain it to a teammate.</p>

      <div className="mt-8 grid gap-4 @xl:grid-cols-2">
        {posts.map((p) => (
          <button
            key={p.slug}
            onClick={() => onOpen(p.slug)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-zinc-50 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className={`h-1.5 bg-gradient-to-r ${p.accent}`} />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
                <span className={`rounded-full bg-gradient-to-r ${p.accent} px-2 py-0.5 text-white`}>{p.tag}</span>
                <span>{p.date}</span>·<span>{p.minutes} min read</span>
              </div>
              <p className="mt-3 text-lg leading-snug font-semibold">{p.title}</p>
              <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500">{p.summary}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-orange-600 dark:text-orange-400">
                Read <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-semibold text-zinc-500">On my writing list</h2>
      <ul className="mt-2 divide-y divide-black/5 dark:divide-white/10">
        {plannedPosts.map((p) => (
          <li key={p.title} className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="font-medium leading-snug">{p.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{p.tag}</p>
            </div>
            <span className="mt-0.5 shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/10">Coming soon</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Article({ post, scroller, onOpen }: { post: Post; scroller: React.RefObject<HTMLDivElement | null>; onOpen: (slug: string) => void }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const toc = post.blocks.filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2");
  const next = posts[(posts.indexOf(post) + 1) % posts.length];

  // Reading progress bar + highlight the section you're in.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 0);
      let current: string | null = null;
      for (const h of toc) {
        const node = el.querySelector<HTMLElement>(`#${slugify(h.text)}`);
        if (node && node.offsetTop - el.scrollTop < 120) current = h.text;
      }
      setActive(current);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scroller, toc]);

  const jump = (text: string) => {
    const el = scroller.current;
    const node = el?.querySelector<HTMLElement>(`#${slugify(text)}`);
    if (el && node) el.scrollTo({ top: node.offsetTop - 16, behavior: "smooth" });
  };

  return (
    <>
      <div className="sticky top-0 z-10 h-0.5 bg-transparent">
        <div className={`h-full bg-gradient-to-r ${post.accent} transition-[width] duration-100`} style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10">
        <article className="min-w-0 flex-1 select-text">
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className={`rounded-full bg-gradient-to-r ${post.accent} px-2.5 py-0.5 font-semibold text-white`}>{post.tag}</span>
              <span>{post.date}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {post.minutes} min read
              </span>
            </div>
            <h1 className="mt-3 text-[clamp(1.6rem,4cqw,2.4rem)] leading-tight font-semibold tracking-tight text-balance">{post.title}</h1>
            <p className="mt-3 text-[15px] text-zinc-500">{post.summary}</p>
          </header>
          <div className="space-y-5">
            {post.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
          <button
            onClick={() => onOpen(next.slug)}
            className="group mt-12 flex w-full items-center justify-between gap-4 rounded-2xl border border-black/5 bg-zinc-50 p-5 text-left transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
          >
            <span>
              <span className="block text-xs text-zinc-500">Next post</span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1" />
          </button>
        </article>

        {toc.length ? (
          <aside className="hidden w-52 shrink-0 @4xl:block">
            <nav className="sticky top-6" aria-label="On this page">
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">On this page</p>
              <ul className="space-y-1 border-l border-black/10 dark:border-white/10">
                {toc.map((h) => (
                  <li key={h.text}>
                    <button
                      onClick={() => jump(h.text)}
                      className={`-ml-px block border-l-2 py-0.5 pl-3 text-left text-[13px] leading-snug transition-colors ${
                        active === h.text ? "border-orange-500 font-medium text-zinc-900 dark:text-white" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}
      </div>
    </>
  );
}

const prose = "text-[15px] leading-[1.75] text-zinc-700 dark:text-zinc-300";

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "p":
      return <p className={prose}>{b.text}</p>;
    case "h2":
      return (
        <h2 id={slugify(b.text)} className="scroll-mt-4 pt-4 text-[22px] font-semibold tracking-tight">
          {b.text}
        </h2>
      );
    case "h3":
      return <h3 className="pt-2 text-lg font-semibold">{b.text}</h3>;
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className={`space-y-2 ${prose}`}>
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              {b.ordered ? (
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold dark:bg-white/10">{i + 1}</span>
              ) : (
                <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-orange-500" />
              )}
              <span>{it}</span>
            </li>
          ))}
        </Tag>
      );
    }
    case "code":
      return <CodeBlock lang={b.lang} code={b.code} caption={b.caption} />;
    case "callout": {
      const tone = {
        tip: { icon: Lightbulb, cls: "border-emerald-500/25 bg-emerald-500/[0.07]", ic: "text-emerald-600 dark:text-emerald-400" },
        note: { icon: Info, cls: "border-sky-500/25 bg-sky-500/[0.07]", ic: "text-sky-600 dark:text-sky-400" },
        warn: { icon: TriangleAlert, cls: "border-amber-500/30 bg-amber-500/[0.08]", ic: "text-amber-600 dark:text-amber-400" },
      }[b.tone];
      return (
        <div className={`flex gap-3 rounded-xl border p-4 ${tone.cls}`}>
          <tone.icon className={`mt-0.5 size-5 shrink-0 ${tone.ic}`} />
          <div className="text-[14px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {b.title ? <p className="mb-0.5 font-semibold text-zinc-900 dark:text-white">{b.title}</p> : null}
            <p>{b.text}</p>
          </div>
        </div>
      );
    }
    case "flow":
      return (
        <figure className="rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <ol className="flex flex-col items-stretch gap-2 @2xl:flex-row @2xl:items-center">
            {b.steps.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center gap-2 @2xl:flex-1 @2xl:flex-row">
                <div className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
                  <p className="text-[13px] font-semibold">{s.title}</p>
                  {s.body ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{s.body}</p> : null}
                </div>
                {i < b.steps.length - 1 ? (
                  <span aria-hidden className="text-zinc-400">
                    <span className="@2xl:hidden">↓</span>
                    <span className="hidden @2xl:inline">→</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          {b.caption ? <figcaption className="mt-3 text-center text-xs text-zinc-500">{b.caption}</figcaption> : null}
        </figure>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-zinc-50 dark:bg-white/[0.04]">
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={`px-3 py-2 align-top leading-relaxed ${j === 0 ? "font-medium" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function CodeBlock({ lang, code, caption }: { lang: string; code: string; caption?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <figure className="overflow-hidden rounded-xl border border-black/10 bg-zinc-950 text-zinc-100 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-zinc-400 uppercase">{lang}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-zinc-400 transition hover:bg-white/10 hover:text-white">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed select-text">
        <code>
          {code.split("\n").map((line, i) => (
            <span key={i} className={`block ${/^\s*(\/\/|#(?!\s*\w+:)|--)/.test(line) ? "text-zinc-500" : ""}`}>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
      {caption ? <figcaption className="border-t border-white/10 px-4 py-2 text-xs text-zinc-400">{caption}</figcaption> : null}
    </figure>
  );
}
