# Technical Spec — Rodent's Revenge Modernization

> **Status:** Planning. This is the condensed implementation spec. For the full
> reasoning behind each decision, see [`modernization-plan.md`](./modernization-plan.md).
>
> This document is meant to read as a strict system specification — i.e. it can be
> handed to a developer (or used as an implementation prompt) more or less as-is.

---

## 1. Logic Decomposition

### Cat AI Pathfinding

The feline AI follows deterministic, greedy pursuit logic. For performance on
complex layouts, implement **A\* with a Manhattan distance heuristic**.

**Manhattan distance formula:**

```
distance = |x₁ − x₂| + |y₁ − y₂|
```

**AI update logic (pseudocode):**

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

    // If both direct paths are blocked, the cat enters an 'Idle' state
    HANDLE_BLOCKED_CAT(cat)

FUNCTION is_tile_walkable(target_pos, grid):
    TILE_TYPE = grid.get(target_pos)
    // Cats cannot walk through blocks, walls, or other cats
    IF TILE_TYPE == EMPTY OR TILE_TYPE == MOUSE_TRAP:
        RETURN TRUE
    RETURN FALSE
```

- **Priority & avoidance:** Cats must not stack on the same tile; treat other
  active cats as dynamic obstacles.
- **Diagonal slip:** Cats can "slip" diagonally between two catty-cornered blocks
  when an open diagonal space exists.

### Enclosure Detection

Trapping is defined by an absolute **reachability failure** — the cat cannot
navigate to any free / open-ended tile. It's often drawn as an 8-block perimeter,
but the logical check is reachability, not a strict geometric square.

**Trapped-state algorithm (flood fill / BFS):**

- Trigger the check whenever a block is pushed adjacent to a cat.
- Start a BFS from the cat's current coordinates `(x, y)`.
- If the BFS reaches a grid boundary or an open "free air" region, the cat is free.
- If the queue is exhausted with no escape route found, set `cat.state = TRAPPED`
  and replace the tile with `CHEESE`.

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
```

---

## 2. Modern Mechanics

The modernization layer adds strategic variables to expand grid interactions
without diluting the core push-block identity.

| Mechanic | Technical Implementation | Strategic Impact |
| :--- | :--- | :--- |
| **Elemental Blocks** | Extend the `Block` class with a property attribute (e.g. `Ice`, `Magnet`). | Ice slides until it hits a boundary; magnets pull adjacent metal elements. |
| **Degradable Blocks** | Add `hp` metadata to specific wall/block tiles. | Blocks crack or shatter after N pushes, introducing resource scarcity. |
| **Super Mouse Power-up** | Temporary state: push multiple blocks at once, or destroy static cement walls. | Lets players recover from deadlock or cornered states. |
| **Interactive Hazards** | Timer-based sink holes (stun penalty) and mobile yarn balls (moving hazards). | Navigation becomes an active puzzle, independent of cat tracking. |
| **Temporal Distortions** | Hook into `useGameLoop` to scale the delta-time multiplier (`dt`). | Alternates high-tension "fast" phases with strategic "slow" phases. |

---

## 3. Tech Stack & Architecture

### Project Structure (React + Capacitor)

Enforce a strict separation between engine calculation and visual presentation.

- **`/src/engine`** — Pure, framework-agnostic TypeScript. Coordinate math, BFS
  checks, path calculation (`Grid.ts`, `EntityManager.ts`, `AI.ts`).
- **`/src/hooks`** — React hooks for the system loop and input managers
  (`useGameLoop.ts`, `useInput.ts`).
- **`/src/components`** — Pure presentation views built with Tailwind CSS.
- **`/ios`** — Xcode project and CocoaPods layer generated by the Capacitor bridge.

### High-Performance Game Loop

To hold a stable 60 fps on mobile Safari, use `requestAnimationFrame` (rAF) with a
mutable React-ref pattern to avoid React's reconciliation overhead.

- **Delta-time (`dt`) scaling:** Always compute elapsed frame time so movement
  speeds stay uniform regardless of hardware refresh rate.
- **Ref-based mutation:** Mutate coordinates and grids directly in a `useRef`
  object. Only push to React state (triggering a re-render) for top-level UI
  overlays like score and timer.

### iOS / Safari Performance Optimizations

- **GPU offloading:** Promote the rendering container to its own composite layer
  via Tailwind `will-change-transform` and `transform-gpu` (`transform: translateZ(0)`).
- **Low Power Mode adaptation:** iOS Safari throttles rAF to 30 fps in power-restricted
  modes, so delta-time calculations must persist to keep movement speeds consistent.
- **Viewport constraints:** Include `viewport-fit=cover` in the entry HTML header
  so the canvas renders around the iOS notch and status bar.
- **Eliminate input latency:** Set Tailwind `touch-none` (`touch-action: none`) on
  the interaction wrapper to disable default Safari gestures and browser delays.

---

## Sources & Further Reading

- Rodent's Revenge — Wikipedia: <https://en.wikipedia.org/wiki/Rodent%27s_Revenge>
- "Rodent's Revenge" — Ivana Pagan (Medium): <https://medium.com/@ivana.pagan/rodents-revenge-4ff0801f62fe>
- Rodent's Revenge Review for PC — GameFAQs/GameSpot: <https://gamefaqs.gamespot.com/pc/580014-rodents-revenge/reviews/16717>
- Tactical Pathfinding: Beyond A\* — YouTube: <https://www.youtube.com/watch?v=IMl9J1Tx6GY>
- A\* with diagonal movement — MonoGame community: <https://community.monogame.net/t/make-a-pathing-accept-diagonal-movement-help/14451>
- Grid cell within an enclosed perimeter — Stack Overflow: <https://stackoverflow.com/questions/42968171/how-to-determine-if-a-grid-cell-is-within-an-enclosed-perimeter-of-cells>
- React Folder Structure Best Practices — Robin Wieruch: <https://www.robinwieruch.de/react-folder-structure/>
- Using Capacitor with React — official: <https://capacitorjs.com/solution/react>
