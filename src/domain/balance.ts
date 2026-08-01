export function isBalanced(scores: number[]): boolean {
  return scores.length > 0 && scores.every((s) => s >= 8)
}
