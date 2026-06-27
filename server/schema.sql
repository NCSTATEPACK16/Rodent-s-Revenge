-- Vermin's Vengeance leaderboard schema (Supabase / PostgreSQL).
-- Run this once in the Supabase SQL editor (or psql) before starting the API.

create table if not exists leaderboard (
  id             bigint generated always as identity primary key,
  name           text        not null check (char_length(name) between 1 and 20),
  score          integer     not null check (score >= 0),
  levels_cleared integer     not null default 0 check (levels_cleared >= 0),
  created_at     timestamptz not null default now()
);

-- Fast "top N" reads: highest score first, earliest submission breaks ties.
create index if not exists leaderboard_score_idx
  on leaderboard (score desc, created_at asc);
