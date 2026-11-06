"use client";

import { Moon, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { appById } from "./apps";
import { fmt, useNow } from "./hooks";
import { useOS } from "./os-context";

export function MenuBar({ onLock, onRestart }: { onLock: () => void; onRestart: () => void }) {
  const os = useOS();
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const active = os.activeApp ? appById(os.activeApp).title.split(" — ")[0] : "Finder";
  const item = "block w-full rounded px-3 py-1 text-left hover:bg-blue-600 hover:text-white";

  return (
    <header className="relative z-[9000] flex h-7 items-center justify-between border-b border-white/20 bg-white/35 px-3 text-[13px] text-zinc-900 backdrop-blur-xl backdrop-saturate-150 dark:border-white/5 dark:bg-black/30 dark:text-white">
      <div className="flex items-center gap-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-orange-400 via-rose-500 to-violet-600 text-[11px] font-bold text-white shadow-sm transition active:scale-90"
            aria-label="NurOS menu"
            aria-expanded={menuOpen}
          >
            N
          </button>
          {menuOpen ? (
            <div className="os-pop-in absolute top-6 left-0 w-56 rounded-lg border border-black/10 bg-white/90 p-1 text-zinc-900 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/90 dark:text-white">
              <button className={item} onClick={() => { os.open("about"); setMenuOpen(false); }}>About Nurarat</button>
              <button className={item} onClick={() => { os.open("settings"); setMenuOpen(false); }}>Settings…</button>
              <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
              <button className={item} onClick={() => { setMenuOpen(false); onLock(); }}>Lock Screen</button>
              <button className={item} onClick={() => { setMenuOpen(false); onRestart(); }}>Restart…</button>
            </div>
          ) : null}
        </div>
        <span className="font-semibold">{active}</span>
        <span className="hidden opacity-80 sm:inline">Nurarat Sangreuang · Full-stack Developer</span>
      </div>
      <div className="flex items-center gap-3 tabular-nums">
        <button onClick={() => os.setDark(!os.dark)} aria-label={os.dark ? "Switch to light appearance" : "Switch to dark appearance"} className="opacity-90 transition hover:opacity-100 active:scale-90">
          {os.dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </button>
        <button onClick={() => os.setSpotlight(true)} aria-label="Open Spotlight search (Ctrl+K)" className="opacity-90 hover:opacity-100">
          <Search className="size-3.5" />
        </button>
        <span className="hidden sm:inline">
          <span className="opacity-60">LDN</span> {fmt(now, "Europe/London", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span>
          <span className="opacity-60">BKK</span> {fmt(now, "Asia/Bangkok", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="hidden md:inline">{fmt(now, "Asia/Bangkok", { weekday: "short", day: "numeric", month: "short" })}</span>
      </div>
    </header>
  );
}
