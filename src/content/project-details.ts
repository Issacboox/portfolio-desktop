// "How it works" write-ups for each project: architecture, data and deployment.
// Written from each project's own repo and docs. Projects without an entry just show their summary.

export type ProjectDetails = {
  /** Request / data flow, drawn as a diagram. */
  flow: { title: string; body?: string }[];
  how: string[];
  data: string[];
  deploy: string[];
};

export const projectDetails: Record<string, ProjectDetails> = {
  "nuros-portfolio": {
    flow: [
      { title: "Browser", body: "NurOS desktop (React 19)" },
      { title: "Next.js 16", body: "on Vercel" },
      { title: "/api/v1/chat", body: "keyword search over my content" },
      { title: "Free LLM", body: "Groq / Gemini / Ollama" },
      { title: "Answer + sources", body: "[1] [2] citations" },
    ],
    how: [
      "The desktop (windows, dock, Spotlight, phone home screen) is a client-only React app; a reducer manages open windows and their stacking order.",
      "The page also server-renders a hidden text summary and JSON-LD, so search engines and screen readers get real content.",
      "The Terminal AI is retrieval-augmented: it splits my profile, projects, blog and Markdown docs into passages, ranks them with BM25 and sends the best ones to an OpenAI-compatible model, which must cite them.",
      "The 3D avatar is built by a Blender Python script, exported as glTF and animated with React Three Fiber, rendering only when something moves.",
      "Installable as a PWA with a service worker, web manifest and app shortcuts.",
    ],
    data: [
      "Content lives in typed TypeScript files today, so the site and the AI read the same source.",
      "A Supabase (PostgreSQL) schema is ready for the next step: profile sections, projects, posts, knowledge chunks with pgvector, chat sessions and messages, managed through SQL migrations.",
      "AI rate limits (per visitor and per day) protect the free model quota.",
    ],
    deploy: [
      "Hosted on Vercel, deployed from GitHub on every push.",
      "Every change passes TypeScript, ESLint and a production build first.",
      "Secrets (AI key, Supabase keys) live in Vercel environment variables, never in the repo.",
      "Database changes go through Supabase CLI migrations.",
    ],
  },

  "discord-team-bot": {
    flow: [
      { title: "Discord", body: "@mention, /ask, /jira, /file…" },
      { title: "Bot (Node.js)", body: "discord.js, Docker" },
      { title: "Claude API", body: "answers in threads" },
      { title: "Team tools", body: "Jira, Azure DevOps, Jenkins, Google" },
      { title: "Admin web", body: "React + Express, localhost" },
    ],
    how: [
      "Answers questions with Claude when mentioned or via /ask, opening a thread that keeps the conversation's context. No tools are given to the model, so it can't touch code, databases or servers.",
      "Only works in allowed channels and for allowed roles or people, with a per-user cooldown and replies split to Discord's 2,000-character limit.",
      "Read-only /jira and /ado commands, Jira and Jenkins alerts posted as cards, calendar reminders, scheduled messages, a time clock and team games.",
      "Every file posted in chosen channels is copied to a Google Shared Drive (organised by channel and month, with versions and previews), with /file search and browse inside Discord.",
      "An admin web (React) controls channels, models, prompts, permissions and schedules, and shows usage, cost estimates and health. Changes apply live.",
    ],
    data: [
      "No database server: settings and state are JSON / JSON Lines files (config, usage, audit log, alert state, file index) in a Docker volume.",
      "A daily backup copies the data folder to a host folder that can sit on a synced or second disk.",
      "Usage tracking stores IDs and counts only, never message text.",
      "Secrets come from .env and a read-only secrets mount at runtime; they are never baked into the image or shown in the admin web.",
    ],
    deploy: [
      "Multi-stage Dockerfile: Vite builds the React admin, then a slim Node 24 image runs the bot as a non-root user.",
      "Docker Compose with restart unless-stopped, log rotation, and the admin port published on 127.0.0.1 only.",
      "Jenkins pipeline builds the image, syntax-checks the code inside it, and posts the result to a Discord channel through a webhook.",
    ],
  },

  "private-llm-platform": {
    flow: [
      { title: "Browser", body: "React 19 console" },
      { title: "Next.js 16 API", body: "/api/* route handlers" },
      { title: "LLM server", body: "Ollama now, vLLM later" },
      { title: "Postgres + pgvector", body: "knowledge, evals" },
      { title: "SearXNG", body: "optional web search" },
    ],
    how: [
      "The browser never talks to the model server directly; every call goes through Next.js routes, so the model and its API key stay private.",
      "Only OpenAI-compatible endpoints are required, so the same app runs on Ollama on a PC today and vLLM on a GPU server later.",
      "Streaming chat with speed stats (tokens/s, time to first token), compare mode across models, and reasoning shown separately.",
      "Knowledge bases: upload PDF, Word, CSV and more; documents are chunked, embedded with bge-m3 and searched, and answers cite their sources.",
      "Evals: question sets with expected answers, run against several models with an optional LLM judge, reporting pass rate and speed.",
    ],
    data: [
      "PostgreSQL 17 with pgvector in Docker stores knowledge bases, document chunks with embeddings, and eval sets; the schema is created on first run.",
      "Falls back to JSON files when no database is configured, so it runs with zero setup.",
      "Roles, permissions per knowledge base, usage limits and an audit log.",
    ],
    deploy: [
      "Docker Compose for the app, the database and the search engine.",
      "GitHub Actions CI on every push: secrets scan, TypeScript, ESLint, npm audit, build, a non-root image with no secrets inside, a Trivy vulnerability scan and a security smoke test.",
      "Dependabot opens weekly update PRs for packages, the base image and Actions.",
      "Production plan: Linux + NVIDIA GPU running vLLM, behind Caddy with HTTPS inside the LAN.",
    ],
  },

  "maru-desk": {
    flow: [
      { title: "Shop owner", body: "browser / phone" },
      { title: "Next.js app", body: "quotes, invoices, receipts" },
      { title: "PostgreSQL", body: "Docker on a VPS" },
      { title: "Customer", body: "pays by PromptPay QR" },
    ],
    how: [
      "Create quotes, invoices and receipts in a few clicks, with a PromptPay QR printed on the invoice so customers can pay straight away.",
      "Track who has paid and who still owes, instead of Excel and chasing people in chat.",
      "Thai and English interface.",
    ],
    data: ["PostgreSQL runs as its own container on the VPS; the same database server also hosts my other apps, each in its own schema."],
    deploy: [
      "Runs on a VPS with Docker Compose.",
      "Jenkins builds and deploys it automatically; the same Jenkins also deploys JoybiniTour.",
    ],
  },

  joybinitour: {
    flow: [
      { title: "Customer site", body: "Next.js 16" },
      { title: ".NET 10 API", body: "modular monolith" },
      { title: "Redis", body: "15-min seat holds" },
      { title: "Omise", body: "card + PromptPay" },
      { title: "Voucher", body: "PDF with QR, email / LINE" },
    ],
    how: [
      "Product → Option → Slot → Price category, like the big tour marketplaces. Every price stores net (cost) and sell, so each booking knows its margin.",
      "Booking validates cut-off and group limits, prices the cart (seasonal and group rules, fees, pickup surcharge, promo codes) and holds seats in Redis for 15 minutes with an atomic Lua script; a Hangfire job releases expired holds.",
      "Payment webhooks are never trusted: the API re-reads the charge from Omise before confirming, then moves seats into the slot with optimistic concurrency.",
      "A booking state machine (unit-tested) drives confirmation, cancellation and refunds by policy. Scheduled jobs send reminders, complete past tours and keep 180 days of slots generated.",
      "Back office for the ops team: products and schedules, pickup zones, suppliers, bookings and manual payments, daily manifest, refunds, promo codes, reports, roles with 2FA and an audit log.",
    ],
    data: [
      "PostgreSQL through EF Core 10, in its own schema on a shared Postgres server.",
      "Redis for seat holds (in-memory fallback for a single instance).",
      "ASP.NET Identity with JWT and TOTP 2FA; PDPA export and erasure for customers.",
    ],
    deploy: [
      "pnpm monorepo: customer site, back office, shared UI and shared TypeScript types, plus the .NET solution.",
      "GitHub Actions CI builds and tests the .NET API (xUnit) and type-checks and builds both Next.js apps.",
      "Jenkins builds Docker images, keeps the previous image as a rollback tag, deploys with Docker Compose on the VPS and rolls back if the deploy fails.",
      "Caddy serves the site and back office behind Cloudflare.",
    ],
  },
};
