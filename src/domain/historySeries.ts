/** Local calendar day key (YYYY-MM-DD) for daily history aggregation. */
export function localDayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface DailyHistoryPoint {
  /** Calendar day of the point (local timezone). */
  day: string
  /** Timestamp of the last update that day. */
  at: Date
  value: number
}

/**
 * Collapse events to one point per local calendar day.
 * Expects events sorted ascending by time; the last event of each day wins.
 */
export function toDailyHistoryPoints(
  events: { createdAt: Date; value: number }[],
): DailyHistoryPoint[] {
  const byDay = new Map<string, { at: Date; value: number }>()
  for (const event of events) {
    const day = localDayKey(event.createdAt)
    byDay.set(day, { at: event.createdAt, value: event.value })
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, point]) => ({ day, at: point.at, value: point.value }))
}

export interface NamedSeries {
  id: string
  name: string
  points: DailyHistoryPoint[]
}

/** Merge series onto a shared day axis for multi-line charts. */
export function mergeSeriesByDay(
  series: NamedSeries[],
): Record<string, string | number | null>[] {
  const days = new Set<string>()
  for (const s of series) {
    for (const p of s.points) days.add(p.day)
  }
  const sortedDays = [...days].sort()
  const valueBySeriesDay = new Map<string, number>()
  for (const s of series) {
    for (const p of s.points) {
      valueBySeriesDay.set(`${s.id}:${p.day}`, p.value)
    }
  }
  return sortedDays.map((day) => {
    const row: Record<string, string | number | null> = { day }
    for (const s of series) {
      row[s.id] = valueBySeriesDay.get(`${s.id}:${day}`) ?? null
    }
    return row
  })
}

const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#6b8cae',
  '#a67c8a',
  '#8b9a6b',
] as const

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length]!
}
