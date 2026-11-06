import type { LucideIcon } from "lucide-react";

/** macOS-style squircle app icon: soft gradient, inner highlight, white glyph. */
export function AppIcon({
  icon: Icon,
  from,
  to,
  size = 56,
  className = "",
}: {
  icon: LucideIcon;
  from: string;
  to: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.45),inset_0_0_0_0.5px_rgba(255,255,255,0.25)] ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      <Icon className="relative text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.9} />
    </span>
  );
}
