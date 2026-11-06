"use client";

import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import cutout from "../../../public/images/nurarat-cutout.webp";
import { fmt, useNow } from "./hooks";
import type { Wallpaper } from "./wallpapers";

export function LockScreen({ wallpaper, onUnlock }: { wallpaper: Wallpaper; onUnlock: () => void }) {
  const now = useNow(10000);
  const [leaving, setLeaving] = useState(false);
  const swipeStart = useRef<number | null>(null);

  const done = useRef(false);

  const unlock = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(onUnlock, 460);
  }, [onUnlock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") unlock();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  return (
    <div
      className={`fixed inset-0 z-[9800] touch-none overflow-hidden text-white ${leaving ? "os-unlock" : ""}`}
      onPointerDown={(e) => (swipeStart.current = e.clientY)}
      onPointerUp={(e) => {
        if (swipeStart.current !== null && swipeStart.current - e.clientY > 60) unlock();
        swipeStart.current = null;
      }}
    >
      {/* static gradient here: the living one is already running underneath on the desktop */}
      <div className="absolute inset-0 scale-110" style={{ background: wallpaper.css }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/45" />
      <div className="relative flex h-full flex-col items-center justify-between py-[8vh]">
        <div className="os-widget-in text-center drop-shadow">
          <p className="text-lg font-medium opacity-90">{fmt(now, "Asia/Bangkok", { weekday: "long", day: "numeric", month: "long" })}</p>
          <p className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-[clamp(5rem,14vw,9rem)] leading-none font-semibold tracking-tighter text-transparent tabular-nums">
            {fmt(now, "Asia/Bangkok", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-2 text-sm opacity-75">Bangkok · {fmt(now, "Europe/London", { hour: "2-digit", minute: "2-digit" })} in London</p>
        </div>

        <div className="os-widget-in flex flex-col items-center gap-4" style={{ animationDelay: "120ms" }}>
          <div className="relative">
            <div className="os-glow-pulse absolute -inset-3 rounded-full bg-gradient-to-br from-orange-400/60 to-violet-500/60 blur-xl" />
            <div className="relative size-24 overflow-hidden rounded-full bg-gradient-to-br from-orange-300 to-rose-400 shadow-2xl ring-4 ring-white/40">
              <Image src={cutout} alt={profile.name} fill priority sizes="96px" className="translate-y-[8%] scale-110 object-contain object-bottom" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold drop-shadow">{profile.name}</p>
            <p className="text-sm opacity-80">{profile.role}</p>
          </div>
          <button
            onClick={unlock}
            autoFocus
            className="group mt-1 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
          >
            Enter portfolio
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
          <p className="flex flex-col items-center text-xs opacity-70">
            <ChevronUp className="os-nudge size-4" />
            <span className="hidden sm:inline">Press Enter · Ctrl/⌘ + K to search anything</span>
            <span className="sm:hidden">Swipe up to open</span>
          </p>
        </div>
      </div>
    </div>
  );
}
