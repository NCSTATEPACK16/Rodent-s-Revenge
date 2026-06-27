# Vermin's Vengeance — iOS Port Roadmap (React Native / Expo)

A brief map of what carries over when we build the iOS app. The whole point of
the Phase 1 decoupling was to make this a UI swap, not a rewrite: the game rules,
state, and scoring are framework-agnostic TypeScript and move over untouched.

## Reuse as-is (no changes)

These are pure TS with no DOM/React dependency — copy or share via a workspace:

- `src/game/rodentEngine.ts` — all rules (move, push, trap, cat AI, level build).
- `src/game/types.ts`, `src/game/levels.ts`, `src/game/catSpeed.ts`, `src/game/score.ts`.
- `src/store/gameStore.ts` — Zustand runs identically in React Native.
- The Vitest suites under `src/game/` — keep running them as the cross-platform
  safety net.

> Recommended: extract `src/game/` + `src/store/` into a shared package (e.g.
> npm workspace `@vv/core`) imported by both the web app and the Expo app, so
> there is a single source of truth.

## Swap or wrap (platform layer)

| Web (current) | iOS (React Native / Expo) |
| --- | --- |
| `components/GameBoard.tsx` (DOM grid + divs) | `View`/`Pressable` grid, or a `react-native-skia` canvas for best perf |
| Tailwind classes | NativeWind (Tailwind for RN) or `StyleSheet` |
| Framer Motion (actor animation) | `react-native-reanimated` (+ Moti for a similar API) |
| `hooks/useKeyboard.ts` (keydown + buffer) | `react-native-gesture-handler` swipes / on-screen D-pad; keep the input-buffer logic |
| `GameBoard` touch swipe handlers | gesture-handler `PanGestureHandler` |
| `components/MainMenu`, `LevelTransition`, `GameOver`, `Leaderboard` | reimplement views in RN primitives; logic/props are reusable |
| `localStorage` (`highScoreLevels.ts`) | `@react-native-async-storage/async-storage` (wrap behind the same load/save API) |
| `src/api/leaderboard.ts` (`fetch`) | works as-is (`fetch` is available); base URL via Expo config/env |
| `useCatLoop` (`setInterval`) | same `setInterval`, or drive from Reanimated frame callbacks |

## Steps when we start

1. `npx create-expo-app`; add the shared core package (engine + store + tests).
2. Add NativeWind + Reanimated + gesture-handler; port `GameBoard` first (static
   grid, then animated actors).
3. Port the menu/transition/game-over/leaderboard views.
4. Wrap storage behind the existing `highScoreLevels` API using AsyncStorage.
5. Point `VITE_API_URL`'s equivalent at the same Render API — the backend is shared.
6. Asset pipeline (icons, sounds) + App Store metadata; keep original art/audio per
   the README licensing note.

## What does NOT need to change

The backend (`server/`, FastAPI + Supabase) is shared verbatim — the iOS app is
just another client of the same `GET/POST /scores` API.
