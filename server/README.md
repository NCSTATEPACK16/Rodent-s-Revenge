# Vermin's Vengeance — Leaderboard API

FastAPI + PostgreSQL (Supabase) service powering the global leaderboard.

## Endpoints

- `GET /` — health check.
- `GET /scores?limit=10` — top N scores (highest first, ties broken by earliest submission).
- `POST /scores` — submit `{ "name": str(1..20), "score": int>=0, "levels_cleared": int>=0 }`.

## Local development

```bash
cd server
python -m venv .venv
. .venv/Scripts/activate     # Windows; use .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # then fill in DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

The frontend reads `VITE_API_URL` (e.g. `http://localhost:8000`). Set it in the
frontend `.env` to enable the leaderboard UI.

## Database

Run [`schema.sql`](./schema.sql) once in the Supabase SQL editor (the app also
creates the table on startup if it is missing).

## Deploy (Render)

See [`render.yaml`](./render.yaml). Set `DATABASE_URL` (Supabase pooler URL) and
`ALLOWED_ORIGINS` (your Netlify origin) as environment variables on the service.
