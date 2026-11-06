"use client";

import { useEffect, useState } from "react";

const LINES = [
  "NurOS BIOS v2.0 — Bangkok, TH",
  "Checking memory ............ 2+ years of experience OK",
  "Loading C# / .NET runtime .. OK",
  "Mounting /next.js /react .... OK",
  "Connecting to Supabase ..... OK",
  "Warming up AI (Claude) ..... OK",
  "Rendering 3D avatar ........ OK",
  "Starting desktop…",
];

/** BIOS-style text, then a glowing logo with a progress bar. Click or any key skips it. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [stage, setStage] = useState<"bios" | "logo">("bios");

  useEffect(() => {
    if (stage !== "bios") return;
    if (shown < LINES.length) {
      const id = setTimeout(() => setShown((s) => s + 1), 95);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setStage("logo"), 220);
    return () => clearTimeout(id);
  }, [shown, stage]);

  useEffect(() => {
    if (stage !== "logo") return;
    const id = setTimeout(onDone, 1500);
    return () => clearTimeout(id);
  }, [stage, onDone]);

  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[10000] flex cursor-pointer items-center justify-center overflow-hidden bg-black text-white" onClick={onDone}>
      {stage === "bios" ? (
        <div className="absolute top-8 left-8 font-mono text-[13px] leading-6 text-zinc-300">
          {LINES.slice(0, shown).map((l) => (
            <div key={l}>
              {l.endsWith("OK") ? (
                <>
                  {l.slice(0, -2)}
                  <span className="text-emerald-400">OK</span>
                </>
              ) : (
                l
              )}
            </div>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-zinc-300 align-middle" />
        </div>
      ) : (
        <div className="os-widget-in flex flex-col items-center gap-10">
          <div className="relative flex size-28 items-center justify-center">
            <div className="os-glow-pulse absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.45),transparent_65%)]" />
            <div
              className="os-spin-slow absolute inset-0 rounded-[30px] p-[2px]"
              style={{ background: "conic-gradient(from 0deg, #fb923c, #f43f5e, #8b5cf6, #38bdf8, #fb923c)" }}
            >
              <div className="size-full rounded-[28px] bg-black" />
            </div>
            <div className="relative flex size-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-400 via-rose-500 to-violet-600 text-4xl font-bold shadow-[0_0_60px_rgba(251,113,133,0.45)]">
              N
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium tracking-[0.3em] text-white/70 uppercase">NurOS</p>
            <div className="h-1 w-52 overflow-hidden rounded-full bg-white/15">
              <div className="os-boot-progress h-full rounded-full bg-gradient-to-r from-orange-400 via-rose-500 to-violet-500" />
            </div>
          </div>
        </div>
      )}
      <p className="absolute right-6 bottom-6 text-xs text-zinc-500">Click or press any key to skip</p>
    </div>
  );
}
