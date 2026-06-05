const STORAGE_KEY = 'rodents-revenge-best-levels-completed'

/** Highest level number cleared in any run (persisted). */
export function loadBestLevelsCompleted(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return 0
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveBestLevelsCompleted(best: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(best))))
  } catch {
    /* ignore quota / private mode */
  }
}
