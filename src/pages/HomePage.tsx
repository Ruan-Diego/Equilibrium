import { Link } from 'react-router-dom'
import { BalanceStatus } from '@/components/balance/BalanceStatus'
import { AreaRail } from '@/components/balance/AreaRail'
import { Button } from '@/components/ui/button'
import { useAreas } from '@/hooks/useAreas'
import { useSetAreaScore } from '@/hooks/useSetAreaScore'
import { isBalanced } from '@/domain/balance'
import { emptyLabel } from '@/domain/labels'

export function HomePage() {
  const { areas, loading, error, refresh, setAreas } = useAreas()
  const { commitScore, pendingId } = useSetAreaScore({
    areas,
    setAreas,
    onSuccess: refresh,
  })

  const scores = areas.map((a) => a.score)
  const balanced = isBalanced(scores)
  const attentionAreaNames = areas
    .filter((a) => a.score < 7)
    .map((a) => a.name)

  if (loading && areas.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Carregando áreas…</div>
    )
  }

  if (error && areas.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  if (areas.length === 0) {
    return (
      <section className="flex min-h-[50vh] flex-col justify-center gap-6">
        <p className="max-w-md text-muted-foreground">{emptyLabel}</p>
        <Button asChild size="lg" className="w-fit">
          <Link to="/areas">Criar área</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-10">
      <BalanceStatus
        balanced={balanced}
        attentionAreaNames={attentionAreaNames}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-6">
        {areas.map((area) => (
          <AreaRail
            key={area.id}
            area={area}
            disabled={pendingId === area.id}
            onScoreCommit={(id, next) => {
              void commitScore(id, next)
            }}
          />
        ))}
      </div>
    </section>
  )
}
