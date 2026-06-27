import { motion } from 'framer-motion'

type GameOverProps = {
  level: number
  score: number
  onRestart: () => void
  onMenu: () => void
}

/** Overlay shown over the board when a cat catches the mouse. */
export function GameOver({ level, score, onRestart, onMenu }: GameOverProps) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 rounded-xl bg-slate-950/85 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="flex flex-col items-center gap-1 text-center"
        initial={{ scale: 0.8, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        <p className="font-mono text-sm uppercase tracking-widest text-rose-400/80">
          Caught
        </p>
        <p className="font-mono text-3xl font-bold text-rose-200">Game Over</p>
        <p className="font-mono text-sm tabular-nums text-slate-300">
          Reached level {level} · {score} points
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.button
          type="button"
          onClick={onRestart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-lg border border-amber-500/50 bg-amber-950/40 px-6 py-2.5 font-mono text-sm font-semibold text-amber-200 transition hover:border-amber-400/80 hover:bg-amber-900/50"
        >
          Try again
        </motion.button>
        <motion.button
          type="button"
          onClick={onMenu}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-lg border border-slate-700 bg-slate-900/80 px-6 py-2.5 font-mono text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          Main menu
        </motion.button>
      </div>
    </motion.div>
  )
}
