import { describe, expect, it } from 'vitest'
import { isBalanced } from './balance'

describe('isBalanced', () => {
  it('returns false for empty scores', () => {
    expect(isBalanced([])).toBe(false)
  })

  it('returns true for a single score of 8', () => {
    expect(isBalanced([8])).toBe(true)
  })

  it('returns false when any score is below 8', () => {
    expect(isBalanced([8, 7])).toBe(false)
  })

  it('returns true when all scores are 8 or above', () => {
    expect(isBalanced([9, 9, 8])).toBe(true)
  })
})
