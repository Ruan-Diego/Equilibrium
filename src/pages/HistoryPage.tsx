import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaScoreChart } from '@/components/history/AreaScoreChart'
import { RangeToggle } from '@/components/history/RangeToggle'
import { Button } from '@/components/ui/button'
import { useAreas } from '@/hooks/useAreas'
import {
  ALL_AREAS_ID,
  useAreaHistory,
  type HistoryRange,
} from '@/hooks/useAreaHistory'
import { emptyLabel } from '@/domain/labels'

export function HistoryPage() {
  const { areas, loading: areasLoading, error: areasError, refresh } =
    useAreas()
  const [areaId, setAreaId] = useState<string | null>(null)
  const [range, setRange] = useState<HistoryRange>('30')
  const areaMeta = useMemo(
    () => areas.map((a) => ({ id: a.id, name: a.name })),
    [areas],
  )
  const { series, hasPoints, loading: historyLoading, error: historyError } =
    useAreaHistory(areaId, range, areaMeta)

  useEffect(() => {
    if (areas.length === 0) {
      setAreaId(null)
      return
    }
    if (
      !areaId ||
      (areaId !== ALL_AREAS_ID && !areas.some((a) => a.id === areaId))
    ) {
      setAreaId(areas[0].id)
    }
  }, [areas, areaId])

  if (areasLoading && areas.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">Carregando áreas…</div>
    )
  }

  if (areasError && areas.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{areasError}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
          Tentar de novo
        </Button>
      </div>
    )
  }

  if (areas.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
        <p className="max-w-md text-muted-foreground">{emptyLabel}</p>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link to="/areas">Criar área</Link>
        </Button>
      </section>
    )
  }

  const emptyCopy =
    areaId === ALL_AREAS_ID
      ? 'Ainda não há eventos de atenção no intervalo selecionado. Ajuste os scores na Home para registrar o histórico.'
      : 'Ainda não há eventos de atenção nesta área para o intervalo selecionado. Ajuste o score na Home para registrar o histórico.'

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Área</span>
            <select
              className="h-9 min-w-[12rem] rounded-lg border border-border bg-background px-3 text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={areaId ?? ''}
              onChange={(e) => setAreaId(e.target.value)}
            >
              <option value={ALL_AREAS_ID}>Todas as áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
          <RangeToggle value={range} onChange={setRange} disabled={!areaId} />
        </div>
      </header>

      {historyError ? (
        <p className="text-sm text-destructive">{historyError}</p>
      ) : null}

      {historyLoading ? (
        <p className="text-sm text-muted-foreground">Carregando histórico…</p>
      ) : !hasPoints ? (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      ) : (
        <AreaScoreChart series={series} />
      )}
    </section>
  )
}
