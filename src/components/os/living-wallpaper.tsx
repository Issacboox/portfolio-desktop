"use client";

import { useEffect, useRef } from "react";
import type { Wallpaper } from "./wallpapers";

// Fine film grain as an inline SVG, so the gradients never band.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const BLOB_LAYOUT = [
  { left: "-10%", top: "-15%", size: "62vmax", anim: "nuros-drift-a 26s" },
  { left: "55%", top: "-20%", size: "58vmax", anim: "nuros-drift-b 31s" },
  { left: "45%", top: "50%", size: "64vmax", anim: "nuros-drift-c 29s" },
  { left: "-15%", top: "55%", size: "56vmax", anim: "nuros-drift-d 34s" },
];

/**
 * An animated wallpaper: four large soft light blobs drift slowly and colours cross-fade when
 * the wallpaper changes. Performance notes:
 * - `paused` freezes the drift while windows are open. Every glass surface (windows, dock,
 *   widgets) uses backdrop-filter, and a moving background forces the browser to re-blur all of
 *   them every frame; a still background lets it cache the blur.
 * - The cursor light only runs its animation loop while the pointer is actually moving.
 * - No mix-blend-mode layers: blending a full-screen layer is costly to composite.
 */
export function LivingWallpaper({ wallpaper, interactive, paused = false }: { wallpaper: Wallpaper; interactive: boolean; paused?: boolean }) {
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive || paused) return;
    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;
    let x = tx;
    let y = ty;
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.current?.style.setProperty("transform", `translate3d(${x - 300}px, ${y - 300}px, 0)`);
      // Stop once the light has caught up with the cursor.
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [interactive, paused]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: wallpaper.base, transition: "background 1.2s ease" }}>
      <div className="nuros-static-wallpaper absolute inset-0" style={{ background: wallpaper.css }} />
      <div className="nuros-living absolute inset-0">
        {BLOB_LAYOUT.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 50% 50%, ${wallpaper.blobs[i]} 0%, transparent 65%)`,
              opacity: wallpaper.dark ? 0.75 : 0.9,
              animation: `${b.anim} ease-in-out infinite alternate`,
              animationPlayState: paused ? "paused" : "running",
              transition: "background 1.2s ease, opacity 1.2s ease",
            }}
          />
        ))}
      </div>
      {interactive && !paused ? (
        <div
          ref={glow}
          className="absolute top-0 left-0 size-[600px] rounded-full"
          style={{
            transform: "translate3d(-600px, -600px, 0)",
            background: `radial-gradient(circle, ${wallpaper.dark ? "rgb(255 255 255 / 0.07)" : "rgb(255 255 255 / 0.28)"} 0%, transparent 60%)`,
          }}
        />
      ) : null}
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: GRAIN }} />
      {/* soft vignette for depth */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgb(0 0 0 / 0.18) 100%)" }} />
    </div>
  );
}
