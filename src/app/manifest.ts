import type { MetadataRoute } from "next";
import { siteDescription } from "@/lib/site";

// Makes NurOS installable as an app (desktop and phone), with its own window and icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "NurOS — Nurarat Sangreuang",
    short_name: "NurOS",
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: "#0d0b1e",
    theme_color: "#f7d9cd",
    categories: ["portfolio", "productivity", "developer"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Projects", url: "/?app=projects", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Ask my AI", url: "/?app=terminal", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Blog", url: "/?app=blog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
