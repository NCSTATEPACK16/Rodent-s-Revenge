/**
 * Typed client for the leaderboard API. In production the API is a Netlify
 * Function served at `/api/scores` on the same origin, so no base URL is needed.
 * `VITE_API_URL` can override the base (e.g. to hit a deployed site's API while
 * running the frontend locally).
 */

const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export type ScoreEntry = {
  id: number
  name: string
  score: number
  levels_cleared: number
  created_at: string
}

export type ScoreSubmission = {
  name: string
  score: number
  levels_cleared: number
}

export async function fetchScores(limit = 10): Promise<ScoreEntry[]> {
  const res = await fetch(`${API_URL}/scores?limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to load scores (${res.status})`)
  return (await res.json()) as ScoreEntry[]
}

export async function submitScore(entry: ScoreSubmission): Promise<ScoreEntry> {
  const res = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  if (!res.ok) throw new Error(`Failed to submit score (${res.status})`)
  return (await res.json()) as ScoreEntry
}
