export type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type ScoreStatus = 'healthy' | 'attention' | 'alert'

export const SCORE_MIN = 0
export const SCORE_MAX = 10

export function clampScore(n: number): Score {
  const rounded = Math.round(n)
  const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, rounded))
  return clamped as Score
}

export function statusFromScore(score: number): ScoreStatus {
  if (score >= 8) return 'healthy'
  if (score >= 5) return 'attention'
  return 'alert'
}
