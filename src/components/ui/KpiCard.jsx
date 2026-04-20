import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Carte KPI : label + valeur + delta (optionnel). Le delta suit la
// convention « plus = vert », sauf si `inverse=true` (cas des dépenses
// où une baisse est positive).
export default function KpiCard({
  label,
  value,
  delta,
  deltaLabel = 'vs mois préc.',
  inverse = false,
  accent = 'neutral',
  isLoading = false,
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
  const isZero = hasDelta && Math.abs(delta) < 0.5
  const isUp = hasDelta && delta > 0
  const isGood = isZero ? null : inverse ? !isUp : isUp

  const deltaColor = !hasDelta || isZero
    ? 'text-text-muted dark:text-dark-text-muted'
    : isGood ? 'text-success' : 'text-error'

  const DeltaIcon = isZero ? Minus : isUp ? TrendingUp : TrendingDown

  const valueColor = {
    neutral: 'text-text dark:text-dark-text',
    success: 'text-success',
    error: 'text-error',
  }[accent]

  if (isLoading) {
    return (
      <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-4">
        <div className="h-3 w-16 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-3 animate-pulse" />
        <div className="h-7 w-24 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-2 animate-pulse" />
        <div className="h-3 w-20 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-4 transition-colors duration-200">
      <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-dark-text-muted mb-2">
        {label}
      </p>
      <p
        className={`text-h3 font-bold tracking-[-0.02em] leading-tight ${valueColor}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {hasDelta ? (
        <div className={`flex items-center gap-1 mt-1.5 text-tiny font-medium ${deltaColor}`}>
          <DeltaIcon size={11} strokeWidth={2} aria-hidden="true" />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {isUp ? '+' : isZero ? '' : ''}{delta.toFixed(0)}%
          </span>
          <span className="text-text-subtle dark:text-dark-text-subtle font-normal ml-0.5">
            {deltaLabel}
          </span>
        </div>
      ) : (
        <p className="text-tiny text-text-subtle dark:text-dark-text-subtle mt-1.5">
          {deltaLabel}
        </p>
      )}
    </div>
  )
}
