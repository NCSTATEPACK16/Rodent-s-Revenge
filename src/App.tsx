import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Home, Info, RotateCcw } from 'lucide-react'
import { GameBoard } from './components/GameBoard'
import { MainMenu } from './components/MainMenu'
import { LevelTransition } from './components/LevelTransition'
import { GameOver } from './components/GameOver'
import { Leaderboard } from './components/Leaderboard'
import { catTickMsForLevel } from './game/catSpeed'
import { getLevelConfig } from './game/levels'
import { useGameStore } from './store/gameStore'
import { useCatLoop } from './hooks/useCatLoop'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
  const game = useGameStore((s) => s.snapshot)
  const screen = useGameStore((s) => s.screen)
  const bestLevelsCompleted = useGameStore((s) => s.bestLevelsCompleted)
  const move = useGameStore((s) => s.move)
  const reset = useGameStore((s) => s.reset)
  const start = useGameStore((s) => s.start)
  const toMenu = useGameStore((s) => s.toMenu)
  const nextLevel = useGameStore((s) => s.nextLevel)
  const finalScore = useGameStore((s) => s.finalScore)
  const levelsCleared = useGameStore((s) => s.levelsCleared)

  const [helpOpen, setHelpOpen] = useState(false)

  useCatLoop()
  useKeyboard()

  /** Enemy tick for the level currently being played; after a clear, preview next level. */
  const enemySpeedLevel =
    game.status === 'levelComplete' ? game.level + 1 : game.level
  const config = getLevelConfig(enemySpeedLevel)
  const catTickMs = Math.round(
    catTickMsForLevel(enemySpeedLevel) * (config.tickMultiplier ?? 1),
  )

  const restart = () => {
    setHelpOpen(false)
    reset()
  }

  const goMenu = () => {
    setHelpOpen(false)
    toMenu()
  }

  const statusLabel =
    game.status === 'levelComplete'
      ? `Level ${game.level} complete`
      : game.status === 'lost'
        ? 'Caught — try again or head to the menu.'
        : 'Trap cats, eat green dots, then continue.'

  return (
    <div className="min-h-svh bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(244,63,94,0.06),_transparent_50%)] text-slate-200">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-6 px-4 py-8">
        <AnimatePresence mode="wait">
          {screen === 'menu' ? (
            <div key="menu" className="flex w-full flex-col items-center gap-8">
              <MainMenu
                bestLevelsCompleted={bestLevelsCompleted}
                onStart={start}
              />
              <Leaderboard />
            </div>
          ) : (
            <div
              key="game"
              className="flex w-full flex-col items-center gap-6"
            >
              <header className="flex w-full max-w-xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h1 className="font-mono text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
                    {config.name ?? `Level ${game.level}`}
                  </h1>
                  <p className="font-mono text-xs text-slate-500">
                    Lv {game.level} · {game.score} pts · enemies every{' '}
                    {catTickMs} ms · {game.cats.length} red dot
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
                  <button
                    type="button"
                    onClick={goMenu}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-xs text-slate-300 shadow-sm transition hover:border-slate-500 hover:text-slate-100"
                  >
                    <Home className="h-4 w-4 text-slate-400" aria-hidden />
                    Menu
                  </button>
                </div>
              </header>

              {helpOpen && (
                <div className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-900/90 p-4 font-mono text-left text-xs leading-relaxed text-slate-400 shadow-lg">
                  <p className="mb-2 text-slate-200">How to play</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Arrow keys / WASD or swipe on the board to move.</li>
                    <li>Push blocks when the tile behind them is empty.</li>
                    <li>
                      Surround a cat on all four sides with walls or blocks so it
                      turns into cheese. Empty, cheese, the mouse, or another cat
                      on a side counts as open — not a trap.
                    </li>
                    <li>
                      Red dots chase on a timer that gets ~10% quicker each level
                      (up to level 20). Don&apos;t get caught.
                    </li>
                  </ul>
                </div>
              )}

              <p className="max-w-xl text-center font-mono text-sm text-slate-400">
                {statusLabel}
              </p>

              <div className="relative w-full max-w-[min(92vw,640px)] outline-none">
                <GameBoard
                  snapshot={game}
                  onSwipe={move}
                  surfaceProps={{
                    tabIndex: 0,
                    className: 'w-full aspect-square max-h-[72vh]',
                    'aria-label': 'Game board — use arrow keys or swipe to move',
                  }}
                />
                <AnimatePresence>
                  {game.status === 'levelComplete' && (
                    <LevelTransition
                      key="level-transition"
                      level={game.level}
                      score={game.score}
                      onContinue={nextLevel}
                    />
                  )}
                  {game.status === 'lost' && (
                    <GameOver
                      key="game-over"
                      level={game.level}
                      score={game.score}
                      onRestart={restart}
                      onMenu={goMenu}
                    />
                  )}
                </AnimatePresence>
              </div>

              {game.status === 'lost' && (
                <Leaderboard
                  submission={{
                    name: '',
                    score: finalScore(),
                    levels_cleared: levelsCleared(),
                  }}
                />
              )}

              <footer className="flex w-full max-w-xl flex-col items-center gap-1 text-center">
                <p className="font-mono text-sm font-medium tabular-nums text-amber-200/95">
                  High score: {bestLevelsCompleted} level
                  {bestLevelsCompleted === 1 ? '' : 's'} cleared
                </p>
                <p className="font-mono text-[11px] text-slate-600">
                  Slate field · Amber mouse · Rose cats · Green cheese · Saved on
                  this device
                </p>
              </footer>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
