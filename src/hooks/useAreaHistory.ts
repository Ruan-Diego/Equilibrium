import { useCallback, useEffect, useMemo, useState } from 'react'
import { listEventsForArea } from '@/data/eventsRepo'
import {
  toDailyHistoryPoints,
  type DailyHistoryPoint,
  type NamedSeries,
} from '@/domain/historySeries'
import { useAuth } from '@/hooks/useAuth'

export type HistoryRange = '7' | '30' | 'all'

/** Sentinel area id for overlaying every active area on one chart. */
export const ALL_AREAS_ID = '__all__'

export type HistoryPoint = DailyHistoryPoint

export interface HistoryAreaMeta {
  id: string
  name: string
}

function sinceForRange(range: HistoryRange): Date | undefined {
  if (range === 'all') return undefined
  const days = range === '7' ? 7 : 30
  const since = new Date()
  since.setTime(since.getTime() - days * 24 * 60 * 60 * 1000)
  return since
}

async function loadDailyPoints(
  uid: string,
  areaId: string,
  range: HistoryRange,
): Promise<DailyHistoryPoint[]> {
  const events = await listEventsForArea(uid, areaId, sinceForRange(range))
  return toDailyHistoryPoints(
    events.map((event) => ({
      createdAt: event.createdAt.toDate(),
      value: event.value,
    })),
  )
}

export function useAreaHistory(
  areaId: string | null,
  range: HistoryRange,
  areas: HistoryAreaMeta[] = [],
) {
  const { user } = useAuth()
  const [series, setSeries] = useState<NamedSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const areasKey = useMemo(
    () => areas.map((a) => `${a.id}\0${a.name}`).join('\n'),
    [areas],
  )

  const refresh = useCallback(async () => {
    if (!user || !areaId) {
      setSeries([])
      setLoading(false)
      setError(null)
      return
    }

    const areaMeta: HistoryAreaMeta[] = areasKey
      ? areasKey.split('\n').map((line) => {
          const [id = '', name = ''] = line.split('\0')
          return { id, name }
        })
      : []

    setLoading(true)
    setError(null)
    try {
      if (areaId === ALL_AREAS_ID) {
        const loaded = await Promise.all(
          areaMeta.map(async (area) => ({
            id: area.id,
            name: area.name,
            points: await loadDailyPoints(user.uid, area.id, range),
          })),
        )
        setSeries(loaded)
      } else {
        const meta = areaMeta.find((a) => a.id === areaId)
        const points = await loadDailyPoints(user.uid, areaId, range)
        setSeries([
          {
            id: areaId,
            name: meta?.name ?? 'Área',
            points,
          },
        ])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar histórico.',
      )
      setSeries([])
    } finally {
      setLoading(false)
    }
  }, [user, areaId, range, areasKey])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const points = series.length === 1 ? series[0]!.points : []
  const hasPoints = series.some((s) => s.points.length > 0)

  return { series, points, hasPoints, loading, error, refresh }
}
