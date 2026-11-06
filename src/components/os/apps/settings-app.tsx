"use client";

import { useOS } from "../os-context";
import { wallpapers } from "../wallpapers";

export function SettingsApp() {
  const os = useOS();
  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold">Appearance</h2>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-black/5 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <span className="text-sm">Dark mode</span>
        <button
          role="switch"
          aria-checked={os.dark}
          onClick={() => os.setDark(!os.dark)}
          className={`relative h-6 w-10 rounded-full transition-colors ${os.dark ? "bg-blue-600" : "bg-zinc-300"}`}
        >
          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${os.dark ? "left-[18px]" : "left-0.5"}`} />
        </button>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-zinc-500">Wallpaper</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {wallpapers.map((w) => (
          <button key={w.id} onClick={() => os.setWallpaper(w.id)} className="group text-left">
            <span
              className={`block aspect-[16/10] rounded-lg ring-2 ring-offset-2 ring-offset-white transition dark:ring-offset-zinc-900 ${os.wallpaperId === w.id ? "ring-blue-600" : "ring-transparent group-hover:ring-zinc-300"}`}
              style={{ background: w.css }}
            />
            <span className="mt-1.5 block text-xs text-zinc-500">{w.name}</span>
          </button>
        ))}
      </div>

      <h3 className="mt-6 text-sm font-semibold text-zinc-500">About NurOS</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        NurOS 2.0 is my portfolio, built from scratch with Next.js 16, TypeScript, Tailwind CSS and Supabase. The
        Terminal&apos;s AI uses the Claude API with retrieval over my own content. The wallpapers are live: try moving your cursor, dragging a window to a screen edge, or right-clicking the desktop.
      </p>
    </div>
  );
}
