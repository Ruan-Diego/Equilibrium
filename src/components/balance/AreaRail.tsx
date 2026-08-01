import { useEffect, useState } from 'react'
import type { Area } from '@/data/areasRepo'
import { statusFromScore, type Score } from '@/domain/score'
import { statusLabels } from '@/domain/labels'
import { AreaSlider } from './AreaSlider'

const statusColorClass: Record<ReturnType<typeof statusFromScore>, string> = {
  healthy: 'text-[var(--healthy)]',
  attention: 'text-[var(--attention)]',
  alert: 'text-[var(--alert)]',
}

type AreaRailProps = {
  area: Pick<Area, 'id' | 'name' | 'score'>
  onScoreCommit: (areaId: string, next: Score) => void
  disabled?: boolean
}

export function AreaRail({ area, onScoreCommit, disabled }: AreaRailProps) {
  const [liveScore, setLiveScore] = useState(area.score)

  useEffect(() => {
    setLiveScore(area.score)
  }, [area.score])

  // Status follows committed score only (updates on release, not while dragging).
  const status = statusFromScore(area.score)

  return (
    <div className="flex w-full items-center gap-3 sm:w-28 sm:shrink-0 sm:flex-col sm:gap-3">
      <div className="w-24 shrink-0 sm:w-full sm:text-center">
        <p className="truncate text-sm font-medium text-foreground">
          {area.name}
        </p>
        <p className={`mt-0.5 text-xs sm:mt-1 ${statusColorClass[status]}`}>
          {statusLabels[status]}
        </p>
      </div>

      <div className="min-w-0 flex-1 sm:flex-none sm:self-center">
        <AreaSlider
          value={area.score}
          disabled={disabled}
          onChange={setLiveScore}
          onCommit={(next) => onScoreCommit(area.id, next)}
        />
      </div>

      <p
        className={`w-8 shrink-0 text-right tabular-nums text-lg font-semibold sm:w-auto sm:text-center ${statusColorClass[status]}`}
      >
        {liveScore}
      </p>
    </div>
  )
}
