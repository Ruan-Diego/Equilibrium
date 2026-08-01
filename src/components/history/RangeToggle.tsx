import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HistoryRange } from '@/hooks/useAreaHistory'

const OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: 'all', label: 'Tudo' },
]

interface RangeToggleProps {
  value: HistoryRange
  onChange: (range: HistoryRange) => void
  disabled?: boolean
}

export function RangeToggle({ value, onChange, disabled }: RangeToggleProps) {
  return (
    <div
      className="inline-flex gap-1 rounded-lg border border-border/60 p-0.5"
      role="group"
      aria-label="Intervalo do histórico"
    >
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'secondary' : 'ghost'}
          disabled={disabled}
          aria-pressed={value === option.value}
          className={cn(
            value === option.value && 'bg-secondary text-foreground',
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
