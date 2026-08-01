import { describe, expect, it } from 'vitest'
import { isBalanced } from './balance'

describe('isBalanced', () => {
  it('returns false for empty scores', () => {
    expect(isBalanced([])).toBe(false)
  })

  it('returns true for a single score of 7', () => {
    expect(isBalanced([7])).toBe(true)
  })

  it('returns false when any score is below 7', () => {
    expect(isBalanced([7, 6])).toBe(false)
  })

  it('returns true when all scores are 7 or above', () => {
    expect(isBalanced([9, 9, 7])).toBe(true)
  })
})
