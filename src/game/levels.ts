import type { LevelConfig, Vec } from './types'

/**
 * Hand-designed level layouts on the fixed 20×20 grid. `getLevelConfig` cycles
 * through these as the player advances; cat count and speed keep ramping via the
 * engine's `min(2 + level, spawns)` rule and `catSpeedForLevel`, so repeated
 * layouts still get harder. Keep all coordinates within 1..18 (border is walls);
 * the builder additionally ignores any cell that collides with the mouse start
 * (10,10) or an active cat spawn.
 */

/** Classic pinwheel of paired blocks — the original prototype layout. */
const classic: Vec[] = [
  { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 14, y: 4 }, { x: 15, y: 4 },
  { x: 4, y: 14 }, { x: 5, y: 14 }, { x: 14, y: 14 }, { x: 15, y: 14 },
  { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 12 }, { x: 10, y: 12 },
  { x: 7, y: 9 }, { x: 12, y: 9 }, { x: 7, y: 10 }, { x: 12, y: 10 },
  { x: 8, y: 8 }, { x: 11, y: 8 }, { x: 8, y: 11 }, { x: 11, y: 11 },
]

/** Four corner bunkers, open center. */
const corners: Vec[] = [
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 },
  { x: 16, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 4 },
  { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 3, y: 15 },
  { x: 16, y: 16 }, { x: 15, y: 16 }, { x: 16, y: 15 },
  { x: 9, y: 9 }, { x: 11, y: 11 }, { x: 9, y: 11 }, { x: 11, y: 9 },
]

/** Cross / plus of blocks through the middle. */
const cross: Vec[] = [
  { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 },
  { x: 9, y: 13 }, { x: 9, y: 14 }, { x: 9, y: 15 },
  { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 },
  { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 },
  { x: 4, y: 4 }, { x: 15, y: 15 }, { x: 4, y: 15 }, { x: 15, y: 4 },
]

/** Diagonal scatter — fewer anchors, more open space (faster cats). */
const scatter: Vec[] = [
  { x: 5, y: 6 }, { x: 6, y: 7 }, { x: 13, y: 6 }, { x: 14, y: 7 },
  { x: 5, y: 13 }, { x: 6, y: 12 }, { x: 13, y: 13 }, { x: 14, y: 12 },
  { x: 9, y: 8 }, { x: 11, y: 8 }, { x: 9, y: 12 }, { x: 11, y: 12 },
]

const LEVELS: LevelConfig[] = [
  { id: 1, name: 'Classic', blocks: classic, cracked: [{ x: 10, y: 3 }], powerups: [{ x: 10, y: 6 }] },
  { id: 2, name: 'Corners', blocks: corners, cracked: [{ x: 10, y: 3 }, { x: 10, y: 16 }], powerups: [{ x: 3, y: 10 }] },
  { id: 3, name: 'Crossfire', blocks: cross, powerups: [{ x: 10, y: 9 }], cracked: [{ x: 4, y: 10 }, { x: 15, y: 10 }] },
  { id: 4, name: 'Scatter', blocks: scatter, powerups: [{ x: 10, y: 6 }, { x: 10, y: 14 }], tickMultiplier: 0.9 },
]

/** Returns the level config for a 1-based level number, cycling through layouts. */
export function getLevelConfig(level: number): LevelConfig {
  const idx = (Math.max(1, Math.floor(level)) - 1) % LEVELS.length
  return LEVELS[idx]
}

export { LEVELS }
