import { useCallback, useEffect, useState } from 'react'
import { listEventsForArea } from '@/data/eventsRepo'
import { useAuth } from '@/hooks/useAuth'

export type HistoryRange = '7' | '30' | 'all'

export interface HistoryPoint {
  at: Date
  value: number
}

function sinceForRange(range: HistoryRange): Date | undefined {
  if (range === 'all') return undefined
  const days = range === '7' ? 7 : 30
  const since = new Date()
  since.setTime(since.getTime() - days * 24 * 60 * 60 * 1000)
  return since
}

function eventsToStepSeries(
  events: Awaited<ReturnType<typeof listEventsForArea>>,
): HistoryPoint[] {
  return events.map((event) => ({
    at: event.createdAt.toDate(),
    value: event.value,
  }))
}

export function useAreaHistory(areaId: string | null, range: HistoryRange) {
  const { user } = useAuth()
  const [points, setPoints] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user || !areaId) {
      setPoints([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const events = await listEventsForArea(
        user.uid,
        areaId,
        sinceForRange(range),
      )
      setPoints(eventsToStepSeries(events))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao carregar histórico.',
      )
      setPoints([])
    } finally {
      setLoading(false)
    }
  }, [user, areaId, range])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { points, loading, error, refresh }
}
