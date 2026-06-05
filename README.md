# Rodent's Revenge — Modern Remake

> ⚠️ **Working title.** "Rodent's Revenge" is the name of the 1991 Microsoft
> Entertainment Pack puzzle game this project is inspired by. The repo will be
> **renamed before any public release** and shipped under an original name. Until
> then, consider keeping this repository **private** (see [Naming & IP](#naming--ip)).

A modern, cross-platform remake of the classic grid puzzle game where a mouse
pushes blocks to trap pursuing cats and turn them into cheese. Built web-first,
with an iOS app planned via Capacitor.

**Project status:** 🟡 Planning / pre-code. The design and architecture are
documented; implementation has not started yet.

---

## The Game in One Paragraph

You're a mouse on a grid. Cats chase you. You push blocks to wall them in — once a
cat is fully enclosed with no path to open space, it's trapped and becomes cheese
you can eat for points. Clear all the cats to advance. The modern version layers
on new block types, power-ups, hazards, and time-warping tiles while keeping the
original push-block feel intact.

---

## Repository Structure

```
.
├── README.md                  ← you are here
├── .gitignore
└── docs/
    ├── modernization-plan.md  ← full architectural blueprint (the "why")
    └── technical-spec.md      ← condensed implementation spec (the "what")
```

Planned structure once implementation begins (from the spec):

```
src/
├── engine/        Pure TypeScript — Grid, AI, physics, BFS. No framework deps.
├── hooks/         React hooks — useGameLoop, useInput.
├── components/    React + Tailwind presentation layer.
└── store/         Global state (Zustand or Redux) — scores, settings.
ios/               Capacitor-generated Xcode project.
```

---

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Rendering | 2D Canvas (grid/entities) + React (UI overlays) |
| Native bridge | Capacitor (iOS) |
| State | Zustand or Redux (TBD) |

The guiding architectural principle: **the engine is the single source of truth**
for game state; React is just a view that reflects it. Game logic lives in
`/src/engine` as pure, unit-testable TypeScript with zero framework dependencies.

---

## Documentation

- **[`docs/modernization-plan.md`](docs/modernization-plan.md)** — The long-form
  blueprint: AI pathfinding, enclosure detection, the five proposed modern
  mechanics, performance strategy, and the full reasoning behind each decision.
- **[`docs/technical-spec.md`](docs/technical-spec.md)** — The condensed spec,
  written to be handed directly to a developer or used as an implementation prompt.

---

## Roadmap

1. **Engine-first.** Build and unit-test `GameGrid` and `CatAI` in isolation —
   prove the flood-fill enclosure logic is correct before any rendering exists.
2. **Input abstraction.** Unified `InputManager` mapping keyboard, virtual D-pad,
   and swipe to one command set.
3. **Rendering + loop.** 2D canvas grid + `useGameLoop` (rAF + delta time).
4. **Modern mechanics.** Layer in elemental/degradable blocks, power-ups, hazards.
5. **iOS build.** Wire up Capacitor; test on simulator and device early.
6. **Polish.** Audio, haptics, transitions; performance profiling for 60 fps.

---

## Getting Started

> Implementation hasn't started yet, so there's nothing to run. Once the engine
> and a Vite/React scaffold land, this section will cover `npm install`, dev
> server, and the iOS build steps. Tracked as a roadmap item.

---

## Naming & IP

This project recreates a Microsoft-published game and currently uses its
trademarked name as a working title. Before going public:

- Pick an **original name** and rename the repo, the Capacitor `appId`/`appName`,
  and all in-game references.
- Use **original art and audio** rather than assets from the 1991 game.
- Decide on a **license** (none chosen yet — without one, the code is "all rights
  reserved" by default).

Keeping the repo private until the rename is the lowest-risk path.

---

## License

No license has been selected yet. See [Naming & IP](#naming--ip).
