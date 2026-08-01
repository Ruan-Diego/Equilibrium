import type { ScoreStatus } from './score'

export const statusLabels: Record<ScoreStatus, string> = {
  healthy: 'Em boa atenção',
  attention: 'Merece mais cuidado',
  alert: 'Pede a sua atenção',
}

export const balanceLabels = {
  balanced: 'Equilibrado',
  unbalanced: 'Fora de equilíbrio',
} as const

export const emptyLabel = 'Crie a primeira área da vida'

export const labels = {
  healthy: statusLabels.healthy,
  attention: statusLabels.attention,
  alert: statusLabels.alert,
  balanced: balanceLabels.balanced,
  unbalanced: balanceLabels.unbalanced,
  empty: emptyLabel,
} as const
