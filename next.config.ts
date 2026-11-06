import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The AI chat reads Markdown files from src/content/docs at runtime; ship them with the function.
  // Files in /public have no content hash, so cache them for a day and refresh quietly in the background.
  // Without this Vercel serves them with max-age=0 and the browser re-checks the 3D model and images on every visit.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/models/:path*", headers: cache },
      { source: "/images/:path*", headers: cache },
      { source: "/icons/:path*", headers: cache },
      { source: "/cv/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] },
    ];
  },
  outputFileTracingIncludes: {
    "/api/v1/chat": ["./src/content/docs/**/*"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
