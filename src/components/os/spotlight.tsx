"use client";

import { CornerDownLeft, FileText, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { posts } from "@/content/posts";
import { projects, timeline } from "@/content/profile";
import { AppIcon } from "./app-icon";
import { apps } from "./apps";
import { useOS, type AppId } from "./os-context";

type Result = { key: string; group: string; title: string; subtitle?: string; app: AppId; props?: Record<string, string>; haystack: string };

export function Spotlight() {
  const os = useOS();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo<Result[]>(
    () => [
      ...apps.map((a) => ({ key: `app-${a.id}`, group: "Applications", title: a.title.split(" — ")[0], app: a.id, haystack: `${a.title} ${a.keywords}` })),
      ...projects.map((p) => ({ key: `p-${p.slug}`, group: "Projects", title: p.title, subtitle: p.summary, app: "projects" as AppId, haystack: `${p.title} ${p.summary} ${p.stack.join(" ")}` })),
      ...timeline.filter((t) => !t.next).map((t) => ({ key: `t-${t.org}`, group: "Experience", title: t.org, subtitle: `${t.title} · ${t.period}`, app: "about" as AppId, props: { section: "experience" }, haystack: `${t.org} ${t.title} ${t.body}` })),
      ...posts.map((p) => ({ key: `b-${p.slug}`, group: "Blog", title: p.title, subtitle: p.summary, app: "blog" as AppId, props: { post: p.slug }, haystack: `${p.title} ${p.summary} ${p.tag}` })),
      { key: "s-skills", group: "About", title: "Skills & stack", app: "about", props: { section: "skills" }, haystack: "skills stack tools .net c# react next typescript" },
      { key: "s-work", group: "About", title: "How I work", app: "about", props: { section: "work" }, haystack: "remote time zone uk hours how i work scrum agile process plan design relocate relocation visa sponsorship learning" },
    ],
    [],
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return all.filter((r) => r.group === "Applications");
    return all.filter((r) => r.haystack.toLowerCase().includes(t)).slice(0, 8);
  }, [q, all]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function choose(r: Result | undefined) {
    if (!r) return;
    os.open(r.app, r.props);
    os.setSpotlight(false);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") os.setSpotlight(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (results.length) choose(results[index]);
      else if (q.trim()) {
        os.open("terminal");
        os.setSpotlight(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9500] flex items-start justify-center bg-black/10 px-4 pt-[18vh]" onMouseDown={() => os.setSpotlight(false)}>
      <div
        role="dialog"
        aria-label="Spotlight search"
        onMouseDown={(e) => e.stopPropagation()}
        className="os-window-open w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white/85 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/85 dark:text-white"
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search className="size-5 text-zinc-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKey}
            placeholder="Spotlight Search — apps, projects, experience…"
            aria-label="Search"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto border-t border-black/5 p-2 dark:border-white/10">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-zinc-500">
              No matches. Press <kbd className="rounded bg-black/5 px-1 dark:bg-white/10">Enter</kbd> to ask the AI in Terminal.
            </li>
          ) : (
            results.map((r, i) => {
              const app = apps.find((a) => a.id === r.app)!;
              const showGroup = i === 0 || results[i - 1].group !== r.group;
              return (
                <li key={r.key}>
                  {showGroup ? <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-zinc-400">{r.group}</p> : null}
                  <button
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => choose(r)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === index ? "bg-blue-600 text-white" : ""}`}
                  >
                    {r.group === "Applications" ? (
                      <AppIcon icon={app.icon} from={app.from} to={app.to} size={28} />
                    ) : (
                      <FileText className={`size-5 ${i === index ? "text-white" : "text-zinc-400"}`} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      {r.subtitle ? <span className={`block truncate text-xs ${i === index ? "text-white/80" : "text-zinc-500"}`}>{r.subtitle}</span> : null}
                    </span>
                    {i === index ? <CornerDownLeft className="size-4 opacity-80" /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
