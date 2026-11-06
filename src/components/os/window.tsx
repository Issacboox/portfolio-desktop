"use client";

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { useOS, type WinState } from "./os-context";

type Rect = { x: number; y: number; w: number; h: number };
type Snap = "left" | "right" | "top" | null;

const MENU_H = 28;
const DOCK_SPACE = 92;
const EDGE = 8;

function initialRect(index: number, size: { w: number; h: number }): Rect {
  if (typeof window === "undefined") return { x: 120, y: 80, ...size };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(size.w, vw - 32);
  const h = Math.min(size.h, vh - MENU_H - DOCK_SPACE - 16);
  // Leave room for the widgets column on wide screens.
  const left = vw >= 1100 ? 300 : 0;
  const right = vw >= 1100 ? 100 : 0;
  const x = Math.max(16, left + (vw - left - right - w) / 2 + (index % 5) * 28 - 56);
  const y = Math.max(MENU_H + 12, (vh - DOCK_SPACE - h) / 2 + (index % 5) * 24 - 24);
  return { x, y, w, h };
}

function snapRect(s: Exclude<Snap, null>): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = MENU_H + EDGE;
  const h = vh - top - DOCK_SPACE;
  if (s === "top") return { x: EDGE, y: top, w: vw - EDGE * 2, h };
  const w = vw / 2 - EDGE * 1.5;
  return { x: s === "left" ? EDGE : vw / 2 + EDGE / 2, y: top, w, h };
}

/** A draggable, resizable app window with traffic lights, edge snapping and genie-style minimise. */
export function Window({
  win,
  index,
  title,
  size,
  minSize = { w: 360, h: 260 },
  toolbar,
  children,
  isMobile,
}: {
  win: WinState;
  index: number;
  title: string;
  size: { w: number; h: number };
  minSize?: { w: number; h: number };
  toolbar?: ReactNode;
  children: ReactNode;
  isMobile: boolean;
}) {
  const os = useOS();
  const [rect, setRect] = useState<Rect>(() => initialRect(index, size));
  const [dragging, setDragging] = useState(false);
  const [snap, setSnap] = useState<Snap>(null);
  const [leaving, setLeaving] = useState<"close" | "min" | null>(null);
  const drag = useRef<{ mode: "move" | "resize"; sx: number; sy: number; start: Rect } | null>(null);
  const el = useRef<HTMLElement>(null);
  const homeSwipe = useRef<number | null>(null);
  const focused = os.activeApp === win.id;

  // Keep windows reachable when the viewport shrinks.
  useEffect(() => {
    const onResize = () =>
      setRect((r) => ({
        ...r,
        w: Math.min(r.w, window.innerWidth - 16),
        x: Math.min(r.x, Math.max(0, window.innerWidth - 120)),
        y: Math.min(r.y, Math.max(MENU_H, window.innerHeight - 120)),
      }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function close() {
    if (leaving) return;
    setLeaving("close");
    setTimeout(() => os.close(win.id), 150);
  }

  function minimize() {
    if (leaving) return;
    // Fly toward this app's dock icon.
    const node = el.current;
    const icon = document.querySelector<HTMLElement>(`[data-dock-id="${win.id}"]`);
    if (node && icon) {
      const a = node.getBoundingClientRect();
      const b = icon.getBoundingClientRect();
      node.style.setProperty("--min-dx", `${b.left + b.width / 2 - (a.left + a.width / 2)}px`);
      node.style.setProperty("--min-dy", `${b.top + b.height / 2 - a.bottom}px`);
    }
    setLeaving("min");
    setTimeout(() => {
      os.minimize(win.id);
      setLeaving(null);
    }, 340);
  }

  function onPointerDown(e: RPointerEvent, mode: "move" | "resize") {
    if (isMobile || e.button !== 0) return;
    e.preventDefault();
    os.focus(win.id);
    let start = rect;
    // Dragging a maximised window un-maximises it under the cursor, like a real desktop.
    if (win.maximized && mode === "move") {
      const ratio = e.clientX / window.innerWidth;
      start = { ...rect, x: e.clientX - rect.w * ratio, y: MENU_H };
      setRect(start);
      os.toggleMax(win.id);
    } else if (win.maximized) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start };
    setDragging(true);
  }

  function onPointerMove(e: RPointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === "move") {
      setRect({
        ...d.start,
        x: Math.min(Math.max(d.start.x + dx, -d.start.w + 120), window.innerWidth - 120),
        y: Math.min(Math.max(d.start.y + dy, MENU_H), window.innerHeight - 60),
      });
      const next: Snap = e.clientX <= 4 ? "left" : e.clientX >= window.innerWidth - 4 ? "right" : e.clientY <= MENU_H + 2 ? "top" : null;
      if (next !== snap) setSnap(next);
    } else {
      setRect({
        ...d.start,
        w: Math.max(minSize.w, Math.min(d.start.w + dx, window.innerWidth - d.start.x - 8)),
        h: Math.max(minSize.h, Math.min(d.start.h + dy, window.innerHeight - d.start.y - 8)),
      });
    }
  }

  function endDrag() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (snap) {
      setRect(snapRect(snap));
      setSnap(null);
    }
  }

  const full = win.maximized || isMobile;
  const style = isMobile
    ? { left: 0, top: MENU_H, width: "100%", height: `calc(100% - ${MENU_H}px)`, zIndex: 8500 + win.z }
    : win.maximized
      ? { left: 0, top: MENU_H, width: "100%", height: `calc(100% - ${MENU_H}px)`, zIndex: win.z }
      : { left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: win.z };

  const anim = leaving === "close" ? "os-window-close" : leaving === "min" ? "os-window-minimize" : "os-window-open";
  const light = (color: string) => (focused || isMobile ? color : "bg-zinc-300 dark:bg-zinc-600");

  return (
    <>
      {snap && dragging ? (
        <div
          aria-hidden
          className="os-snap-preview pointer-events-none fixed rounded-2xl border border-white/50 bg-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] backdrop-blur-md"
          style={(() => {
            const r = snapRect(snap);
            return { left: r.x, top: r.y, width: r.w, height: r.h, zIndex: win.z - 1 };
          })()}
        />
      ) : null}
      <section
        ref={el}
        role="dialog"
        aria-label={title}
        onPointerDown={() => !focused && os.focus(win.id)}
        className={`${anim} ${dragging ? "" : "os-window-glide"} absolute flex flex-col overflow-hidden border bg-white/75 text-zinc-900 backdrop-blur-xl backdrop-saturate-150 dark:bg-zinc-900/75 dark:text-zinc-100 ${
          full ? "rounded-none" : "rounded-xl"
        } ${
          focused
            ? "border-black/10 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:shadow-[0_40px_100px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "border-black/5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)] dark:border-white/5"
        } ${win.minimized ? "hidden" : ""}`}
        style={style}
      >
        {/* title bar */}
        <header
          onPointerDown={(e) => onPointerDown(e, "move")}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => !isMobile && os.toggleMax(win.id)}
          className={`flex h-11 shrink-0 touch-none items-center gap-3 border-b border-black/5 px-4 select-none dark:border-white/5 ${
            isMobile ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="group flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
            <button aria-label={`Close ${title}`} onClick={close} className={`flex size-3 items-center justify-center rounded-full ${light("bg-[#ff5f57]")} ${isMobile ? "size-4" : ""}`}>
              <span className={`text-[8px] leading-none text-black/60 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>×</span>
            </button>
            {!isMobile ? (
              <>
                <button aria-label={`Minimise ${title}`} onClick={minimize} className={`flex size-3 items-center justify-center rounded-full ${light("bg-[#febc2e]")}`}>
                  <span className="text-[9px] leading-none text-black/60 opacity-0 group-hover:opacity-100">−</span>
                </button>
                <button aria-label={`Maximise ${title}`} onClick={() => os.toggleMax(win.id)} className={`flex size-3 items-center justify-center rounded-full ${light("bg-[#28c840]")}`}>
                  <span className="text-[7px] leading-none text-black/60 opacity-0 group-hover:opacity-100">↗</span>
                </button>
              </>
            ) : null}
          </div>
          <p className={`flex-1 truncate text-center text-[13px] font-semibold transition-colors ${focused ? "" : "text-zinc-400"}`}>{title}</p>
          <div className="flex min-w-[52px] justify-end">{toolbar}</div>
        </header>

        <div className="relative min-h-0 flex-1">{children}</div>

        {/* phone: home indicator — tap or swipe up to go back to the home screen */}
        {isMobile ? (
          <button
            aria-label="Back to home screen"
            onClick={close}
            onPointerDown={(e) => (homeSwipe.current = e.clientY)}
            onPointerUp={(e) => {
              if (homeSwipe.current !== null && homeSwipe.current - e.clientY > 24) close();
              homeSwipe.current = null;
            }}
            className="flex h-6 shrink-0 touch-none items-center justify-center"
          >
            <span className="h-[5px] w-32 rounded-full bg-zinc-900/80 dark:bg-white/80" />
          </button>
        ) : null}

        {/* resize handle */}
        {!full ? (
          <div
            aria-hidden
            onPointerDown={(e) => onPointerDown(e, "resize")}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none"
          />
        ) : null}
      </section>
    </>
  );
}
