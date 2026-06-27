import { create } from 'zustand'
import {
  continueToNextLevel,
  createInitialState,
  moveMouse,
  stepCats,
} from '../game/rodentEngine'
import {
  loadBestLevelsCompleted,
  saveBestLevelsCompleted,
} from '../game/highScoreLevels'
import { computeScore } from '../game/score'
import type { Direction, GameSnapshot, Tile } from '../game/types'

/**
 * Zustand store for Vermin's Vengeance.
 *
 * This is a thin orchestration layer: it OWNS the immutable {@link GameSnapshot}
 * but reimplements no game rules. Every action delegates to the pure functions in
 * `rodentEngine.ts`, so the engine stays framework-agnostic and portable (web
 * workers, React Native, tests). UI-only metadata (`bestLevelsCompleted`,
 * `blocksMoved`, `startedAt`) lives here too.
 */
/** Which top-level UI surface is showing. In-game over/complete use snapshot.status. */
export type Screen = 'menu' | 'game'

export type GameStore = {
  snapshot: GameSnapshot
  bestLevelsCompleted: number
  screen: Screen
  /** Block-push events this run — a leaderboard scoring input. */
  blocksMoved: number
  /** Timestamp (ms) the current run began — drives the time bonus. */
  startedAt: number

  /** Apply a player move (no-op unless currently playing). */
  move: (dir: Direction) => void
  /** Advance all cats one tick. */
  tickCats: () => void
  /** Continue from a completed level into the next one. */
  nextLevel: () => void
  /** Reset to a fresh level-1 game (stays in-game). */
  reset: () => void
  /** Start a fresh game from the main menu. */
  start: () => void
  /** Return to the main menu. */
  toMenu: () => void
  /** Final leaderboard score for the current run. */
  finalScore: () => number
  /** Levels fully cleared this run (excludes the level lost on). */
  levelsCleared: () => number
}

export const useGameStore = create<GameStore>((set, get) => ({
  snapshot: createInitialState(),
  bestLevelsCompleted: loadBestLevelsCompleted(),
  screen: 'menu',
  blocksMoved: 0,
  startedAt: Date.now(),

  move: (dir) => {
    const { snapshot } = get()
    if (snapshot.status !== 'playing') return
    const next = moveMouse(snapshot, dir)
    if (next === snapshot) return
    if (blocksChanged(snapshot.grid, next.grid)) {
      set({ blocksMoved: get().blocksMoved + 1 })
    }
    persistIfCleared(next, set, get)
    set({ snapshot: next })
  },

  tickCats: () => {
    const { snapshot } = get()
    if (snapshot.status !== 'playing') return
    const next = stepCats(snapshot)
    if (next === snapshot) return
    persistIfCleared(next, set, get)
    set({ snapshot: next })
  },

  nextLevel: () => {
    set({ snapshot: continueToNextLevel(get().snapshot) })
  },

  reset: () => {
    set({ snapshot: createInitialState(), blocksMoved: 0, startedAt: Date.now() })
  },

  start: () => {
    set({
      snapshot: createInitialState(),
      screen: 'game',
      blocksMoved: 0,
      startedAt: Date.now(),
    })
  },

  toMenu: () => {
    set({ screen: 'menu' })
  },

  levelsCleared: () => {
    const { snapshot } = get()
    // On a clear the current level counts; otherwise only prior levels do.
    return snapshot.status === 'levelComplete' ? snapshot.level : snapshot.level - 1
  },

  finalScore: () => {
    const { snapshot, blocksMoved, startedAt } = get()
    return computeScore({
      levelsCleared: get().levelsCleared(),
      cheesePoints: snapshot.score,
      blocksMoved,
      elapsedMs: Date.now() - startedAt,
    })
  },
}))

/**
 * When a snapshot transitions to `levelComplete`, persist the best level reached
 * to localStorage and mirror it into store state for the UI.
 */
function persistIfCleared(
  next: GameSnapshot,
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
): void {
  if (next.status !== 'levelComplete') return
  const best = Math.max(get().bestLevelsCompleted, next.level)
  saveBestLevelsCompleted(best)
  set({ bestLevelsCompleted: best })
}

/** True if any cell's `block` occupancy differs — i.e. a push moved blocks. */
function blocksChanged(prev: Tile[][], next: Tile[][]): boolean {
  for (let y = 0; y < prev.length; y++) {
    for (let x = 0; x < prev[y].length; x++) {
      if ((prev[y][x] === 'block') !== (next[y][x] === 'block')) return true
    }
  }
  return false
}
