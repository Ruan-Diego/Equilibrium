import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import { setAreaScore } from '@/data/setAreaScore'
import type { Score } from '@/domain/score'
import { useAuth } from '@/hooks/useAuth'
import type { Area } from '@/data/areasRepo'

type UseSetAreaScoreOptions = {
  areas: Area[]
  setAreas: Dispatch<SetStateAction<Area[]>>
  onSuccess?: () => void | Promise<void>
}

export function useSetAreaScore({
  areas,
  setAreas,
  onSuccess,
}: UseSetAreaScoreOptions) {
  const { user } = useAuth()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const commitScore = useCallback(
    async (areaId: string, next: Score) => {
      if (!user) return

      const previous = areas.find((a) => a.id === areaId)?.score
      if (previous === undefined || previous === next) return

      setAreas((list) =>
        list.map((a) => (a.id === areaId ? { ...a, score: next } : a)),
      )
      setPendingId(areaId)

      try {
        await setAreaScore(user.uid, areaId, next)
        await onSuccess?.()
      } catch (err) {
        setAreas((list) =>
          list.map((a) =>
            a.id === areaId ? { ...a, score: previous } : a,
          ),
        )
        toast.error(
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar. Tente de novo.',
        )
      } finally {
        setPendingId(null)
      }
    },
    [user, areas, setAreas, onSuccess],
  )

  return { commitScore, pendingId }
}
