import { useCallback, useEffect, useState } from 'react'
import {
  listActiveAreas,
  listAreas,
  type Area,
} from '@/data/areasRepo'
import { useAuth } from '@/hooks/useAuth'

type UseAreasOptions = {
  /** When true, includes inactive areas (manage page). Default: active only. */
  includeInactive?: boolean
}

export function useAreas(options: UseAreasOptions = {}) {
  const { includeInactive = false } = options
  const { user } = useAuth()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setAreas([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const next = includeInactive
        ? await listAreas(user.uid)
        : await listActiveAreas(user.uid)
      setAreas(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar áreas.')
    } finally {
      setLoading(false)
    }
  }, [user, includeInactive])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { areas, loading, error, refresh, setAreas }
}
