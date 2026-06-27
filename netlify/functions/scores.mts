// Netlify Function (v2) backing the global leaderboard.
//
//   GET  /api/scores?limit=N   -> top N scores (highest first)
//   POST /api/scores           -> submit { name, score, levels_cleared }
//
// Runs server-side on Netlify with the Supabase SERVICE ROLE key (which bypasses
// Row Level Security), so the database credential is never exposed to the client
// and clients cannot write directly to the table.
//
// Required Netlify environment variables:
//   SUPABASE_SERVICE_ROLE_KEY  (secret — from Supabase → Project Settings → API)
//   SUPABASE_URL               (optional — defaults to the project ref below)

import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? 'iytniuygdkwxxmtdkmlj'
const SUPABASE_URL = process.env.SUPABASE_URL ?? `https://${PROJECT_REF}.supabase.co`
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const COLUMNS = 'id,name,score,levels_cleared,created_at'

export default async (req: Request): Promise<Response> => {
  if (!SERVICE_KEY) {
    return json({ error: 'Leaderboard not configured (missing service key)' }, 500)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  })

  if (req.method === 'GET') {
    const limit = clampInt(new URL(req.url).searchParams.get('limit'), 10, 1, 100)
    const { data, error } = await supabase
      .from('leaderboard')
      .select(COLUMNS)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) return json({ error: error.message }, 500)
    return json(data ?? [], 200)
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const name = String(body.name ?? '').trim().slice(0, 20)
    const score = Math.floor(Number(body.score))
    const levels = Math.floor(Number(body.levels_cleared ?? 0))

    if (name.length < 1) return json({ error: 'name is required (1-20 chars)' }, 400)
    if (!Number.isFinite(score) || score < 0)
      return json({ error: 'score must be an integer >= 0' }, 400)
    if (!Number.isFinite(levels) || levels < 0)
      return json({ error: 'levels_cleared must be an integer >= 0' }, 400)

    const { data, error } = await supabase
      .from('leaderboard')
      .insert({ name, score, levels_cleared: levels })
      .select(COLUMNS)
      .single()
    if (error) return json({ error: error.message }, 500)
    return json(data, 201)
  }

  return json({ error: 'Method not allowed' }, 405)
}

// Netlify v2 routing: this function serves /api/scores directly (no redirect).
export const config = { path: '/api/scores' }

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    },
  })
}

function clampInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = value == null ? fallback : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(n)))
}
