import { balanceLabels } from '@/domain/labels'

type BalanceStatusProps = {
  balanced: boolean
  attentionAreaNames: string[]
}

export function BalanceStatus({
  balanced,
  attentionAreaNames,
}: BalanceStatusProps) {
  return (
    <div className="space-y-2">
      <p
        className={
          balanced
            ? 'text-2xl font-semibold tracking-tight text-[var(--balanced)] sm:text-3xl'
            : 'text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'
        }
      >
        {balanced ? balanceLabels.balanced : balanceLabels.unbalanced}
      </p>
      {!balanced && attentionAreaNames.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Merece atenção:{' '}
          <span className="text-foreground/90">
            {attentionAreaNames.join(', ')}
          </span>
        </p>
      )}
    </div>
  )
}
