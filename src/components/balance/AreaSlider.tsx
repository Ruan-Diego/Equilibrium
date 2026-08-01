import { useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { clampScore, statusFromScore, type Score } from '@/domain/score'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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
  /** Fires while dragging / stepping so the UI can show a live preview. */
  onChange?: (next: Score) => void
  disabled?: boolean
}

export function AreaSlider({
  value,
  onCommit,
  onChange,
  disabled,
}: AreaSliderProps) {
  const [local, setLocal] = useState<Score>(value)
  const committedRef = useRef(value)
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const orientation = isDesktop ? 'vertical' : 'horizontal'

  useEffect(() => {
    setLocal(value)
    committedRef.current = value
  }, [value])

  function preview(next: Score) {
    setLocal(next)
    onChange?.(next)
  }

  function commitIfChanged(next: Score) {
    if (next !== committedRef.current) {
      committedRef.current = next
      onCommit(next)
    }
  }

  return (
    <Slider
      orientation={orientation}
      min={0}
      max={10}
      step={1}
      disabled={disabled}
      value={[local]}
      onValueChange={(vals) => {
        preview(clampScore(vals[0] ?? local))
      }}
      onValueCommit={(vals) => {
        const next = clampScore(vals[0] ?? local)
        preview(next)
        commitIfChanged(next)
      }}
      onKeyUp={() => {
        commitIfChanged(local)
      }}
      className={cn(
        orientation === 'vertical'
          ? 'h-48 min-h-48'
          : 'h-8 w-full min-w-0 **:data-[slot=slider-track]:h-1.5',
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
