"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent as RMouseEvent } from "react";
import { profile } from "@/content/profile";
import { AppIcon } from "./app-icon";
import { apps, appById, externalLinks } from "./apps";
import { BootScreen } from "./boot-screen";
import { Dock } from "./dock";
import { fmt, useIsMobile, useMediaQuery, useNow } from "./hooks";
import { LivingWallpaper } from "./living-wallpaper";
import { LockScreen } from "./lock-screen";
import { MenuBar } from "./menu-bar";
import { WelcomeNotification } from "./notification";
import { OSProvider, useOS } from "./os-context";
import { Spotlight } from "./spotlight";
import { wallpapers } from "./wallpapers";
import { AskWidget, ClocksWidget, ProfileWidget } from "./widgets";
import { Window } from "./window";

type Phase = "boot" | "lock" | "desktop";
const BOOT_KEY = "nuros-booted";

function readBooted() {
  try {
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return false;
  }
}

function greeting(now: Date) {
  const h = Number(fmt(now, "Asia/Bangkok", { hour: "numeric", hourCycle: "h23" }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Right-click menu on the empty desktop. */
function ContextMenu({ at, onClose }: { at: { x: number; y: number }; onClose: () => void }) {
  const os = useOS();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(at);

  // Keep the menu on-screen near the edges.
  useEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: Math.min(at.x, window.innerWidth - r.width - 8), y: Math.min(at.y, window.innerHeight - r.height - 8) });
  }, [at]);

  useEffect(() => {
    const close = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const idx = wallpapers.findIndex((w) => w.id === os.wallpaperId);
  const next = wallpapers[(idx + 1) % wallpapers.length];
  const items: ({ label: string; hint?: string; run: () => void } | "sep")[] = [
    { label: "Ask my AI…", hint: "Terminal", run: () => os.open("terminal") },
    { label: "Spotlight Search", hint: "Ctrl K", run: () => os.setSpotlight(true) },
    "sep",
    { label: `Next wallpaper`, hint: next.name, run: () => os.setWallpaper(next.id) },
    { label: os.dark ? "Light appearance" : "Dark appearance", run: () => os.setDark(!os.dark) },
    "sep",
    { label: "Close all windows", run: () => os.windows.forEach((w) => os.close(w.id)) },
    { label: "Settings…", run: () => os.open("settings") },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      className="os-pop-in fixed z-[9600] w-60 rounded-xl border border-black/10 bg-white/80 p-1 text-[13px] text-zinc-900 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-800/80 dark:text-white"
      style={{ left: pos.x, top: pos.y }}
    >
      {items.map((it, i) =>
        it === "sep" ? (
          <div key={i} className="my-1 h-px bg-black/10 dark:bg-white/10" />
        ) : (
          <button
            key={it.label}
            role="menuitem"
            onClick={() => {
              it.run();
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-1 text-left hover:bg-blue-600 hover:text-white"
          >
            {it.label}
            {it.hint ? <span className="text-xs opacity-50">{it.hint}</span> : null}
          </button>
        ),
      )}
    </div>
  );
}

function Shell() {
  const os = useOS();
  const isMobile = useIsMobile();
  const roomy = useMediaQuery("(min-width: 1100px) and (min-height: 640px)");
  const now = useNow(60000);
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === "undefined") return "boot";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return readBooted() || reduce ? "lock" : "boot";
  });
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [welcomed, setWelcomed] = useState(false);
  const openedOnce = useRef(false);
  const wallpaper = wallpapers.find((w) => w.id === os.wallpaperId)!;
  const darkText = !(wallpaper.dark || os.dark);

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* private mode: fine */
    }
    setPhase("lock");
  }, []);

  const unlock = useCallback(() => {
    setPhase("desktop");
    if (!openedOnce.current) {
      openedOnce.current = true;
      setWelcomed(true);
      // Installed-app shortcuts (manifest) link to /?app=<id>; open that app straight away.
      const wanted = new URLSearchParams(window.location.search).get("app");
      const shortcut = apps.find((x) => x.id === wanted);
      if (shortcut) os.open(shortcut.id);
      // Phones land on the home screen; desktops open the About window next to the widgets.
      else if (!window.matchMedia("(max-width: 767px)").matches) os.open("about");
    }
  }, [os]);

  // Ctrl/Cmd+K opens Spotlight.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "desktop") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        os.setSpotlight(!os.spotlightOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, os]);

  const onContextMenu = (e: RMouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const label = `font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${darkText ? "text-zinc-900" : "text-white"}`;

  return (
    <div className={`fixed inset-0 overflow-hidden font-sans select-none ${os.dark ? "dark" : ""}`} style={{ background: wallpaper.base }}>
      <LivingWallpaper
        wallpaper={wallpaper}
        interactive={phase === "desktop" && !isMobile}
        paused={phase !== "desktop" || os.windows.some((w) => !w.minimized)}
      />

      {phase === "boot" ? <BootScreen onDone={finishBoot} /> : null}
      {phase === "lock" ? <LockScreen wallpaper={wallpaper} onUnlock={unlock} /> : null}

      <MenuBar onLock={() => setPhase("lock")} onRestart={() => setPhase("boot")} />

      {/* empty desktop: right-click target */}
      <div className="absolute inset-0 top-7" onContextMenu={onContextMenu} />

      {isMobile ? (
        // Phone home screen: greeting, hero widget, app grid, clocks.
        <div className="absolute inset-x-0 top-7 bottom-[96px] overflow-y-auto overscroll-contain px-5 pt-5 pb-6">
          <p className={`os-widget-in text-[13px] ${label} opacity-80`}>{fmt(now, "Asia/Bangkok", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className={`os-widget-in mb-4 text-[28px] leading-tight font-semibold tracking-tight ${label}`}>{greeting(now)} 👋</h1>
          <ProfileWidget use3D={false} delay={60} />
          <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5">
            {apps.map((a, i) => (
              <button key={a.id} onClick={() => os.open(a.id)} className="os-widget-in flex flex-col items-center gap-1.5 transition active:scale-90" style={{ animationDelay: `${120 + i * 35}ms` }}>
                <AppIcon art={a.id} icon={a.icon} from={a.from} to={a.to} size={58} />
                <span className={`text-[11px] ${label}`}>{a.title.split(" — ")[0]}</span>
              </button>
            ))}
            {externalLinks.map((l, i) => (
              <a key={l.id} href={l.href} target="_blank" rel="noreferrer" className="os-widget-in flex flex-col items-center gap-1.5 transition active:scale-90" style={{ animationDelay: `${330 + i * 35}ms` }}>
                <AppIcon art={l.id} icon={l.icon} from={l.from} to={l.to} size={58} />
                <span className={`text-[11px] ${label}`}>{l.title}</span>
              </a>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <AskWidget delay={380} />
            <ClocksWidget delay={440} />
          </div>
        </div>
      ) : (
        <>
          {/* widgets column */}
          {roomy && phase !== "boot" ? (
            <aside aria-label="Widgets" className="absolute top-11 left-5 flex w-[272px] flex-col gap-4">
              <ProfileWidget use3D delay={100} />
              <ClocksWidget delay={200} />
              <AskWidget delay={300} />
            </aside>
          ) : null}

          {/* editorial signature, etched into the wallpaper */}
          <div aria-hidden className={`pointer-events-none absolute right-10 bottom-28 hidden text-right lg:block ${darkText ? "text-zinc-900/80" : "text-white/80"}`}>
            <p className="text-xs font-semibold tracking-[0.35em] uppercase opacity-60">NurOS · portfolio of</p>
            <p className="mt-1 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-tighter opacity-60">
              {profile.shortName}
              <br />
              <span className="opacity-70">builds things</span>
              <br />
              that ship.
            </p>
          </div>

          {/* desktop shortcuts */}
          <div className="absolute top-11 right-4 flex flex-col gap-3">
            {(["projects", "terminal", "blog"] as const).map((id) => {
              const a = appById(id);
              return (
                <button key={id} onClick={() => os.open(id)} className="group flex w-20 flex-col items-center gap-1 rounded-xl p-1.5 transition hover:bg-white/20 active:scale-95">
                  <span className="transition-transform group-hover:-translate-y-0.5">
                    <AppIcon art={a.id} icon={a.icon} from={a.from} to={a.to} size={52} />
                  </span>
                  <span className={`text-xs ${label}`}>{a.title.split(" — ")[0]}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {os.windows.map((w, i) => {
        const a = appById(w.id);
        const App = a.component;
        return (
          <Window key={w.id} win={w} index={i} title={a.title} size={a.size} isMobile={isMobile}>
            {/* key: re-mount when Spotlight deep-links to a section or a widget sends a question */}
            <App key={w.props?.section ?? w.props?.q ?? w.props?.post ?? "default"} props={w.props} />
          </Window>
        );
      })}

      <Dock isMobile={isMobile} />
      {menu ? <ContextMenu at={menu} onClose={() => setMenu(null)} /> : null}
      {phase === "desktop" && welcomed ? <WelcomeNotification /> : null}
      {os.spotlightOpen ? <Spotlight /> : null}
    </div>
  );
}

export default function Desktop() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
