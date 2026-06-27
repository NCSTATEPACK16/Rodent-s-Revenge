import { describe, expect, it } from 'vitest'
import {
  POINTS_PER_BLOCK,
  POINTS_PER_LEVEL,
  TIME_BONUS_CAP_MS,
  computeScore,
} from './score'

describe('computeScore', () => {
  it('sums cheese, level, block, and time components', () => {
    // 300 cheese + 2*1000 + 10*5 + (600000-60000)/1000 = 300 + 2000 + 50 + 540
    expect(
      computeScore({
        levelsCleared: 2,
        cheesePoints: 300,
        blocksMoved: 10,
        elapsedMs: 60_000,
      }),
    ).toBe(2890)
  })

  it('gives the full time bonus at zero elapsed', () => {
    expect(
      computeScore({ levelsCleared: 0, cheesePoints: 0, blocksMoved: 0, elapsedMs: 0 }),
    ).toBe(TIME_BONUS_CAP_MS / 1000)
  })

  it('clamps the time bonus to zero past the cap', () => {
    expect(
      computeScore({
        levelsCleared: 1,
        cheesePoints: 0,
        blocksMoved: 0,
        elapsedMs: TIME_BONUS_CAP_MS + 999_999,
      }),
    ).toBe(POINTS_PER_LEVEL)
  })

  it('treats negative inputs as zero', () => {
    expect(
      computeScore({
        levelsCleared: -5,
        cheesePoints: -100,
        blocksMoved: -3,
        elapsedMs: -1000,
      }),
    ).toBe(TIME_BONUS_CAP_MS / 1000)
  })

  it('weights levels above individual blocks', () => {
    expect(POINTS_PER_LEVEL).toBeGreaterThan(POINTS_PER_BLOCK)
  })
})
