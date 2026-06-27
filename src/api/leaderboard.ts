/**
 * Typed client for the leaderboard API (FastAPI). The base URL comes from
 * `VITE_API_URL`; when it is unset the leaderboard is treated as offline so the
 * game stays fully playable without a backend.
 */

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

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

export function isLeaderboardEnabled(): boolean {
  return Boolean(API_URL)
}

export async function fetchScores(limit = 10): Promise<ScoreEntry[]> {
  if (!API_URL) throw new Error('Leaderboard is offline')
  const res = await fetch(`${API_URL}/scores?limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to load scores (${res.status})`)
  return (await res.json()) as ScoreEntry[]
}

export async function submitScore(entry: ScoreSubmission): Promise<ScoreEntry> {
  if (!API_URL) throw new Error('Leaderboard is offline')
  const res = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  if (!res.ok) throw new Error(`Failed to submit score (${res.status})`)
  return (await res.json()) as ScoreEntry
}
