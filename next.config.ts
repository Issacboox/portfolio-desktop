import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The AI chat reads Markdown files from src/content/docs at runtime; ship them with the function.
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
