"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "./app-icon";
import { appById } from "./apps";
import { useOS } from "./os-context";

/** A one-off macOS-style banner nudging visitors toward the AI terminal. */
export function WelcomeNotification() {
  const os = useOS();
  const [state, setState] = useState<"hidden" | "in" | "out">("hidden");
  const app = appById("terminal");

  useEffect(() => {
    const show = setTimeout(() => setState("in"), 1800);
    const hide = setTimeout(() => setState((s) => (s === "in" ? "out" : s)), 10000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (state === "hidden") return null;

  return (
    <div
      role="status"
      onAnimationEnd={() => state === "out" && setState("hidden")}
      className={`${state === "in" ? "os-toast-in" : "os-toast-out"} fixed top-9 right-3 left-3 z-[9400] sm:left-auto sm:w-[340px]`}
    >
      <div className="group relative flex w-full items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-3 text-left text-zinc-900 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-800/70 dark:text-white">
        <button
          onClick={() => {
            os.open("terminal");
            setState("out");
          }}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <AppIcon icon={app.icon} from={app.from} to={app.to} size={36} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between text-[11px] opacity-60">
              <span>TERMINAL</span>
              <span>now</span>
            </span>
            <span className="block text-[13px] font-semibold">Got a question for me?</span>
            <span className="block text-[12.5px] leading-snug opacity-80">Ask my AI about my work, stack or time zone. Tap to open.</span>
          </span>
        </button>
        <button
          aria-label="Dismiss notification"
          onClick={() => setState("out")}
          className="absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full border border-black/10 bg-white text-[11px] text-zinc-600 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100 dark:border-white/10 dark:bg-zinc-700 dark:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
}
