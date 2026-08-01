import { useCallback, useEffect, useState } from 'react'
import { listActiveAreas, type Area } from '@/data/areasRepo'
import { useAuth } from '@/hooks/useAuth'

export function useAreas() {
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
      const next = await listActiveAreas(user.uid)
      setAreas(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar áreas.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { areas, loading, error, refresh, setAreas }
}
