import { useEffect } from 'react'
import { catTickMsForLevel } from '../game/catSpeed'
import { getLevelConfig } from '../game/levels'
import { useGameStore } from '../store/gameStore'

/**
 * Drives the cat AI on a per-level interval, mirroring the old `useCatTick` in
 * App.tsx. Runs only while the game is actively `playing`; the interval is
 * rebuilt whenever the level (and therefore the tick rate) changes.
 */
export function useCatLoop(): void {
  const status = useGameStore((s) => s.snapshot.status)
  const level = useGameStore((s) => s.snapshot.level)
  const screen = useGameStore((s) => s.screen)
  const tickCats = useGameStore((s) => s.tickCats)

  useEffect(() => {
    if (screen !== 'game' || status !== 'playing') return
    const multiplier = getLevelConfig(level).tickMultiplier ?? 1
    const ms = Math.round(catTickMsForLevel(level) * multiplier)
    const id = window.setInterval(tickCats, ms)
    return () => window.clearInterval(id)
  }, [screen, status, level, tickCats])
}
