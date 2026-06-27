import { motion } from 'framer-motion'

type LevelTransitionProps = {
  level: number
  score: number
  onContinue: () => void
}

/** Overlay shown over the board when a level is cleared. */
export function LevelTransition({ level, score, onContinue }: LevelTransitionProps) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 rounded-xl bg-slate-950/80 backdrop-blur-sm"
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
        <p className="font-mono text-sm uppercase tracking-widest text-emerald-400/80">
          Level cleared
        </p>
        <p className="font-mono text-3xl font-bold text-emerald-200">Level {level}</p>
        <p className="font-mono text-sm tabular-nums text-slate-300">{score} points</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onContinue}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-lg border border-emerald-500/50 bg-emerald-950/50 px-6 py-2.5 font-mono text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/80 hover:bg-emerald-900/60"
      >
        Continue to level {level + 1}
      </motion.button>
    </motion.div>
  )
}
