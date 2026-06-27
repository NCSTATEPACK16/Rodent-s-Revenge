import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { Direction } from '../game/types'

/** Arrow keys + WASD → direction. Returns null for unhandled keys. */
function keyToDir(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up'
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down'
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left'
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right'
    default:
      return null
  }
}

/** Max queued moves; guards against a key being held/mashed during a stall. */
const MAX_BUFFER = 4

/**
 * Keyboard input with a small buffer. Keydowns are queued and drained one move
 * per animation frame, so fast keystrokes are never dropped mid-move and the
 * mouse never "teleports" several cells in a single frame. The game logic itself
 * is instant (Zustand), so the buffer only paces input to match the animation.
 */
export function useKeyboard(): void {
  const move = useGameStore((s) => s.move)
  const screen = useGameStore((s) => s.screen)
  const queueRef = useRef<Direction[]>([])

  useEffect(() => {
    if (screen !== 'game') return

    const onKey = (e: KeyboardEvent) => {
      const dir = keyToDir(e.key)
      if (!dir) return
      e.preventDefault()
      const q = queueRef.current
      if (q.length < MAX_BUFFER) q.push(dir)
    }

    let raf = 0
    const drain = () => {
      const dir = queueRef.current.shift()
      if (dir) move(dir)
      raf = requestAnimationFrame(drain)
    }
    raf = requestAnimationFrame(drain)

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf)
      queueRef.current = []
    }
  }, [move, screen])
}
