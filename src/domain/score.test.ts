import { describe, expect, it } from 'vitest'
import { clampScore, statusFromScore } from './score'

describe('statusFromScore', () => {
  it('returns alert for score 0', () => {
    expect(statusFromScore(0)).toBe('alert')
  })

  it('returns alert for score 4 (upper alert bound)', () => {
    expect(statusFromScore(4)).toBe('alert')
  })

  it('returns attention for score 5 (lower attention bound)', () => {
    expect(statusFromScore(5)).toBe('attention')
  })

  it('returns attention for score 7 (upper attention bound)', () => {
    expect(statusFromScore(7)).toBe('attention')
  })

  it('returns healthy for score 8 (lower healthy bound)', () => {
    expect(statusFromScore(8)).toBe('healthy')
  })

  it('returns healthy for score 10', () => {
    expect(statusFromScore(10)).toBe('healthy')
  })
})

describe('clampScore', () => {
  it('clamps below range to 0', () => {
    expect(clampScore(-3)).toBe(0)
  })

  it('clamps above range to 10', () => {
    expect(clampScore(15)).toBe(10)
  })

  it('rounds fractional values to nearest integer within 0–10', () => {
    expect(clampScore(7.4)).toBe(7)
    expect(clampScore(7.6)).toBe(8)
  })
})
