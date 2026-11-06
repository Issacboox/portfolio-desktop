"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { askSuggestions, profile } from "@/content/profile";
import cutout from "../../../public/images/nurarat-cutout.webp";
import { fmt, useNow } from "./hooks";
import { useOS } from "./os-context";

// three.js only loads on the desktop, and only once the widget mounts.
const AvatarScene = dynamic(() => import("../three/avatar-scene"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-2xl bg-white/10" />,
});

/** Frosted glass card shared by every widget. */
export function Glass({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`os-widget-in relative overflow-hidden rounded-[22px] border border-white/40 bg-white/35 text-zinc-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/35 dark:text-white dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AvailabilityPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      {profile.availability}
    </span>
  );
}

/** Hero card: the 3D avatar (desktop) or photo (phone), name and quick actions. */
export function ProfileWidget({ use3D, delay }: { use3D: boolean; delay?: number }) {
  const os = useOS();
  // Start three.js only once the browser is idle after the unlock animation, so that animation stays smooth.
  const [ready3D, setReady3D] = useState(false);
  useEffect(() => {
    if (!use3D) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(() => setReady3D(true), { timeout: 2000 }) : setReady3D(true)), 900);
    return () => clearTimeout(t);
  }, [use3D]);
  return (
    <Glass className="w-full" delay={delay}>
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-300/70 via-rose-300/60 to-violet-300/60 dark:from-orange-500/30 dark:via-rose-500/25 dark:to-violet-600/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.55),transparent_60%)]" />
        {use3D && ready3D ? (
          <div className="absolute inset-0 animate-in fade-in duration-700">
            <AvatarScene distance={3.3} />
          </div>
        ) : use3D ? (
          <div className="absolute inset-0 animate-pulse bg-white/10" />
        ) : (
          <Image src={cutout} alt={profile.name} fill priority sizes="320px" className="object-contain object-bottom" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white backdrop-blur-md">
          {use3D ? "move your cursor ✦" : "hello 👋"}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">{profile.name}</p>
          <p className="text-xs opacity-70">{profile.role} · Bangkok</p>
        </div>
        <AvailabilityPill />
        <div className="flex gap-2 pt-1">
          <button onClick={() => os.open("about")} className="flex-1 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.97] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            About me
          </button>
          <button onClick={() => os.open("mail")} className="flex-1 rounded-xl bg-white/60 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/90 active:scale-[0.97] dark:bg-white/10 dark:hover:bg-white/20">
            Say hello
          </button>
        </div>
      </div>
    </Glass>
  );
}

function hm(now: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { h: get("hour"), m: get("minute") };
}

function AnalogClock({ now, tz, label }: { now: Date; tz: string; label: string }) {
  const { h, m } = hm(now, tz);
  const night = h < 7 || h >= 20;
  // Angles grow all day (not mod 360) so hands never spin backwards on the hour.
  const minuteAngle = (h * 60 + m) * 6;
  const hourAngle = (h * 60 + m) * 0.5;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 100 100" className="size-[86px] drop-shadow-sm" role="img" aria-label={`${label} ${fmt(now, tz, { hour: "2-digit", minute: "2-digit" })}`}>
        <circle cx="50" cy="50" r="48" className={night ? "fill-zinc-900" : "fill-white"} />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="8"
            x2="50"
            y2={i % 3 === 0 ? 15 : 12}
            strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
            strokeLinecap="round"
            className={night ? "stroke-white/70" : "stroke-zinc-800/70"}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <text x="50" y="70" textAnchor="middle" className={`text-[9px] font-semibold ${night ? "fill-white/60" : "fill-zinc-500"}`}>
          {label}
        </text>
        <line x1="50" y1="50" x2="50" y2="27" strokeWidth="4" strokeLinecap="round" className={`os-hand ${night ? "stroke-white" : "stroke-zinc-900"}`} style={{ transform: `rotate(${hourAngle}deg)` }} />
        <line x1="50" y1="50" x2="50" y2="16" strokeWidth="2.6" strokeLinecap="round" className={`os-hand ${night ? "stroke-white" : "stroke-zinc-900"}`} style={{ transform: `rotate(${minuteAngle}deg)` }} />
        <circle cx="50" cy="50" r="3.2" className="fill-orange-500" />
      </svg>
      <span className="text-[11px] font-medium tabular-nums opacity-75">{fmt(now, tz, { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  );
}

/** Bangkok and London side by side, plus whether UK office hours are on right now. */
export function ClocksWidget({ delay }: { delay?: number }) {
  const now = useNow(10000);
  const ldn = hm(now, "Europe/London").h;
  const open = ldn >= 9 && ldn < 18;
  return (
    <Glass className="w-full p-4" delay={delay}>
      <div className="flex justify-around">
        <AnalogClock now={now} tz="Asia/Bangkok" label="BKK" />
        <AnalogClock now={now} tz="Europe/London" label="LDN" />
      </div>
      <p className="mt-3 text-center text-[11px] leading-snug opacity-80">
        {open ? (
          <>
            <b className="text-emerald-700 dark:text-emerald-300">UK office hours now</b> — I&apos;m online for your morning.
          </>
        ) : (
          <>My afternoon overlaps UK mornings — async the rest of the day.</>
        )}
      </p>
    </Glass>
  );
}

/** A tiny prompt box that hands the question to the Terminal's AI. */
export function AskWidget({ delay }: { delay?: number }) {
  const os = useOS();
  const [q, setQ] = useState("");
  const ask = (question: string) => {
    if (!question.trim()) return os.open("terminal");
    os.open("terminal", { q: question.trim() });
    setQ("");
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };
  return (
    <Glass className="w-full p-4" delay={delay}>
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5 text-orange-500" /> Ask my AI
      </p>
      <form onSubmit={onSubmit} className="mt-2 flex items-center gap-1.5 rounded-xl border border-black/5 bg-white/60 py-1 pr-1 pl-3 focus-within:ring-2 focus-within:ring-orange-400/60 dark:border-white/10 dark:bg-black/20">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What has she built with .NET?"
          aria-label="Ask a question about Nurarat"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
        />
        <button type="submit" aria-label="Ask" className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 text-white transition active:scale-90">
          <ArrowUpRight className="size-3.5" />
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {askSuggestions.slice(0, 2).map((s) => (
          <button key={s} onClick={() => ask(s)} className="rounded-full bg-black/5 px-2 py-0.5 text-left text-[10.5px] leading-snug transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20">
            {s}
          </button>
        ))}
      </div>
    </Glass>
  );
}
