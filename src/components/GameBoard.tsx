import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameSnapshot, Tile } from '../game/types'

type GameBoardProps = {
  snapshot: GameSnapshot
  onSwipe?: (dir: 'up' | 'down' | 'left' | 'right') => void
  /** Extra props for the outer surface; `onTouchStart` / `onTouchEnd` are merged with swipe handling. */
  surfaceProps?: HTMLAttributes<HTMLDivElement>
}

const SWIPE_THRESHOLD_PX = 30

/** Spring used for actor (mouse/cat) movement — smooth glide, not a snap. */
const moveSpring = { type: 'spring', stiffness: 360, damping: 30, mass: 0.9 } as const

const tileBase =
  'border border-slate-800/60 min-h-0 min-w-0 aspect-square'

function tileBackground(tile: Tile): string {
  switch (tile) {
    case 'wall':
      return 'bg-slate-800'
    case 'block':
      return 'bg-zinc-600 shadow-inner'
    case 'cracked':
      return 'bg-zinc-700/70 [background-image:repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.35)_3px,rgba(0,0,0,0.35)_4px)]'
    case 'powerup':
      return 'bg-indigo-950/50'
    case 'cheese':
      return 'bg-emerald-950/45'
    default:
      return 'bg-slate-900'
  }
}

export function GameBoard({ snapshot, onSwipe, surfaceProps }: GameBoardProps) {
  const { grid, mouse, cats } = snapshot
  const touchOrigin = useRef<{ x: number; y: number } | null>(null)

  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  // Static background layer: walls, blocks, cracked, cheese, powerups.
  const cells: ReactNode[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = grid[y][x]
      cells.push(
        <div key={`${x}-${y}`} className={`relative ${tileBase} ${tileBackground(tile)}`}>
          {tile === 'cheese' && (
            <span
              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-emerald-400/90 opacity-90"
              aria-hidden
            />
          )}
          {tile === 'powerup' && (
            <span
              className="absolute left-1/2 top-1/2 h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.7)]"
              aria-hidden
            />
          )}
        </div>,
      )
    }
  }

  // Position/size helpers (percent of board) for the animated actor overlay.
  const sizeStyle = { width: `${100 / cols}%`, height: `${100 / rows}%` }
  const posStyle = (x: number, y: number) => ({
    left: `${(x / cols) * 100}%`,
    top: `${(y / rows) * 100}%`,
  })

  const superMouse = snapshot.superMouseTurns > 0

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
      <div className="relative h-full w-full bg-slate-950">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {cells}
        </div>

        {/* Animated actor overlay — mouse + cats glide between cells. */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute flex items-center justify-center"
            style={sizeStyle}
            animate={posStyle(mouse.x, mouse.y)}
            transition={moveSpring}
            aria-hidden
          >
            <motion.span
              className={`h-[62%] w-[62%] rounded-full bg-amber-400 [transform:translateZ(0)] will-change-transform ${
                superMouse
                  ? 'shadow-[0_0_18px_rgba(129,140,248,0.9)] ring-2 ring-indigo-300'
                  : 'shadow-[0_0_12px_rgba(251,191,36,0.7)]'
              }`}
              animate={superMouse ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={superMouse ? { duration: 0.8, repeat: Infinity } : { duration: 0.2 }}
            />
          </motion.div>

          <AnimatePresence>
            {cats.map((c, i) => (
              <motion.div
                // Stable per-cat id (assigned at level build, preserved across
                // moves/ticks/traps) so each cat animates continuously and a
                // trapped cat plays the correct exit. Falls back to index only
                // for engine-test snapshots that omit ids.
                key={`cat-${c.id ?? i}`}
                className="absolute flex items-center justify-center"
                style={sizeStyle}
                initial={{ ...posStyle(c.x, c.y), opacity: 0, scale: 0.5 }}
                animate={{ ...posStyle(c.x, c.y), opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={moveSpring}
                aria-hidden
              >
                <span className="h-[62%] w-[62%] rounded-sm bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.55)] [transform:translateZ(0)] will-change-transform" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
