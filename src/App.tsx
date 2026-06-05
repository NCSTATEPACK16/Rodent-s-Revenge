import { useCallback, useEffect, useState } from 'react'
import { Info, RotateCcw } from 'lucide-react'
import { GameBoard } from './components/GameBoard'
import {
  continueToNextLevel,
  createInitialState,
  moveMouse,
  stepCats,
} from './game/rodentEngine'
import { catTickMsForLevel } from './game/catSpeed'
import {
  loadBestLevelsCompleted,
  saveBestLevelsCompleted,
} from './game/highScoreLevels'
import type { Direction } from './game/types'

function useCatTick(
  status: 'playing' | 'levelComplete' | 'lost',
  tick: () => void,
  ms: number,
) {
  useEffect(() => {
    if (status !== 'playing') return
    const id = window.setInterval(tick, ms)
    return () => window.clearInterval(id)
  }, [status, tick, ms])
}

export default function App() {
  const [game, setGame] = useState(createInitialState)
  const [helpOpen, setHelpOpen] = useState(false)
  const [bestLevelsCompleted, setBestLevelsCompleted] = useState(
    loadBestLevelsCompleted,
  )

  const tickCats = useCallback(() => {
    setGame((g) => stepCats(g))
  }, [])

  /** Enemy tick for the level currently being played; after a clear, preview next level. */
  const enemySpeedLevel =
    game.status === 'levelComplete' ? game.level + 1 : game.level
  const catTickMs = catTickMsForLevel(enemySpeedLevel)

  useCatTick(game.status, tickCats, catTickMs)

  useEffect(() => {
    if (game.status !== 'levelComplete') return
    const next = Math.max(loadBestLevelsCompleted(), game.level)
    saveBestLevelsCompleted(next)
    const id = requestAnimationFrame(() => {
      setBestLevelsCompleted(next)
    })
    return () => cancelAnimationFrame(id)
  }, [game.status, game.level])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      let dir: Direction | null = null
      switch (e.key) {
        case 'ArrowUp':
          dir = 'up'
          break
        case 'ArrowDown':
          dir = 'down'
          break
        case 'ArrowLeft':
          dir = 'left'
          break
        case 'ArrowRight':
          dir = 'right'
          break
        default:
          break
      }
      if (!dir) return
      e.preventDefault()
      setGame((g) => {
        if (g.status !== 'playing') return g
        return moveMouse(g, dir)
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSwipe = useCallback((dir: Direction) => {
    setGame((g) => {
      if (g.status !== 'playing') return g
      return moveMouse(g, dir)
    })
  }, [])

  const restart = () => {
    setHelpOpen(false)
    setGame(createInitialState)
  }

  const continueLevel = () => {
    setHelpOpen(false)
    setGame((g) => continueToNextLevel(g))
  }

  const statusLabel =
    game.status === 'levelComplete'
      ? `Level ${game.level} complete`
      : game.status === 'lost'
        ? 'Caught — restart and try again.'
        : 'Trap cats, eat green dots, then continue.'

  return (
    <div className="min-h-svh bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(244,63,94,0.06),_transparent_50%)] text-slate-200">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-6 px-4 py-8">
        <header className="flex w-full max-w-xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-mono text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
              Rodent&apos;s Revenge
            </h1>
            <p className="font-mono text-xs text-slate-500">
              Lv {game.level} · {game.score} pts · enemies every {catTickMs} ms ·{' '}
              {game.cats.length} red dot
              {game.cats.length === 1 ? '' : 's'} left
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setHelpOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-300 shadow-sm transition hover:border-amber-500/40 hover:text-amber-200"
            >
              <Info className="h-4 w-4 text-amber-400/90" aria-hidden />
              Help
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-300 shadow-sm transition hover:border-rose-500/40 hover:text-rose-100"
            >
              <RotateCcw className="h-4 w-4 text-rose-400/90" aria-hidden />
              Restart
            </button>
          </div>
        </header>

        {helpOpen && (
          <div className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/90 p-4 font-mono text-left text-xs leading-relaxed text-slate-400 shadow-lg">
            <p className="mb-2 text-slate-200">How to play</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Arrow keys or swipe on the board to move the mouse.</li>
              <li>Push blocks when the tile behind them is empty.</li>
              <li>
                Surround a cat on all four sides with walls or blocks so it
                turns into cheese. Empty, cheese, the mouse, or another cat on
                a side counts as open — not a trap.
              </li>
              <li>
                Red dots chase on a timer that gets ~10% quicker each level (up
                to level 20). Don&apos;t get caught.
              </li>
            </ul>
          </div>
        )}

        <p className="max-w-xl text-center font-mono text-sm text-slate-400">
          {statusLabel}
        </p>
        {game.status === 'levelComplete' && (
          <button
            type="button"
            onClick={continueLevel}
            className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-2 font-mono text-sm text-emerald-200 transition hover:border-emerald-400/70 hover:bg-emerald-900/50"
          >
            Continue?
          </button>
        )}

        <div className="relative w-full max-w-[min(92vw,640px)] outline-none">
          <GameBoard
            snapshot={game}
            onSwipe={onSwipe}
            surfaceProps={{
              tabIndex: 0,
              className: 'w-full aspect-square max-h-[72vh]',
              'aria-label': 'Game board — use arrow keys or swipe to move',
            }}
          />
        </div>

        <footer className="flex w-full max-w-xl flex-col items-center gap-1 text-center">
          <p className="font-mono text-sm font-medium tabular-nums text-amber-200/95">
            High score: {bestLevelsCompleted} level
            {bestLevelsCompleted === 1 ? '' : 's'} cleared
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Slate-900 field · Amber mouse · Rose cats · Green cheese · Saved on
            this device
          </p>
        </footer>
      </div>
    </div>
  )
}
