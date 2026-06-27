"""Vermin's Vengeance leaderboard API.

A small FastAPI service backed by PostgreSQL (Supabase). It exposes two routes:

    GET  /scores?limit=N   -> top N scores (highest first)
    POST /scores           -> submit a score

Configuration comes from environment variables (see .env.example):

    DATABASE_URL      standard Postgres connection string (Supabase pooler URL)
    ALLOWED_ORIGINS   comma-separated list of allowed CORS origins (the Netlify site)
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

import asyncpg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DATABASE_URL = os.environ.get("DATABASE_URL", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

SCHEMA = """
create table if not exists leaderboard (
  id             bigint generated always as identity primary key,
  name           text        not null check (char_length(name) between 1 and 20),
  score          integer     not null check (score >= 0),
  levels_cleared integer     not null default 0 check (levels_cleared >= 0),
  created_at     timestamptz not null default now()
);
create index if not exists leaderboard_score_idx
  on leaderboard (score desc, created_at asc);
"""


class ScoreIn(BaseModel):
    name: str = Field(min_length=1, max_length=20)
    score: int = Field(ge=0)
    levels_cleared: int = Field(ge=0, default=0)


class ScoreOut(BaseModel):
    id: int
    name: str
    score: int
    levels_cleared: int
    created_at: str


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with app.state.pool.acquire() as conn:
        await conn.execute(SCHEMA)
    try:
        yield
    finally:
        await app.state.pool.close()


app = FastAPI(title="Vermin's Vengeance Leaderboard", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _row_to_score(row: asyncpg.Record) -> ScoreOut:
    return ScoreOut(
        id=row["id"],
        name=row["name"],
        score=row["score"],
        levels_cleared=row["levels_cleared"],
        created_at=row["created_at"].isoformat(),
    )


@app.get("/")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/scores", response_model=list[ScoreOut])
async def get_scores(limit: int = Query(default=10, ge=1, le=100)) -> list[ScoreOut]:
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch(
            """
            select id, name, score, levels_cleared, created_at
            from leaderboard
            order by score desc, created_at asc
            limit $1
            """,
            limit,
        )
    return [_row_to_score(r) for r in rows]


@app.post("/scores", response_model=ScoreOut, status_code=201)
async def post_score(entry: ScoreIn) -> ScoreOut:
    try:
        async with app.state.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                insert into leaderboard (name, score, levels_cleared)
                values ($1, $2, $3)
                returning id, name, score, levels_cleared, created_at
                """,
                entry.name.strip(),
                entry.score,
                entry.levels_cleared,
            )
    except asyncpg.PostgresError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _row_to_score(row)
