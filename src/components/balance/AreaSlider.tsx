import { useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { clampScore, statusFromScore, type Score } from '@/domain/score'
import { cn } from '@/lib/utils'

const statusTrackClass: Record<ReturnType<typeof statusFromScore>, string> = {
  healthy: '[&_[data-slot=slider-range]]:bg-[var(--healthy)]',
  attention: '[&_[data-slot=slider-range]]:bg-[var(--attention)]',
  alert: '[&_[data-slot=slider-range]]:bg-[var(--alert)]',
}

const statusThumbClass: Record<ReturnType<typeof statusFromScore>, string> = {
  healthy: '[&_[data-slot=slider-thumb]]:border-[var(--healthy)]',
  attention: '[&_[data-slot=slider-thumb]]:border-[var(--attention)]',
  alert: '[&_[data-slot=slider-thumb]]:border-[var(--alert)]',
}

type AreaSliderProps = {
  value: Score
  onCommit: (next: Score) => void
  disabled?: boolean
}

export function AreaSlider({ value, onCommit, disabled }: AreaSliderProps) {
  const [local, setLocal] = useState<Score>(value)
  const committedRef = useRef(value)

  useEffect(() => {
    setLocal(value)
    committedRef.current = value
  }, [value])

  function commitIfChanged(next: Score) {
    if (next !== committedRef.current) {
      committedRef.current = next
      onCommit(next)
    }
  }

  return (
    <Slider
      orientation="vertical"
      min={0}
      max={10}
      step={1}
      inverted
      disabled={disabled}
      value={[local]}
      onValueChange={(vals) => {
        const next = clampScore(vals[0] ?? local)
        setLocal(next)
      }}
      onValueCommit={(vals) => {
        const next = clampScore(vals[0] ?? local)
        setLocal(next)
        commitIfChanged(next)
      }}
      onKeyUp={() => {
        commitIfChanged(local)
      }}
      className={cn(
        'h-48 min-h-48',
        statusTrackClass[statusFromScore(local)],
        statusThumbClass[statusFromScore(local)],
      )}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={local}
      aria-label="Nível de atenção"
    />
  )
}
