# Modernization Blueprint — Rodent's Revenge

> **Status:** Planning. This is the long-form architectural blueprint. For the
> condensed implementation spec, see [`technical-spec.md`](./technical-spec.md).
>
> **Working title only.** A rename is planned before any public release (see the
> note in the root [`README`](../README.md)).

Rodent's Revenge — a puzzle classic originally created by Christopher Lee Fraley
and distributed in the Microsoft Entertainment Pack 2 (1991) — built its appeal
on deceptively simple spatial logic and deterministic power dynamics. The player
controls a vulnerable mouse that manipulates the environment to neutralize
pursuing cats.

Rebuilding this experience for the web and iOS is more than a graphical
overhaul. It requires decomposing the original logic, layering in modern
mechanical depth, and standing up an architecture that holds high-fidelity
performance across very different hardware.

The core loop turns a threat into a resource. Cats chase the mouse across a
grid; the mouse pushes blocks to form a perimeter. Once a cat is fully enclosed
it is "killed" and becomes cheese, which the player eats for points. That
transformation is a real state change in the underlying grid, not just a visual
flourish — and it's the primary hook for emergent play, since every defensive
maneuver also sets up an offensive trap.

---

## Phase 1 — Logic Decomposition and Computational Foundations

Reconstruction starts with the spatial coordinate system and the rules governing
entity interactions. In the 1991 original the game state was most likely a
two-dimensional array of integers, where each value mapped to a tile type — empty
space, movable block, static cement wall, trap, or entity position. Modernizing
this requires an abstraction layer that separates the **logical grid** from the
**rendering layer**, so the engine can compute physics and AI at a fixed
frequency regardless of the visual refresh rate.

### Cat AI Pathfinding

The cat AI is a persistent, greedy pursuit of the player. It can be modeled as a
simplified pathfinding problem: the agent prioritizes reducing distance to the
target while navigating around obstacles. In the original 16-bit environment this
was likely a simple "check-and-move" heuristic that favored the axis with the
greatest distance delta.

For a modern implementation the pathfinding needs to be robust on complex layouts
without appearing omniscient (which frustrates players). The recommended approach
is **A\* search with a Manhattan distance heuristic** for grid movement:

```
distance = |x₁ − x₂| + |y₁ − y₂|
```

This heuristic is ideal for orthogonal grids where diagonal movement is
prohibited or penalized. The cat evaluates the cost of moving to each adjacent
tile and picks the one that minimizes estimated total distance to the mouse.

#### Pseudocode — Greedy Cat Pursuit

```typescript
// Define the core Cat entity behavior
FUNCTION update_cat_logic(cat, mouse_pos, grid):
    // Determine the vector to the player
    DELTA_X = mouse_pos.x - cat.pos.x
    DELTA_Y = mouse_pos.y - cat.pos.y

    // Determine primary and secondary axes based on distance
    IF abs(DELTA_X) >= abs(DELTA_Y):
        PRIMARY_DIR   = (sign(DELTA_X), 0)
        SECONDARY_DIR = (0, sign(DELTA_Y))
    ELSE:
        PRIMARY_DIR   = (0, sign(DELTA_Y))
        SECONDARY_DIR = (sign(DELTA_X), 0)

    // Attempt to move along the primary axis first
    IF is_tile_walkable(cat.pos + PRIMARY_DIR, grid):
        MOVE_CAT(cat, cat.pos + PRIMARY_DIR)
        RETURN

    // If blocked, attempt the secondary axis
    IF is_tile_walkable(cat.pos + SECONDARY_DIR, grid):
        MOVE_CAT(cat, cat.pos + SECONDARY_DIR)
        RETURN

    // If both direct paths are blocked, the cat enters an 'Idle' / 'Search' state
    HANDLE_BLOCKED_CAT(cat)

FUNCTION is_tile_walkable(target_pos, grid):
    TILE_TYPE = grid.get(target_pos)
    // Cats cannot walk through blocks, walls, or other cats
    IF TILE_TYPE == EMPTY OR TILE_TYPE == MOUSE_TRAP:
        RETURN TRUE
    RETURN FALSE
```

This greedy logic keeps the cat a persistent threat. A modern build must also
handle the "stuck" state: with multiple cats present, they should treat one
another as temporary obstacles so they can't stack on a single tile, which would
otherwise glitch the trapping logic.

### Enclosure Logic — The Geometry of the Trap

The defining mechanic is trapped-state detection. A cat is trapped when it is
fully enclosed by blocks or walls with zero valid moves. Some descriptions
emphasize a "perfect square" of eight blocks, but the real requirement is a
**reachability failure**: if the cat can't reach the mouse or any open area of the
board, it's trapped.

The most efficient and robust check is a **flood fill**. Whenever the mouse
pushes a block, the engine evaluates the area around any nearby cat to see if an
enclosure has formed.

#### Pseudocode — Enclosure Detection (Reachability)

```typescript
FUNCTION detect_trapped_state(cat_start_pos, grid):
    // Breadth-First Search (BFS) looking for "free air"
    QUEUE = [cat_start_pos]
    VISITED = new Set()
    VISITED.add(cat_start_pos)

    WHILE QUEUE is not empty:
        CURRENT_TILE = QUEUE.pop_first()

        // Reaching an edge / unenclosed tile means the cat is NOT trapped
        IF is_boundary_edge(CURRENT_TILE):
            RETURN FALSE

        // Check 4-connected neighbors (N, S, E, W)
        FOR each NEIGHBOR in get_neighbors(CURRENT_TILE):
            TILE_TYPE = grid.get(NEIGHBOR)

            // If the cat can move into this tile and we haven't visited it yet
            IF TILE_TYPE == EMPTY AND NEIGHBOR not in VISITED:
                VISITED.add(NEIGHBOR)
                QUEUE.push(NEIGHBOR)

    // Queue exhausted with no exit found -> trapped
    RETURN TRUE

FUNCTION handle_trap_event(grid):
    FOR each CAT in current_level:
        IF detect_trapped_state(CAT.pos, grid):
            CAT.state = TRAPPED
            TRANSFORM_TILE(CAT.pos, CHEESE)
            PLAY_EFFECT("trap_success")
```

The cat-to-cheese transformation must integrate tightly with scoring, where
cheese is both a level-completion requirement and a point multiplier. The engine
also tracks active cat count: when all visible cats are trapped, the level
advances or new cats spawn based on the internal clock.

---

## Phase 2 — Modernization and Strategic Depth

The core mechanics are strong, but a modern audience wants deeper layers to
sustain engagement. The goal is to expand grid utility and entity interactions
**without losing the push-block soul** of the original.

### The Push-Block Lineage

The Sokoban style of block pushing — moving objects onto fixed targets — is the
genre's ancestor. Rodent's Revenge deviated by making the targets dynamic (the
cats) and the environment hazardous. Modernization should lean into that
dynamism by introducing environmental variables that force adaptation.

### Five Modern Mechanics

| Mechanic | Technical Implementation | Impact on Strategy |
| :--- | :--- | :--- |
| **Elemental Blocks** | Blocks with properties like "Ice" (slides until hit) or "Magnet" (pulls adjacent blocks). | Shifts spatial math from single moves to momentum-based planning. |
| **Cracked / Degradable Blocks** | Blocks with an `hp` counter that decreases on each push. | Introduces scarcity; you can't infinitely reposition walls to trap cats. |
| **"Super Mouse" Power-up** | A temporary state to push multiple blocks at once or smash through cement. | Lets the player recover from deadlock situations. |
| **Temporal Distortions** | Floor tiles or events that speed up / slow down the internal clock and cat AI. | Alters spawn rate and movement speed for high-tension intervals. |
| **Interactive Hazards** | Teleport portals or sink holes that trap the mouse temporarily. | Makes navigation a puzzle in itself, not just a backdrop for cats. |

Implementing these needs an extensible tile system where each cell can hold
metadata (`hp` for cracked blocks, `charge` for magnets). That metadata is
processed during the loop's **Calculate** phase, before the **Render** phase.

### Second-Order Insight — The Psychology of the Hunt

The appeal is the role reversal from prey to predator. A modern adaptation can
emphasize this with *emergent complexity*: the environment reacts to success. As
more cats become cheese, the survivors could grow more aggressive — or even eat
cheese themselves to grow larger, requiring more blocks to trap. That creates a
difficulty curve that scales **within** a single level, keeping play from going
stale.

---

## Phase 3 — Tech Stack, Architecture, and Cross-Platform Engineering

A cross-platform Web + iOS build needs a stack that balances developer velocity
with high-performance execution. The proposed stack: **React** for UI,
**Tailwind CSS** for responsive styling, and **Capacitor** as the native bridge
for iOS.

### The Unified React + Capacitor Pipeline

React + Capacitor lets you keep a single TypeScript codebase while reaching
native iOS features (haptics, local storage, the WebKit engine). Unlike React
Native — which maps to native UI components — Capacitor renders the web app in a
native WebView, giving near-total visual parity between browser and app.

### Proposed Project Structure

A clean separation of concerns keeps game logic isolated from the rendering
framework:

| Directory | Responsibility | Shared-Logic Benefit |
| :--- | :--- | :--- |
| `/src/engine` | Pure TypeScript classes for Grid, AI, Physics. | Zero dependencies; unit-testable in Node.js. |
| `/src/components` | React components for UI, menus, overlays. | Responsive layouts for desktop / mobile. |
| `/src/hooks` | React hooks (`useGameLoop`, `useInputs`). | Abstracts keyboard and touch events. |
| `/src/store` | Global state (Zustand or Redux). | Persists settings and high scores across platforms. |
| `/ios` | Native Xcode project generated by Capacitor. | Handles iOS-specific concerns (splash screens). |

Code flows in one direction — from shared utilities into features, and from
features into pages. The engine is the **single source of truth** for grid
state; React is a **view** that reflects it.

### The 60 fps Imperative

The hardest part of web game dev is holding 60 fps, especially on mobile Safari.
Standard React state (`useState`) is too slow for a high-frequency animation loop
because every update re-renders the component tree (DOM diffing + reconciliation).

The fix is a **mutable-ref pattern** combined with `requestAnimationFrame` (rAF).

#### Implementation — the `useGameLoop` Hook

```typescript
import { useEffect, useRef } from 'react';

export const useGameLoop = (updateCallback: (dt: number) => void) => {
  const frameId = useRef<number>();
  const lastTime = useRef<number>(performance.now());

  const loop = (currentTime: number) => {
    // Delta time in seconds
    const dt = (currentTime - lastTime.current) / 1000;
    lastTime.current = currentTime;

    // Update game logic with delta time
    updateCallback(dt);

    // Schedule next frame
    frameId.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    frameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId.current!);
  }, [updateCallback]);
};
```

Here `updateCallback` mutates a game-state ref. Rendering is then handled either
by a high-performance 2D canvas or by React components that re-render only when
necessary. For a grid game like this, **2D canvas for the grid and entities** plus
**React/Tailwind for UI overlays** (score, menu, timer) is the recommended split.

### Mobile Safari Constraints and Throttling

Mobile Safari can silently drop to 30 fps — typically in Low Power Mode or when it
decides the page is burning too much CPU.

1. **Delta-time persistence** — Always use the rAF timestamp for movement. If the
   frame rate drops to 30 fps, cats still move at the same real-world speed and the
   game doesn't feel sluggish.
2. **CSS layer promotion** — Apply `transform: translateZ(0)` or
   `will-change: transform` to the game container so the browser offloads its
   rendering to the GPU.
3. **Passive touch listeners** — Register virtual D-pad touch events as passive so
   they don't block the scroll thread (which causes input lag).
4. **Audio context resilience** — iOS Safari requires a user gesture to unlock
   audio. A "Start" button must resume the `AudioContext` so trap/cheese SFX are
   audible.
5. **Memory management** — Avoid allocating new objects inside the loop callback.
   Reuse vectors and coordinate objects (object pooling) to keep the garbage
   collector from triggering mid-game (a common cause of jank).

### Shared Logic and Native Interaction

Capacitor moves from browser to iOS via a config file defining identity and
native capabilities:

```json
{
  "appId": "com.rodentsrevenge.modern",
  "appName": "Rodent's Revenge",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "Haptics": {
      "impactStyle": "Heavy"
    }
  }
}
```

The `@capacitor/haptics` plugin can fire a physical vibration when a cat is
trapped — a satisfying modern touch. `@capacitor/storage` keeps high scores and
unlocked levels in sync between web sessions and the native app.

---

## Technical Synthesis

Phases 1–3 combine into something larger than their parts. Decomposing the
original AI and enclosure logic lets the build rest on a foundation that supports
the new mechanics. A high-frequency loop with delta timing keeps complex
interactions — magnetic blocks pulling multiple cats into a trap — smooth at 60 fps
on both a laptop and an iPhone.

React + Tailwind also enable a web-first iteration advantage: the UI can be
revised and deployed without waiting on App Store review, and live JS-bundle
updates can fix pathfinding bugs or rebalance power-ups quickly — a
games-as-a-service approach to keeping the game evolving with player feedback.

---

## Recommended Implementation Roadmap

1. **Engine-first development.** Build the pure-TypeScript `GameGrid` and `CatAI`
   classes first, tested in isolation, so the flood-fill enclosure logic is
   provably correct before any rendering exists.
2. **Input abstraction.** Build a unified `InputManager` that maps keyboard
   arrows, virtual D-pad taps, and swipe gestures to a single command set, keeping
   shared logic hardware-agnostic.
3. **Performance profiling.** Use Chrome DevTools and Safari Web Inspector to watch
   main-thread usage during the loop. If combined logic + render exceeds ~14 ms,
   investigate moving AI pathfinding to a Web Worker.
4. **Visual and auditory polish.** The 1991 version was silent; the modern build
   should use `AudioContext` and CSS transitions for feedback on every action.
5. **Native bridge testing.** Build the iOS target early using the Xcode simulator
   and physical devices to catch Safari-specific rendering and touch-latency
   issues.

The goal: preserve the "infuriating and fun" character of the 1991 classic on a
foundation that's robust, performant, and ready for modern cross-platform release.

---

## Sources & Further Reading

These were collected during research and are kept for reference. Many are
informal (YouTube, Reddit, forum threads); treat them as background rather than
authoritative.

**The original game**
- Rodent's Revenge — Wikipedia: <https://en.wikipedia.org/wiki/Rodent%27s_Revenge>
- Rodent's Revenge (Windows 3.1) — ClassicReload: <https://classicreload.com/win3x-rodents-revenge.html>
- Rodent's Revenge — Codex Gamicus: <https://gamicus.fandom.com/wiki/Rodent%27s_Revenge>
- Rodent's Revenge Review for PC — GameFAQs/GameSpot: <https://gamefaqs.gamespot.com/pc/580014-rodents-revenge/reviews/16717>
- "Rodent's Revenge" — Ivana Pagan (Medium): <https://medium.com/@ivana.pagan/rodents-revenge-4ff0801f62fe>
- rodents-revenge-ds — Google Code archive: <https://code.google.com/archive/p/rodents-revenge-ds/wikis/HelpPages.wiki>

**Existing remakes / source references**
- Cakell/Rodent-s-Revenge (Jack language): <https://github.com/Cakell/Rodent-s-Revenge>
- pierreyoda/o2r (C++ remake): <https://github.com/pierreyoda/o2r>

**Pathfinding & grid algorithms**
- A\* without diagonal movement — Stack Overflow: <https://stackoverflow.com/questions/40981335/a-pathfinding-without-diagonal-movement>
- Tactical Pathfinding: Beyond A\* — YouTube: <https://www.youtube.com/watch?v=IMl9J1Tx6GY>
- Determining if a grid cell is within an enclosed perimeter — Stack Overflow: <https://stackoverflow.com/questions/42968171/how-to-determine-if-a-grid-cell-is-within-an-enclosed-perimeter-of-cells>
- Detecting fully-closed rooms in a grid — Reddit r/gamedev: <https://www.reddit.com/r/gamedev/comments/1ej85ge/need_help_algorithmpaper_for_detecting/>

**Puzzle / block-pushing design**
- The Post-Block Blast Playbook — Deconstructor of Fun: <https://www.deconstructoroffun.com/blog/2026/1/19/from-tetris-to-block-blast-why-block-puzzles-never-stop-printing>
- How to Design Puzzle Games — Medium: <https://medium.com/design-bootcamp/how-to-design-puzzle-games-319aef443c44>
- How to Design a Puzzle Game (Complete Guide) — Machinations.io: <https://machinations.io/articles/how-to-design-a-puzzle-game>

**React / Capacitor / performance**
- Anatomy of a video game — MDN: <https://developer.mozilla.org/en-US/docs/Games/Anatomy>
- Capacitor + React (Noqta tutorial): <https://noqta.tn/en/tutorials/capacitor-react-mobile-app-ios-android-2026>
- Using Capacitor with React — official: <https://capacitorjs.com/solution/react>
- React Folder Structure Best Practices — Robin Wieruch: <https://www.robinwieruch.de/react-folder-structure/>
- Improve Web Performance With requestAnimationFrame — DebugBear: <https://www.debugbear.com/blog/requestanimationframe>
- Using requestAnimationFrame with React Hooks — CSS-Tricks: <https://css-tricks.com/using-requestanimationframe-with-react-hooks/>
- When iOS throttles requestAnimationFrame to 30fps — Popmotion: <https://popmotion.io/blog/20180104-when-ios-throttles-requestanimationframe/>
- Safari requestAnimationFrame running at 30fps — Stack Overflow: <https://stackoverflow.com/questions/74071316/safari-requestanimationframe-running-at-30fps>
