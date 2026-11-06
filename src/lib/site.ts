/**
 * The public URL of the site, used for canonical links, Open Graph images, the sitemap and robots.
 * Set NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel it falls back to the
 * project's production domain automatically.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const siteName = "NurOS — Nurarat Sangreuang";
export const siteDescription =
  "Portfolio of Nurarat Sangreuang (Maru), a full-stack .NET & Next.js developer in Bangkok. Open to UK roles with visa sponsorship, or remote. Explore NurOS, a desktop in your browser, and read posts on .NET, AI, SEO and CI/CD.";
