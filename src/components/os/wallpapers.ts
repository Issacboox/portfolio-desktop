export type Wallpaper = {
  id: string;
  name: string;
  /** Static mesh gradient: used for thumbnails, the lock screen blur and reduced-motion visitors. */
  css: string;
  dark: boolean;
  /** Base colour under the living (animated) wallpaper. */
  base: string;
  /** Four colours for the drifting light blobs of the living wallpaper. */
  blobs: [string, string, string, string];
};

// Pure CSS mesh gradients: crisp at any size, zero image weight.
export const wallpapers: Wallpaper[] = [
  {
    id: "sunrise",
    name: "Sunrise",
    dark: false,
    base: "#f7d9cd",
    blobs: ["#ff9f80", "#b9a6ff", "#ffb8dc", "#8fd3ff"],
    css: "radial-gradient(at 12% 18%, #ffb59e 0, transparent 46%), radial-gradient(at 86% 8%, #b9a6ff 0, transparent 48%), radial-gradient(at 78% 86%, #ffc7e5 0, transparent 50%), radial-gradient(at 8% 92%, #9bd8ff 0, transparent 48%), radial-gradient(at 48% 50%, #fff1e6 0, transparent 60%), #f7d9cd",
  },
  {
    id: "midnight",
    name: "Midnight",
    dark: true,
    base: "#0d0b1e",
    blobs: ["#6d3bd6", "#e0527a", "#ff8a4c", "#1f6fd1"],
    css: "radial-gradient(at 15% 20%, #6d3bd6 0, transparent 45%), radial-gradient(at 85% 15%, #e0527a 0, transparent 42%), radial-gradient(at 70% 85%, #ff9a5a 0, transparent 45%), radial-gradient(at 10% 85%, #1f6fd1 0, transparent 45%), #0d0b1e",
  },
  {
    id: "aurora",
    name: "Aurora",
    dark: true,
    base: "#04121a",
    blobs: ["#1ee3a4", "#2b7cff", "#8b5cf6", "#0fb5c9"],
    css: "radial-gradient(at 20% 25%, #1ee3a4 0, transparent 42%), radial-gradient(at 80% 20%, #2b7cff 0, transparent 44%), radial-gradient(at 70% 85%, #8b5cf6 0, transparent 44%), radial-gradient(at 15% 85%, #0fb5c9 0, transparent 42%), #04121a",
  },
  {
    id: "mint",
    name: "Mint",
    dark: false,
    base: "#e6f6f0",
    blobs: ["#9ef0c9", "#9ccfff", "#fde68a", "#c4b5fd"],
    css: "radial-gradient(at 20% 20%, #b8f3d8 0, transparent 48%), radial-gradient(at 85% 20%, #a7d8ff 0, transparent 46%), radial-gradient(at 75% 85%, #fde68a 0, transparent 44%), radial-gradient(at 10% 85%, #c4b5fd 0, transparent 46%), #e6f6f0",
  },
  {
    id: "graphite",
    name: "Graphite",
    dark: true,
    base: "#111113",
    blobs: ["#3f3f46", "#52525b", "#ff5a36", "#27272a"],
    css: "radial-gradient(at 20% 15%, #3f3f46 0, transparent 50%), radial-gradient(at 85% 85%, #52525b 0, transparent 50%), radial-gradient(at 60% 40%, #27272a 0, transparent 60%), #111113",
  },
];
