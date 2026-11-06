"use client";

import { ArrowUpRight, ChevronLeft, Database, Rocket, Workflow } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { projectDetails } from "@/content/project-details";
import { projects, type Project } from "@/content/profile";

const filters = ["All", "Live", "In progress", "Building"] as const;
const tile = ["from-orange-400 to-rose-500", "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600", "from-violet-400 to-purple-600"];

export function ProjectsApp() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [open, setOpen] = useState<Project | null>(null);
  const list = projects.filter((p) => filter === "All" || p.status === filter);

  return (
    <div className="flex h-full">
      <nav className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-black/5 bg-zinc-50/60 p-3 sm:flex dark:border-white/5 dark:bg-white/[0.03]">
        <p className="px-2 pb-1 text-[11px] font-semibold text-zinc-400">Favourites</p>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setOpen(null);
            }}
            className={`rounded-md px-2 py-1.5 text-left text-[13px] ${filter === f ? "bg-black/[0.07] font-medium dark:bg-white/10" : "text-zinc-600 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/5"}`}
          >
            {f}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-7">
        {open ? (
          <Detail project={open} index={projects.indexOf(open)} onBack={() => setOpen(null)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {list.map((p) => (
              <button
                key={p.slug}
                onClick={() => setOpen(p)}
                className="group flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div className={`relative flex aspect-[16/9] items-end overflow-hidden rounded-xl bg-gradient-to-br p-4 ${tile[projects.indexOf(p) % tile.length]}`}>
                  {p.image ? (
                    <Image src={p.image} alt={`Screenshot of ${p.title}`} fill sizes="(max-width: 640px) 100vw, 420px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight text-white drop-shadow">{p.title.split(" — ")[0]}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{p.title}</p>
                  <Status s={p.status} />
                </div>
                <p className="line-clamp-2 text-sm text-zinc-500">{p.summary}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Status({ s }: { s: Project["status"] }) {
  const c = s === "Live" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : s === "Building" ? "bg-orange-500/10 text-orange-700 dark:text-orange-400" : "bg-sky-500/10 text-sky-700 dark:text-sky-400";
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${c}`}>{s}</span>;
}

function Detail({ project: p, index, onBack }: { project: Project; index: number; onBack: () => void }) {
  return (
    <article className="mx-auto max-w-2xl space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
        <ChevronLeft className="size-4" /> All projects
      </button>
      {p.image ? (
        <>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/5 shadow-lg dark:border-white/10">
            <Image src={p.image} alt={`Screenshot of ${p.title}`} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover object-top" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">{p.title}</h2>
        </>
      ) : (
        <div className={`flex aspect-[21/9] items-end rounded-2xl bg-gradient-to-br p-6 ${tile[index % tile.length]}`}>
          <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow">{p.title}</h2>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Status s={p.status} />
        {p.url ? (
          <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Visit site <ArrowUpRight className="size-3.5" />
          </a>
        ) : null}
        {p.repo ? (
          <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Code <ArrowUpRight className="size-3.5" />
          </a>
        ) : null}
      </div>
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{p.summary}</p>
      <div className="flex flex-wrap gap-2">
        {p.stack.map((s) => (
          <span key={s} className="rounded-md border border-black/5 bg-white/80 px-2.5 py-1 font-mono text-xs dark:border-white/10 dark:bg-white/5">
            {s}
          </span>
        ))}
      </div>
      <HowItWorks slug={p.slug} />
    </article>
  );
}

function HowItWorks({ slug }: { slug: string }) {
  const d = projectDetails[slug];
  if (!d) return null;
  const sections = [
    { title: "How it works", items: d.how, icon: Workflow },
    { title: "Data", items: d.data, icon: Database },
    { title: "Deploy & CI/CD", items: d.deploy, icon: Rocket },
  ];
  return (
    <div className="space-y-6 pt-2">
      <figure className="rounded-2xl border border-black/5 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <figcaption className="mb-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Architecture</figcaption>
        <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {d.flow.map((f, i) => (
            <li key={f.title} className="flex flex-col items-center gap-2 sm:flex-1 sm:flex-row">
              <div className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
                <p className="text-[13px] font-semibold">{f.title}</p>
                {f.body ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{f.body}</p> : null}
              </div>
              {i < d.flow.length - 1 ? (
                <span aria-hidden className="text-zinc-400">
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </figure>
      {sections.map((sec) => (
        <section key={sec.title}>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <sec.icon className="size-4 text-orange-500" /> {sec.title}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {sec.items.map((it) => (
              <li key={it} className="flex gap-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-orange-500" />
                {it}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
