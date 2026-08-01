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
    <div className="flex w-28 shrink-0 flex-col items-center gap-3">
      <div className="w-full text-center">
        <p className="truncate text-sm font-medium text-foreground">
          {area.name}
        </p>
        <p className={`mt-1 text-xs ${statusColorClass[status]}`}>
          {statusLabels[status]}
        </p>
      </div>

      <AreaSlider
        value={area.score}
        disabled={disabled}
        onChange={setLiveScore}
        onCommit={(next) => onScoreCommit(area.id, next)}
      />

      <p
        className={`tabular-nums text-lg font-semibold ${statusColorClass[status]}`}
      >
        {liveScore}
      </p>
    </div>
  )
}
