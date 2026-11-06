"use client";

import { useRef, useState } from "react";
import { AppIcon } from "./app-icon";
import { apps, externalLinks } from "./apps";
import { useOS, type AppId } from "./os-context";

const BASE = 50;
const RANGE = 150;
const MAX_BOOST = 0.6;

/** Glass dock with Gaussian magnification, launch bounce and glowing running indicators. */
export function Dock({ isMobile }: { isMobile: boolean }) {
  const os = useOS();
  const [bouncing, setBouncing] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const zooms = useRef<Record<string, HTMLElement | null>>({});
  const centres = useRef<Record<string, number>>({});
  const frame = useRef(0);

  // Magnification writes styles straight to the DOM (once per frame) instead of re-rendering
  // the dock on every mouse move. Icon centres are measured once when the pointer enters,
  // so the growing icons don't feed back into the measurement.
  function measure() {
    for (const [id, el] of Object.entries(refs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      centres.current[id] = r.left + r.width / 2;
    }
  }
  function apply(clientX: number | null) {
    for (const [id, el] of Object.entries(zooms.current)) {
      if (!el) continue;
      const c = centres.current[id];
      const d = clientX === null || c === undefined ? Infinity : clientX - c;
      const s = 1 + MAX_BOOST * Math.exp(-(d * d) / (2 * (RANGE / 2.4) ** 2));
      el.style.transform = `scale(${s})`;
      el.style.marginInline = `${(s - 1) * 16}px`;
    }
  }
  function onMove(clientX: number) {
    if (isMobile) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => apply(clientX));
  }
  function onLeave() {
    cancelAnimationFrame(frame.current);
    apply(null);
  }

  function launch(id: AppId) {
    const w = os.windows.find((x) => x.id === id);
    if (!w || w.minimized) {
      setBouncing(id);
      setTimeout(() => setBouncing((b) => (b === id ? null : b)), 900);
    }
    os.open(id);
  }

  const shown = isMobile ? apps.filter((a) => ["about", "projects", "terminal", "mail"].includes(a.id)) : apps;
  const size = isMobile ? 54 : BASE;

  // Sits above the icon at full magnification (it grows upwards by MAX_BOOST × size), plus a gap.
  const tipStyle = { bottom: `calc(100% + ${Math.round(MAX_BOOST * size) + 6}px)` };
  const tooltip =
    "pointer-events-none absolute z-20 rounded-lg border border-white/20 bg-zinc-900/75 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-150 group-hover:-translate-y-1 group-hover:opacity-100";

  return (
    <nav
      aria-label="Dock"
      onMouseEnter={measure}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseLeave={onLeave}
      className={`absolute left-1/2 z-[8000] flex -translate-x-1/2 items-end gap-2 border border-white/40 bg-white/25 px-2.5 pt-2 pb-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/10 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] ${
        isMobile ? "bottom-3 w-[calc(100%-24px)] justify-around rounded-[30px] px-3 py-3" : "bottom-2 rounded-[22px]"
      }`}
    >
      {shown.map((a) => {
        const running = os.windows.some((w) => w.id === a.id);
        return (
          <button
            key={a.id}
            ref={(el) => {
              refs.current[a.id] = el;
            }}
            data-dock-id={a.id}
            onClick={() => launch(a.id)}
            aria-label={`Open ${a.title}`}
            className="group relative flex flex-col items-center"
          >
            {!isMobile ? <span className={tooltip} style={tipStyle}>{a.title.split(" — ")[0]}</span> : null}
            <span className={`block ${bouncing === a.id ? "os-dock-bounce" : ""}`}>
              <span
                ref={(el) => {
                  zooms.current[a.id] = el;
                }}
                className="block origin-bottom transition-[transform,margin] duration-150 ease-out"
              >
                <AppIcon art={a.id} icon={a.icon} from={a.from} to={a.to} size={size} />
              </span>
            </span>
            {!isMobile ? (
              <span
                className={`mt-1 size-1 rounded-full transition-all duration-300 ${
                  running ? "bg-zinc-800 shadow-[0_0_6px_1px_rgba(255,255,255,0.8)] dark:bg-white" : "scale-0 bg-transparent"
                }`}
              />
            ) : null}
          </button>
        );
      })}
      {!isMobile ? (
        <>
          <span className="mx-1 mb-2 h-10 w-px self-center bg-black/15 dark:bg-white/20" />
          {externalLinks.map((l) => {
            return (
              <a
                key={l.id}
                ref={(el) => {
                  refs.current[l.id] = el;
                }}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${l.title} (opens in a new tab)`}
                className="group relative flex flex-col items-center"
              >
                <span className={tooltip} style={tipStyle}>{l.title} ↗</span>
                <span
                  ref={(el) => {
                    zooms.current[l.id] = el;
                  }}
                  className="block origin-bottom transition-[transform,margin] duration-150 ease-out"
                >
                  <AppIcon art={l.id} icon={l.icon} from={l.from} to={l.to} size={size} />
                </span>
                <span className="mt-1 size-1" />
              </a>
            );
          })}
        </>
      ) : null}
    </nav>
  );
}
