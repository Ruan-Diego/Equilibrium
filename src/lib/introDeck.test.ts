import { describe, expect, it } from 'vitest'
import {
  clampIntroIndex,
  introIndexFromDrag,
  nextIntroIndex,
  prevIntroIndex,
} from './introDeck'
import { INTRO_SLIDE_COUNT, introSlides } from '@/content/introSlides'

describe('introSlides', () => {
  it('has six slides with titles and bodies', () => {
    expect(introSlides).toHaveLength(6)
    expect(INTRO_SLIDE_COUNT).toBe(6)
    for (const slide of introSlides) {
      expect(slide.title.length).toBeGreaterThan(0)
      expect(slide.body.length).toBeGreaterThan(0)
      expect(slide.title).not.toMatch(/[—–]/)
      expect(slide.body).not.toMatch(/[—–]/)
    }
  })
})

describe('introDeck helpers', () => {
  it('clamps index within bounds', () => {
    expect(clampIntroIndex(-2, 6)).toBe(0)
    expect(clampIntroIndex(0, 6)).toBe(0)
    expect(clampIntroIndex(5, 6)).toBe(5)
    expect(clampIntroIndex(9, 6)).toBe(5)
  })

  it('advances and goes back with bounds', () => {
    expect(nextIntroIndex(0, 6)).toBe(1)
    expect(nextIntroIndex(5, 6)).toBe(5)
    expect(prevIntroIndex(3, 6)).toBe(2)
    expect(prevIntroIndex(0, 6)).toBe(0)
  })

  it('maps swipe left to next and swipe right to previous', () => {
    expect(introIndexFromDrag(1, 6, -120, 0, 320)).toBe(2)
    expect(introIndexFromDrag(1, 6, 120, 0, 320)).toBe(0)
    expect(introIndexFromDrag(1, 6, -10, 0, 320)).toBe(1)
    expect(introIndexFromDrag(1, 6, 0, -800, 320)).toBe(2)
    expect(introIndexFromDrag(1, 6, 0, 800, 320)).toBe(0)
  })
})
