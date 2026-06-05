import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import type { GameSnapshot } from '../game/types'

type GameBoardProps = {
  snapshot: GameSnapshot
  onSwipe?: (dir: 'up' | 'down' | 'left' | 'right') => void
  /** Extra props for the outer surface; `onTouchStart` / `onTouchEnd` are merged with swipe handling. */
  surfaceProps?: HTMLAttributes<HTMLDivElement>
}

const SWIPE_THRESHOLD_PX = 30

const tileBase =
  'relative flex items-center justify-center min-h-0 min-w-0 border border-slate-800/60 aspect-square'

function tileBackground(tile: GameSnapshot['grid'][number][number]): string {
  switch (tile) {
    case 'wall':
      return 'bg-slate-800'
    case 'block':
      return 'bg-zinc-600 shadow-inner'
    case 'cheese':
      return 'bg-emerald-950/45'
    default:
      return 'bg-slate-900'
  }
}

export function GameBoard({ snapshot, onSwipe, surfaceProps }: GameBoardProps) {
  const { grid, mouse, cats } = snapshot
  const touchOrigin = useRef<{ x: number; y: number } | null>(null)

  const cells: ReactNode[] = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x]
      const isMouse = mouse.x === x && mouse.y === y
      const catHere = cats.some((c) => c.x === x && c.y === y)

      cells.push(
        <div
          key={`${x}-${y}`}
          className={`${tileBase} ${tileBackground(tile)}`}
        >
          {isMouse && (
            <span
              className="z-10 h-[62%] w-[62%] rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]"
              aria-hidden
            />
          )}
          {catHere && (
            <span
              className={`h-[62%] w-[62%] rounded-sm bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.55)] ${isMouse ? 'absolute z-20' : ''}`}
              aria-hidden
            />
          )}
          {tile === 'cheese' && !isMouse && !catHere && (
            <span
              className="absolute h-2.5 w-2.5 rounded-sm bg-emerald-400/90 opacity-90"
              aria-hidden
            />
          )}
        </div>,
      )
    }
  }

  return (
    <div
      {...surfaceProps}
      onTouchStart={(e) => {
        surfaceProps?.onTouchStart?.(e)
        const t = e.changedTouches[0]
        touchOrigin.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={(e) => {
        surfaceProps?.onTouchEnd?.(e)
        if (!onSwipe || !touchOrigin.current) return
        const t = e.changedTouches[0]
        const dx = t.clientX - touchOrigin.current.x
        const dy = t.clientY - touchOrigin.current.y
        touchOrigin.current = null
        if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX)
          return
        if (Math.abs(dx) >= Math.abs(dy)) {
          onSwipe(dx > 0 ? 'right' : 'left')
        } else {
          onSwipe(dy > 0 ? 'down' : 'up')
        }
      }}
      className={[
        'select-none touch-manipulation rounded-xl overflow-hidden shadow-[0_0_40px_-8px_rgba(251,191,36,0.15)] ring-1 ring-slate-700/80',
        surfaceProps?.className ?? '',
      ].join(' ')}
    >
      <div
        className="grid h-full w-full bg-slate-950"
        style={{
          gridTemplateColumns: 'repeat(20, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(20, minmax(0, 1fr))',
        }}
      >
        {cells}
      </div>
    </div>
  )
}
