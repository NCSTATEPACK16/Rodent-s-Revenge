/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the leaderboard API (FastAPI on Render). Unset = leaderboard offline. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
