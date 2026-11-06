"use client";

import { Briefcase, Clock3, Layers, Plane, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { focusAreas, languages, process, profile, skillGroups, timeline, workingStyle } from "@/content/profile";
import cutout from "../../../../public/images/nurarat-cutout.webp";

const sections = [
  { id: "about", label: "About me", icon: Sparkles },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills & stack", icon: Layers },
  { id: "work", label: "How I work", icon: Clock3 },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AboutApp({ props }: { props?: Record<string, string> }) {
  const initial = (sections.find((s) => s.id === props?.section)?.id ?? "about") as SectionId;
  const [active, setActive] = useState<SectionId>(initial);

  return (
    <div className="flex h-full">
      <nav className="hidden w-52 shrink-0 flex-col gap-0.5 border-r border-black/5 bg-zinc-50/60 p-3 sm:flex dark:border-white/5 dark:bg-white/[0.03]">
        <p className="px-2 pb-1 text-[11px] font-semibold text-zinc-400">Nurarat</p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
              active === s.id ? "bg-black/[0.07] font-medium dark:bg-white/10" : "text-zinc-600 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/5"
            }`}
          >
            <s.icon className="size-4 text-orange-500" />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto">
        {/* mobile section tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-black/5 p-2 sm:hidden dark:border-white/5">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${active === s.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-black/5 dark:bg-white/10"}`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-2xl px-6 py-8 sm:px-10">
          {active === "about" ? <About /> : null}
          {active === "experience" ? <Experience /> : null}
          {active === "skills" ? <Skills /> : null}
          {active === "work" ? <Work /> : null}
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <article className="space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orange-300 to-rose-400 ring-4 ring-white shadow-lg dark:ring-zinc-800">
          <Image src={cutout} alt="Nurarat" fill sizes="96px" className="translate-y-[8%] scale-110 object-contain object-bottom" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-zinc-500">{profile.role} · {profile.location}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" /> {profile.availability}
          </span>
        </div>
      </div>
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        Hi, I&apos;m Nurarat, but most people just call me Maru. I&apos;m a developer from Bangkok and I&apos;ve been
        writing software for a living for about two years.
      </p>
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        I started on the backend, building .NET APIs for e-quotation, e-commerce and car sales systems, and hooking
        them up to enterprise tools like Oracle WebCenter and K2. Now I work across the whole stack, with Next.js and
        React on the front and .NET behind it. I also like the part before any code gets written: talking to people,
        working out what they actually need, sketching the screens and designing the database.
      </p>
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        I&apos;ve always worked in Scrum teams and I like the rhythm of it. Short sprints, quick feedback, and something
        real to show every couple of weeks. I also can&apos;t stop learning new things. This site, the 3D me on the
        desktop and the Roblox games I build at weekends all started with &quot;I wonder how that works&quot;.
      </p>
      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        Right now I&apos;m looking for my next role with a team in the UK. I&apos;d love to relocate if you can sponsor a
        visa, and I&apos;m just as happy working remotely. Got a question? Ask the <b>Terminal</b> in the dock, or just
        email me.
      </p>
      <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
        <Plane className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-[13px] font-semibold">Relocation or remote</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{profile.relocation}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {focusAreas.map((f) => (
          <div key={f.title} className="rounded-xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[13px] font-semibold">{f.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Experience() {
  return (
    <article>
      <h2 className="text-2xl font-semibold tracking-tight">Experience</h2>
      <ol className="mt-6 space-y-6 border-l border-zinc-200 pl-6 dark:border-zinc-700">
        {timeline.map((t) => (
          <li key={`${t.org}-${t.period}`} className="relative">
            <span className={`absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${t.current ? "bg-orange-500" : t.next ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
            <p className="text-xs font-medium text-zinc-400">{t.period}</p>
            <p className="mt-0.5 font-semibold">{t.next ? t.title : t.org}</p>
            <p className="text-sm text-zinc-500">{t.next ? t.org : t.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t.body}</p>
            {t.points ? (
              <ul className="mt-2 space-y-1">
                {t.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-orange-500" />
                    {pt}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

function Skills() {
  return (
    <article className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Skills &amp; stack</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {skillGroups.map((g) => (
          <div key={g.title} className="rounded-xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[13px] font-semibold">{g.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <span key={it} className="rounded-md border border-black/5 bg-white/80 px-2 py-0.5 font-mono text-[11px] dark:border-white/10 dark:bg-white/5">
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-500">Languages: {languages.join(" · ")}</p>
    </article>
  );
}

function Work() {
  return (
    <article className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">How I work</h2>
      <ol className="relative grid gap-2 sm:grid-cols-3">
        {process.map((p, i) => (
          <li key={p.step} className="relative rounded-xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-[11px] font-bold text-white">{i + 1}</span>
              <span className="font-semibold">{p.step}</span>
              {i < process.length - 1 ? <span className="ml-auto text-zinc-300 dark:text-zinc-600" aria-hidden>→</span> : <span className="ml-auto" aria-hidden>↻</span>}
            </span>
            <span className="mt-2 block text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{p.body}</span>
          </li>
        ))}
      </ol>
      <div className="grid gap-3 sm:grid-cols-2">
      {workingStyle.map((w) => (
        <div key={w.title} className="rounded-xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="font-semibold">{w.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{w.body}</p>
        </div>
      ))}
      </div>
    </article>
  );
}
