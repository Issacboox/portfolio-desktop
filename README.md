# Portfolio — Nurarat Sangreuang

AI-powered portfolio and blog. Full-stack Next.js (App Router) + Supabase (Postgres, pgvector, Auth).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4, shadcn/ui)
- **Supabase** — Postgres + pgvector for RAG, Auth for the admin area, project `portfolio` (London)
- **Claude API** for the AI features (later phases), **Voyage AI** for embeddings

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values from the Supabase dashboard
npm run dev
```

Open http://localhost:3000 — `GET /api/v1/health` checks the database connection.

## Database

Migrations live in `supabase/migrations`.

| Script | Does |
| --- | --- |
| `npm run db:new <name>` | Create a new migration file |
| `npm run db:push` | Apply migrations to the remote Supabase project (needs `SUPABASE_DB_PASSWORD`) |
| `npm run db:types` | Regenerate `src/lib/supabase/database.types.ts` |

To make yourself admin: sign up once, then in the SQL editor run
`insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`

## Project structure

```
src/
  app/            routes (pages + /api/v1 Route Handlers)
  components/ui/  shadcn/ui components
  lib/supabase/   client.ts (browser) · server.ts (RSC/handlers) · admin.ts (secret key) · proxy.ts
  proxy.ts        refreshes the auth session, guards /admin
supabase/
  migrations/     SQL schema: content, knowledge_chunks (vector 1024), chat logs, fit reports
```
