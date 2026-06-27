-- Vermin's Vengeance leaderboard schema (Supabase / PostgreSQL).
-- Run this once in the Supabase SQL editor before deploying.

create table if not exists public.leaderboard (
  id             bigint generated always as identity primary key,
  name           text        not null check (char_length(name) between 1 and 20),
  score          integer     not null check (score >= 0),
  levels_cleared integer     not null default 0 check (levels_cleared >= 0),
  created_at     timestamptz not null default now()
);

-- Fast "top N" reads: highest score first, earliest submission breaks ties.
create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, created_at asc);

-- Lock the table down: only the service-role key (used by the Netlify Function)
-- can read/write. No anon/public policies are created, so the anon key cannot
-- touch the table directly. The service role bypasses RLS.
alter table public.leaderboard enable row level security;
