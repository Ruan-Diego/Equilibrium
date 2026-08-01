import { describe, expect, it } from 'vitest'
import {
  localDayKey,
  mergeSeriesByDay,
  toDailyHistoryPoints,
} from './historySeries'

describe('localDayKey', () => {
  it('formats local calendar day as YYYY-MM-DD', () => {
    const date = new Date(2026, 7, 1, 23, 45, 0)
    expect(localDayKey(date)).toBe('2026-08-01')
  })
})

describe('toDailyHistoryPoints', () => {
  it('keeps the last update of each local day', () => {
    const points = toDailyHistoryPoints([
      { createdAt: new Date(2026, 7, 1, 9, 0), value: 3 },
      { createdAt: new Date(2026, 7, 1, 18, 30), value: 7 },
      { createdAt: new Date(2026, 7, 2, 10, 0), value: 8 },
    ])
    expect(points).toEqual([
      {
        day: '2026-08-01',
        at: new Date(2026, 7, 1, 18, 30),
        value: 7,
      },
      {
        day: '2026-08-02',
        at: new Date(2026, 7, 2, 10, 0),
        value: 8,
      },
    ])
  })

  it('returns one point when all events share a day', () => {
    const points = toDailyHistoryPoints([
      { createdAt: new Date(2026, 7, 1, 8, 0), value: 1 },
      { createdAt: new Date(2026, 7, 1, 12, 0), value: 5 },
      { createdAt: new Date(2026, 7, 1, 20, 0), value: 9 },
    ])
    expect(points).toHaveLength(1)
    expect(points[0]?.value).toBe(9)
  })

  it('returns empty for no events', () => {
    expect(toDailyHistoryPoints([])).toEqual([])
  })
})

describe('mergeSeriesByDay', () => {
  it('aligns multiple series on shared days with null gaps', () => {
    const rows = mergeSeriesByDay([
      {
        id: 'a',
        name: 'Trabalho',
        points: [
          { day: '2026-08-01', at: new Date(2026, 7, 1), value: 5 },
          { day: '2026-08-03', at: new Date(2026, 7, 3), value: 8 },
        ],
      },
      {
        id: 'b',
        name: 'Saúde',
        points: [
          { day: '2026-08-02', at: new Date(2026, 7, 2), value: 6 },
        ],
      },
    ])
    expect(rows).toEqual([
      { day: '2026-08-01', a: 5, b: null },
      { day: '2026-08-02', a: null, b: 6 },
      { day: '2026-08-03', a: 8, b: null },
    ])
  })
})
