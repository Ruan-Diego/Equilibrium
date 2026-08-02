export function clampIntroIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.max(0, Math.min(count - 1, index))
}

export function nextIntroIndex(index: number, count: number): number {
  return clampIntroIndex(index + 1, count)
}

export function prevIntroIndex(index: number, count: number): number {
  return clampIntroIndex(index - 1, count)
}

/** Negative drag (swipe left) advances; positive drag (swipe right) goes back. */
export function introIndexFromDrag(
  index: number,
  count: number,
  offsetX: number,
  velocityX: number,
  width: number,
  thresholdRatio = 0.25,
): number {
  const threshold = Math.max(48, width * thresholdRatio)
  const shouldAdvance = offsetX < -threshold || velocityX < -500
  const shouldGoBack = offsetX > threshold || velocityX > 500

  if (shouldAdvance) return nextIntroIndex(index, count)
  if (shouldGoBack) return prevIntroIndex(index, count)
  return clampIntroIndex(index, count)
}
