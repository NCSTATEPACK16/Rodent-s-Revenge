export type Tile = 'empty' | 'wall' | 'block' | 'cracked' | 'cheese' | 'powerup'

export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameStatus = 'playing' | 'levelComplete' | 'lost'

export const GRID_SIZE = 20

export type Vec = { x: number; y: number }

export type GameSnapshot = {
  grid: Tile[][]
  mouse: Vec
  cats: Vec[]
  status: GameStatus
  level: number
  score: number
  /** Remaining moves of Super Mouse power-up. 0 = inactive. */
  superMouseTurns: number
}

/**
 * Data-driven definition of a single level's content. The grid is a fixed
 * {@link GRID_SIZE}×{@link GRID_SIZE} field with border walls; a config supplies
 * the interior layout and difficulty knobs. Coordinates that collide with the
 * mouse start, active cat spawns, or border walls are ignored by the builder, so
 * layouts are always safe.
 */
export type LevelConfig = {
  id: number
  name?: string
  /** Solid pushable/obstacle blocks. */
  blocks: Vec[]
  /** Cracked blocks (shatter when the mouse enters; cats cannot pass). */
  cracked?: Vec[]
  /** Super Mouse power-up tiles. */
  powerups?: Vec[]
  /** Override cat count; defaults to min(2 + level, spawn count). */
  catCount?: number
  /** Multiplies the per-level cat tick interval (>1 slower, <1 faster). Default 1. */
  tickMultiplier?: number
}
