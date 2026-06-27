/**
 * Pure leaderboard scoring. Distinct from the in-grid `snapshot.score` (raw
 * cheese points): the final score rewards progress (levels cleared), activity
 * (blocks moved), the cheese collected, and speed (a decaying time bonus).
 * Deterministic and side-effect free so it can be unit-tested and reused on iOS.
 */

export const POINTS_PER_LEVEL = 1000
export const POINTS_PER_BLOCK = 5
/** Time bonus decays linearly from this cap (in ms) to zero. */
export const TIME_BONUS_CAP_MS = 10 * 60 * 1000

export type ScoreInput = {
  /** Levels fully cleared this run. */
  levelsCleared: number
  /** Raw cheese points from the snapshot. */
  cheesePoints: number
  /** Number of block-push events. */
  blocksMoved: number
  /** Wall-clock duration of the run, in milliseconds. */
  elapsedMs: number
}

export function computeScore({
  levelsCleared,
  cheesePoints,
  blocksMoved,
  elapsedMs,
}: ScoreInput): number {
  const clampedElapsed = Math.min(Math.max(elapsedMs, 0), TIME_BONUS_CAP_MS)
  const timeBonus = Math.round((TIME_BONUS_CAP_MS - clampedElapsed) / 1000)
  return Math.round(
    Math.max(0, cheesePoints) +
      Math.max(0, levelsCleared) * POINTS_PER_LEVEL +
      Math.max(0, blocksMoved) * POINTS_PER_BLOCK +
      timeBonus,
  )
}
