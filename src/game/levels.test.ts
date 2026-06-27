import { describe, expect, it } from 'vitest'
import { LEVELS, getLevelConfig } from './levels'
import { createInitialState, continueToNextLevel } from './rodentEngine'
import { GRID_SIZE } from './types'

const MOUSE_START = { x: 10, y: 10 }

describe('getLevelConfig', () => {
  it('returns the first layout for level 1', () => {
    expect(getLevelConfig(1).id).toBe(LEVELS[0].id)
  })

  it('cycles through layouts as levels advance', () => {
    expect(getLevelConfig(LEVELS.length + 1).id).toBe(LEVELS[0].id)
    expect(getLevelConfig(LEVELS.length + 2).id).toBe(LEVELS[1].id)
  })

  it('clamps non-positive levels to the first layout', () => {
    expect(getLevelConfig(0).id).toBe(LEVELS[0].id)
    expect(getLevelConfig(-3).id).toBe(LEVELS[0].id)
  })
})

describe('level layouts are well-formed', () => {
  for (const lvl of LEVELS) {
    const cells = [...lvl.blocks, ...(lvl.cracked ?? []), ...(lvl.powerups ?? [])]
    it(`level "${lvl.name}" keeps tiles inside the inner field`, () => {
      for (const c of cells) {
        expect(c.x).toBeGreaterThanOrEqual(1)
        expect(c.y).toBeGreaterThanOrEqual(1)
        expect(c.x).toBeLessThanOrEqual(GRID_SIZE - 2)
        expect(c.y).toBeLessThanOrEqual(GRID_SIZE - 2)
      }
    })

    it(`level "${lvl.name}" has no duplicate tile coordinates`, () => {
      const keys = cells.map((c) => `${c.x},${c.y}`)
      expect(new Set(keys).size).toBe(keys.length)
    })
  }
})

describe('engine consumes level configs', () => {
  it('builds level 1 with the mouse start kept clear', () => {
    const s = createInitialState()
    expect(s.grid[MOUSE_START.y][MOUSE_START.x]).toBe('empty')
  })

  it('keeps active cat spawns clear of layout tiles', () => {
    const s = continueToNextLevel(createInitialState()) // level 2
    for (const cat of s.cats) {
      expect(s.grid[cat.y][cat.x]).toBe('empty')
    }
  })
})
