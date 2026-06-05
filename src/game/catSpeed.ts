/** Level 1 baseline (matches original 500 ms cat tick). */
export const CAT_TICK_MS_LEVEL_1 = 500

/** Each level cats are 10% faster (interval ÷ 1.1). Caps at level 20. */
export const CAT_SPEED_LEVEL_CAP = 20

const SPEED_FACTOR = 1.1

/**
 * Milliseconds between enemy moves for this level.
 * Level 20 equals one step every ~82 ms — treated as matching “player pace” for this mode.
 */
export function catTickMsForLevel(level: number): number {
  const L = Math.min(Math.max(Math.floor(level), 1), CAT_SPEED_LEVEL_CAP)
  const ms = CAT_TICK_MS_LEVEL_1 / SPEED_FACTOR ** (L - 1)
  return Math.round(ms)
}
