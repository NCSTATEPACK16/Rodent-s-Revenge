import { motion } from 'framer-motion'

type MainMenuProps = {
  bestLevelsCompleted: number
  onStart: () => void
}

export function MainMenu({ bestLevelsCompleted, onStart }: MainMenuProps) {
  return (
    <motion.div
      className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-2">
        <motion.h1
          className="font-mono text-4xl font-bold tracking-tight text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.35)] sm:text-5xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          Vermin&apos;s Vengeance
        </motion.h1>
        <p className="font-mono text-sm text-slate-400">
          Trap the cats. Eat the cheese. Survive the swarm.
        </p>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-xl border border-amber-500/50 bg-amber-950/40 px-8 py-3 font-mono text-lg font-semibold text-amber-200 shadow-[0_0_24px_-6px_rgba(251,191,36,0.5)] transition hover:border-amber-400/80 hover:bg-amber-900/50"
      >
        Play
      </motion.button>

      <div className="w-full rounded-lg border border-slate-800 bg-slate-900/70 p-4 font-mono text-left text-xs leading-relaxed text-slate-400">
        <p className="mb-2 text-slate-200">How to play</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Move the mouse with arrow keys or WASD (swipe on touch).</li>
          <li>Push blocks to squeeze cats against walls — they turn to cheese.</li>
          <li>Eat all the cheese to clear the level. Cats get faster each level.</li>
          <li>Grab the glowing power-up to smash through walls briefly.</li>
        </ul>
      </div>

      <p className="font-mono text-sm font-medium tabular-nums text-amber-200/95">
        Best: {bestLevelsCompleted} level
        {bestLevelsCompleted === 1 ? '' : 's'} cleared
      </p>
    </motion.div>
  )
}
