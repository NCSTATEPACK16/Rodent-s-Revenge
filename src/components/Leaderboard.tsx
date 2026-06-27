import { useCallback, useEffect, useState } from 'react'
import {
  fetchScores,
  isLeaderboardEnabled,
  submitScore,
  type ScoreEntry,
  type ScoreSubmission,
} from '../api/leaderboard'

type LeaderboardProps = {
  /** When provided, shows a one-time submit form for this run's result. */
  submission?: ScoreSubmission
}

const panel =
  'w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/70 p-4 font-mono text-xs text-slate-400'

export function Leaderboard({ submission }: LeaderboardProps) {
  const enabled = isLeaderboardEnabled()
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done'>('idle')

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      setScores(await fetchScores(10))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load scores')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // Initial fetch. State is only set in the async continuation (after await),
  // not synchronously in the effect body, so it doesn't cascade renders.
  useEffect(() => {
    if (!enabled) return
    let active = true
    fetchScores(10)
      .then((s) => active && setScores(s))
      .catch(
        (e) =>
          active &&
          setError(e instanceof Error ? e.message : 'Failed to load scores'),
      )
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [enabled])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submission || submitState !== 'idle') return
    const trimmed = name.trim().slice(0, 20) || 'Anon'
    setSubmitState('sending')
    try {
      await submitScore({ ...submission, name: trimmed })
      setSubmitState('done')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
      setSubmitState('idle')
    }
  }

  if (!enabled) {
    return (
      <div className={panel}>
        <p className="text-slate-500">
          Leaderboard offline — set <code>VITE_API_URL</code> to enable global scores.
        </p>
      </div>
    )
  }

  return (
    <div className={`${panel} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-slate-200">Global leaderboard</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          Refresh
        </button>
      </div>

      {submission && submitState !== 'done' && (
        <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 outline-none focus:border-amber-500/60"
          />
          <button
            type="submit"
            disabled={submitState === 'sending'}
            className="rounded border border-amber-500/50 bg-amber-950/40 px-3 py-1 font-semibold text-amber-200 transition hover:border-amber-400/80 disabled:opacity-50"
          >
            {submitState === 'sending'
              ? 'Saving…'
              : `Submit ${submission.score.toLocaleString()}`}
          </button>
        </form>
      )}
      {submission && submitState === 'done' && (
        <p className="text-emerald-300">Score submitted!</p>
      )}

      {loading && <p className="text-slate-500">Loading scores…</p>}
      {error && <p className="text-rose-400">{error}</p>}

      {!loading && !error && scores.length === 0 && (
        <p className="text-slate-500">No scores yet — be the first!</p>
      )}

      {scores.length > 0 && (
        <ol className="flex flex-col gap-1">
          {scores.map((s, i) => (
            <li
              key={s.id}
              className="flex items-baseline justify-between gap-2 tabular-nums"
            >
              <span className="text-slate-500">{i + 1}.</span>
              <span className="flex-1 truncate text-slate-300">{s.name}</span>
              <span className="text-slate-500">Lv {s.levels_cleared}</span>
              <span className="font-semibold text-amber-200">
                {s.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
