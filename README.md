# Vermin's Vengeance

A modern, web-first grid puzzle game: you're a mouse on a 20×20 board, pushing
block chains to trap pursuing cats and turn them into cheese for points,
surviving as the cats speed up each level. Inspired by the 1991 classic; built
with a decoupled engine so an iOS (React Native) port is a UI swap, not a rewrite.

**Project status:** 🟢 Playable. Zustand engine, Framer Motion animation,
data-driven levels, and an optional global leaderboard (FastAPI + Supabase).

---

## The Game in One Paragraph

Move orthogonally on a 20×20 grid (arrow keys / WASD / swipe). Push connected
lines of blocks to wall the cats in — once a cat is fully enclosed (or squeezed
against a wall), it's trapped and becomes cheese you can eat for **+100** each.
Clear all cats and cheese to advance; each level the cats tick faster and the
layout changes. Grab the power-up to smash through inner walls briefly. If a cat
reaches your cell, it's game over. Best level cleared is saved locally; submit
your run to the global leaderboard if the backend is configured.

---

## Tech Stack

| Layer | Implementation |
| :--- | :--- |
| Language | TypeScript |
| UI framework | React 19 |
| Build tool | Vite 8 |
| State | Zustand (`src/store/gameStore.ts`) wrapping a pure engine |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | Framer Motion (actors only) |
| Rendering | CSS grid + animated actor overlay (`GameBoard.tsx`) |
| Game loop | `setInterval` cat ticks; rAF-paced input buffer |
| Persistence | `localStorage` (best level) |
| Leaderboard | Netlify Function (`netlify/functions/scores.mts`) → Supabase |
| Tests | Vitest (engine, levels, score) |

> A standalone FastAPI version of the same API lives in `server/` as an
> alternative (e.g. Render) — the Netlify Function is the active backend.

The architecture keeps a **pure engine as the single source of truth**:
`src/game/` is framework-agnostic TypeScript and the React layer is a thin view
over immutable `GameSnapshot` values. See
[`docs/ios-port-roadmap.md`](docs/ios-port-roadmap.md) for the React Native plan.

---

## Repository Structure

```
.
├── README.md / HANDOFF.md / HOW_TO_PLAY.txt / LICENSE
├── index.html · package.json · vite/vitest/ts configs
├── netlify.toml                Frontend deploy config
├── docs/
│   ├── modernization-plan.md · technical-spec.md
│   ├── qa-checklist.md         Browser QA + deploy checklist
│   └── ios-port-roadmap.md     React Native (Expo) port map
├── server/                     FastAPI leaderboard API
│   ├── app/main.py             GET/POST /scores, CORS
│   ├── requirements.txt · .env.example · schema.sql · render.yaml
└── src/
    ├── main.tsx · App.tsx · index.css · vite-env.d.ts
    ├── store/gameStore.ts      Zustand store over the pure engine
    ├── hooks/                  useCatLoop, useKeyboard (WASD + buffer)
    ├── api/leaderboard.ts      Typed leaderboard client
    ├── components/             GameBoard, MainMenu, LevelTransition, GameOver, Leaderboard
    └── game/                   Pure engine (source of truth)
        ├── rodentEngine.ts · types.ts · levels.ts
        ├── catSpeed.ts · score.ts · highScoreLevels.ts
```

---

## Getting Started

```bash
npm install
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve the production build
npm run lint      # ESLint
npm test          # Vitest suite
```

The game runs fully without a backend (the leaderboard shows "offline"). To
enable the leaderboard, set `VITE_API_URL` to the API base URL and run the
server (see [`server/README.md`](server/README.md)).

---

## Deployment

- **Database → Supabase:** run `server/schema.sql` in the SQL editor.
- **Frontend + Leaderboard → Netlify:** `netlify.toml` builds the site and the
  `/api/scores` function. Set `SUPABASE_SERVICE_ROLE_KEY` (and optionally
  `SUPABASE_URL`) in the Netlify UI. No `VITE_API_URL` needed (same-origin `/api`).
- **Local dev with the API:** `netlify dev` serves the function + frontend
  together; plain `npm run dev` runs the game with the leaderboard returning an
  error until the function is reachable.
- **Alternative backend → Render:** `server/render.yaml` (FastAPI) if you prefer a
  standalone API instead of the Netlify Function.

Walk through [`docs/qa-checklist.md`](docs/qa-checklist.md) before each deploy.

---

## Naming & IP

The repo has been renamed to **Vermin's Vengeance**. Before a public release,
continue to use **original art and audio** (no assets from the inspiring game).

## License

[MIT](LICENSE). Update the copyright line in `LICENSE` to your legal name before
release.
