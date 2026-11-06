-- Portfolio: initial schema
-- Content (profile, projects, posts), RAG knowledge base (pgvector), chat logs, job-fit reports.

create extension if not exists vector with schema extensions;

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admins: users allowed to write content (you).
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------- content ----------
create table public.profile_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,            -- e.g. 'summary', 'experience', 'skills', 'faq', 'visa'
  title text not null,
  body_md text not null default '',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  role text,
  stack text[] not null default '{}',
  problem text,
  approach text,
  result text,
  repo_url text,
  live_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.post_status as enum ('draft', 'published');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_md text not null default '',
  summary text,                        -- AI TL;DR, generated on publish
  tags text[] not null default '{}',
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_published_idx on public.posts (status, published_at desc);

-- ---------- RAG knowledge base ----------
create type public.source_type as enum ('profile', 'project', 'post');

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type public.source_type not null,
  source_id uuid not null,
  chunk_index int not null,
  content text not null,
  embedding extensions.vector(1024),   -- Voyage AI voyage-3.5 = 1024 dims
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, chunk_index)
);
create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- Top-k similarity search, called from the server with the secret key.
create or replace function public.match_knowledge_chunks(
  query_embedding extensions.vector(1024),
  match_count int default 6,
  min_similarity float default 0.3
)
returns table (
  id uuid,
  source_type public.source_type,
  source_id uuid,
  content text,
  similarity float
)
language sql stable set search_path = ''
as $$
  select c.id, c.source_type, c.source_id, c.content,
         1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.knowledge_chunks c
  where c.embedding is not null
    and 1 - (c.embedding operator(extensions.<=>) query_embedding) >= min_similarity
  order by c.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

-- ---------- chat + job fit ----------
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_hash text not null,          -- hashed IP + UA, never the raw IP (UK GDPR)
  page text,
  country text,
  started_at timestamptz not null default now()
);

create type public.chat_role as enum ('user', 'assistant');

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role public.chat_role not null,
  content text not null,
  cited_chunk_ids uuid[] not null default '{}',
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);
create index chat_messages_session_idx on public.chat_messages (session_id, created_at);

create table public.fit_reports (
  id uuid primary key default gen_random_uuid(),
  job_description text not null,
  result jsonb not null,
  email text,
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create trigger profile_sections_updated_at before update on public.profile_sections
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create trigger knowledge_chunks_updated_at before update on public.knowledge_chunks
  for each row execute function public.set_updated_at();

-- ---------- row level security ----------
alter table public.admins            enable row level security;
alter table public.profile_sections  enable row level security;
alter table public.projects          enable row level security;
alter table public.posts             enable row level security;
alter table public.knowledge_chunks  enable row level security;
alter table public.chat_sessions     enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.fit_reports       enable row level security;

-- Public can read published content.
create policy "public read profile" on public.profile_sections
  for select using (true);
create policy "public read published projects" on public.projects
  for select using (published or public.is_admin());
create policy "public read published posts" on public.posts
  for select using (status = 'published' or public.is_admin());

-- Admin can write content.
create policy "admin write profile" on public.profile_sections
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write projects" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write posts" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Admin can read logs and reports; inserts happen server-side with the secret key.
create policy "admin read chat sessions" on public.chat_sessions
  for select using (public.is_admin());
create policy "admin read chat messages" on public.chat_messages
  for select using (public.is_admin());
create policy "admin read fit reports" on public.fit_reports
  for select using (public.is_admin());
create policy "admin read admins" on public.admins
  for select using (public.is_admin());
-- knowledge_chunks: no public policies; only the server (secret key) touches it.
