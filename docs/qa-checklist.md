# Vermin's Vengeance — Browser QA & Deploy Checklist

Run through this before every deploy. Test in **both Chrome and Firefox** (latest
stable). Use DevTools open the whole time.

## 1. Automated gates (must pass)

- [ ] `npm test` — all engine/score/level unit tests green.
- [ ] `npm run lint` — no errors.
- [ ] `npm run build` — clean production build.
- [ ] `npm run preview` — load the built bundle and smoke-test the game.
- [ ] `cd server && python -m py_compile app/main.py` — backend syntax OK.

## 2. Game loop & state

- [ ] Main menu shows, **Play** starts a fresh level 1 (score 0, 3 cats).
- [ ] Arrow keys **and** WASD move the mouse; swipe works on a touch device/emulation.
- [ ] Rapid key mashing never drops a move and never teleports >1 cell per frame
      (input buffer paces moves).
- [ ] Blocks push as connected chains; pushing a cat into a wall turns it to cheese.
- [ ] Eating cheese adds points; clearing all cats + cheese triggers the
      **Level transition** overlay; **Continue** loads the next layout (more/faster cats).
- [ ] Getting caught shows **Game Over** with the score; **Try again** restarts,
      **Main menu** returns to the menu.
- [ ] Power-up: grabbing it lets the mouse smash inner walls for a few moves
      (mouse glows indigo); effect ends correctly.
- [ ] Cat tick speed visibly increases with level; HUD "enemies every N ms" matches.
- [ ] Best-level high score persists across reload (localStorage).

## 3. Rendering & animation

- [ ] Mouse and cats glide smoothly between cells (Framer Motion spring); no flicker.
- [ ] Cat→cheese trap animates (pop/fade) without leaving ghosts.
- [ ] Board stays a perfect square and scales from a narrow window to ultrawide;
      cells remain square.
- [ ] DevTools Performance: steady ~60fps during movement; no long tasks / layout thrash.

## 4. Memory leaks (DevTools → Memory / Performance)

- [ ] Play → game over → menu → play, repeated ~10×, then take a heap snapshot:
      no unbounded growth in detached nodes or listeners.
- [ ] The cat-tick `setInterval` is cleared on level change / game over / unmount
      (no stray intervals in Performance timeline).
- [ ] The keyboard `requestAnimationFrame` drain loop stops when leaving the game
      screen (no rAF accumulation).
- [ ] Leaderboard fetch on unmount does not warn about setting state after unmount
      (the `active` guard handles this).

## 5. Leaderboard (when `VITE_API_URL` is set)

- [ ] Menu shows the global top 10; **Refresh** reloads.
- [ ] On game over, submitting a name posts the score and it appears in the list.
- [ ] With `VITE_API_URL` unset, the UI shows "Leaderboard offline" and the game
      is fully playable.
- [ ] CORS: requests from the dev origin (and the Netlify origin in prod) succeed;
      check the Network tab for blocked preflights.

## 6. Deploy

- [ ] Supabase: run `server/schema.sql`; confirm the `leaderboard` table exists.
- [ ] Render: deploy via `server/render.yaml`; set `DATABASE_URL` (Supabase pooler)
      and `ALLOWED_ORIGINS` (Netlify origin). Hit `GET /` → `{"status":"ok"}`.
- [ ] Netlify: deploy via `netlify.toml`; set `VITE_API_URL` to the Render URL.
- [ ] End-to-end on the live site: play a game, submit a score, see it on the board.
