import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

/**
 * NurOS app icons: iOS-familiar proportions (squircle, soft depth, single bold symbol) but
 * original artwork, drawn as SVG at 100×100 so they stay crisp at any size.
 */
function Art({ id, uid }: { id: string; uid: string }): ReactNode {
  const g = (n: string) => `${uid}-${n}`;
  switch (id) {
    case "about":
      // A little portrait of me: bob haircut with bangs, rosy cheeks.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb38a" />
              <stop offset="1" stopColor="#f2545b" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <circle cx="50" cy="118" r="44" fill="#fff4ec" />
          <path d="M14 112c4-22 18-30 36-30s32 8 36 30" fill="#f6f1ea" />
          <path d="M18 98h64M20 106h60" stroke="#2a2230" strokeWidth="3.4" opacity="0.85" />
          <path d="M23 70c-4-30 8-48 27-48s31 18 27 48c-3 6-9 7-12 4V52H35v22c-3 3-9 2-12-4z" fill="#241c1f" />
          <ellipse cx="50" cy="51" rx="19" ry="21" fill="#f2c4a0" />
          <path d="M30 46c2-15 11-22 20-22s19 7 20 22c-7-6-14-8-20-8s-13 2-20 8z" fill="#241c1f" />
          <circle cx="43" cy="52" r="2.4" fill="#241c1f" />
          <circle cx="57" cy="52" r="2.4" fill="#241c1f" />
          <ellipse cx="39" cy="59" rx="3.6" ry="2.2" fill="#f48b8b" opacity="0.8" />
          <ellipse cx="61" cy="59" rx="3.6" ry="2.2" fill="#f48b8b" opacity="0.8" />
          <path d="M45 61c3 3.5 7 3.5 10 0" stroke="#9b2f35" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      );
    case "projects":
      // A folder with project cards peeking out.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6f3ff" />
              <stop offset="1" stopColor="#bcdcfb" />
            </linearGradient>
            <linearGradient id={g("front")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5cb2ff" />
              <stop offset="1" stopColor="#2f73f2" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <path d="M16 30a5 5 0 0 1 5-5h20l6 6h32a5 5 0 0 1 5 5v40H16z" fill="#2a64d6" />
          <rect x="26" y="27" width="30" height="34" rx="4" fill="#fff" transform="rotate(-8 41 44)" />
          <rect x="44" y="25" width="30" height="34" rx="4" fill="#ffd166" transform="rotate(7 59 42)" />
          <rect x="30" y="33" width="16" height="3" rx="1.5" fill="#ff7a59" transform="rotate(-8 41 44)" />
          <path d="M14 44a5 5 0 0 1 5-5h62a5 5 0 0 1 5 5l-3 30a6 6 0 0 1-6 5H23a6 6 0 0 1-6-5z" fill={`url(#${g("front")})`} />
          <path d="M18 46h64" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" />
        </>
      );
    case "terminal":
      // Dark glass with a prompt and a warm cursor.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a3a46" />
              <stop offset="1" stopColor="#0c0c12" />
            </linearGradient>
            <pattern id={g("grid")} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0v10" fill="none" stroke="#fff" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <rect width="100" height="100" fill={`url(#${g("grid")})`} />
          <circle cx="20" cy="20" r="3.2" fill="#ff6b5f" />
          <circle cx="30" cy="20" r="3.2" fill="#ffc048" />
          <circle cx="40" cy="20" r="3.2" fill="#3ccf6a" />
          <path d="M24 42l14 11-14 11" stroke="#7cf0b0" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="46" y="60" width="26" height="7" rx="3.5" fill="#ff9a4d" />
        </>
      );
    case "blog":
      // An open notebook with a ribbon bookmark.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe9a8" />
              <stop offset="1" stopColor="#ffb547" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <path d="M50 30c-9-6-20-7-32-5v47c12-2 23-1 32 5z" fill="#fffdf8" />
          <path d="M50 30c9-6 20-7 32-5v47c-12-2-23-1-32 5z" fill="#fff7ea" />
          <path d="M50 30v47" stroke="#e7d6bd" strokeWidth="1.5" />
          <path d="M25 39c7-1 13 0 19 2M25 47c7-1 13 0 19 2M25 55c7-1 13 0 19 2M56 41c6-2 12-3 19-2M56 49c6-2 12-3 19-2" stroke="#c9b79c" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 26v24l5-4 5 4V24" fill="#f2545b" />
        </>
      );
    case "mail":
      // A paper plane leaving a dotted trail.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6ef2d0" />
              <stop offset="1" stopColor="#0f9488" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <path d="M18 70c8-4 14-4 20 0" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" strokeDasharray="3 5" fill="none" strokeLinecap="round" />
          <path d="M22 50l58-26-16 56-14-18z" fill="#fff" />
          <path d="M50 62l30-38-36 30z" fill="#d6f7f0" />
          <path d="M50 62l-3 14 10-8z" fill="#b5ebe0" />
        </>
      );
    case "settings":
      // A precision dial instead of a gear.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c9cbd3" />
              <stop offset="1" stopColor="#6c6f7c" />
            </linearGradient>
            <radialGradient id={g("knob")} cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#b9bcc6" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <circle cx="50" cy="50" r="31" fill="#3d3f4a" />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1="50" y1="21.5" x2="50" y2={i % 6 === 0 ? 28 : 25.5} stroke="#fff" strokeOpacity={i % 6 === 0 ? 0.95 : 0.5} strokeWidth={i % 6 === 0 ? 2.4 : 1.4} strokeLinecap="round" transform={`rotate(${i * 15} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="17" fill={`url(#${g("knob")})`} />
          <rect x="48" y="35" width="4" height="10" rx="2" fill="#ff7a3d" transform="rotate(40 50 50)" />
        </>
      );
    case "github":
      // A branch graph: commits splitting and merging.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4b4b57" />
              <stop offset="1" stopColor="#16161c" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <path d="M34 22v56M34 40c0 14 32 6 32 22v0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="24" r="7" fill="#7cf0b0" stroke="#16161c" strokeWidth="3" />
          <circle cx="34" cy="76" r="7" fill="#fff" stroke="#16161c" strokeWidth="3" />
          <circle cx="66" cy="62" r="7" fill="#ff9a4d" stroke="#16161c" strokeWidth="3" />
        </>
      );
    case "linkedin":
      // A briefcase with a name tag.
      return (
        <>
          <defs>
            <linearGradient id={g("bg")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5aa9ff" />
              <stop offset="1" stopColor="#1d4fd8" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${g("bg")})`} />
          <path d="M40 32v-4a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v4" stroke="#fff" strokeWidth="5" fill="none" />
          <rect x="18" y="32" width="64" height="44" rx="9" fill="#fff" />
          <path d="M18 48h64" stroke="#cfe1ff" strokeWidth="3" />
          <rect x="44" y="44" width="12" height="9" rx="2.5" fill="#1d4fd8" />
        </>
      );
    default:
      return null;
  }
}

const ART = new Set(["about", "projects", "terminal", "blog", "mail", "settings", "github", "linkedin"]);

/** Squircle app icon: original artwork when we have it, otherwise a gradient with a glyph. */
export function AppIcon({
  art,
  icon: Icon,
  from,
  to,
  size = 56,
  className = "",
}: {
  art?: string;
  icon: LucideIcon;
  from: string;
  to: string;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const hasArt = art && ART.has(art);
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[23%] shadow-[0_8px_16px_-8px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.25)] ${className}`}
      style={{ width: size, height: size, background: hasArt ? undefined : `linear-gradient(160deg, ${from}, ${to})` }}
    >
      {hasArt ? (
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <Art id={art} uid={uid} />
        </svg>
      ) : (
        <Icon className="relative text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.9} />
      )}
      {/* soft top sheen + hairline edge, the "glass" that makes it feel native */}
      <span className="pointer-events-none absolute inset-0 rounded-[23%] bg-gradient-to-b from-white/25 via-transparent to-black/10" />
      <span className="pointer-events-none absolute inset-0 rounded-[23%] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]" />
    </span>
  );
}
