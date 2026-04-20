import { useMemo } from 'react'
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { DATA_COLORS } from '../../data'
import { formatAmount, interactiveProps } from '../../lib/utils'

// Répartition des dépenses par catégorie, en barres horizontales.
// Plus lisible qu'un camembert sur mobile, avec delta vs mois préc.
// et valeur absolue alignée à droite.
export default function CategoryBreakdown({
  expensesByCategory = {},
  prevExpensesByCategory = {},
  categories = [],
  onSliceClick,
}) {
  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  )

  const slices = useMemo(() => {
    const rows = Object.entries(expensesByCategory)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount], i) => {
        const cat = catMap[id]
        const prev = prevExpensesByCategory[id] || 0
        const delta = prev > 0 ? ((amount - prev) / prev) * 100 : null
        return {
          id,
          name: cat?.name || 'Autre',
          icon: cat?.icon || null,
          value: amount,
          prev,
          delta,
          color: cat?.color || DATA_COLORS[(i % 7) + 1],
        }
      })
      .sort((a, b) => b.value - a.value)
    return rows
  }, [expensesByCategory, prevExpensesByCategory, catMap])

  if (!slices.length) return null

  const total = slices.reduce((s, r) => s + r.value, 0)
  const max = slices[0].value

  return (
    <div className="space-y-1">
      {slices.map((row) => {
        const widthPct = (row.value / max) * 100
        const sharePct = (row.value / total) * 100
        const hasDelta = row.delta !== null && Math.abs(row.delta) >= 1
        const deltaIsUp = row.delta > 0
        const DeltaIcon = deltaIsUp ? TrendingUp : TrendingDown

        const clickable = !!onSliceClick

        return (
          <div
            key={row.id}
            className={[
              'group relative rounded-md px-2 py-2.5 transition-colors duration-100',
              clickable
                ? 'cursor-pointer hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                : '',
            ].join(' ')}
            onClick={clickable ? () => onSliceClick(row) : undefined}
            {...(clickable
              ? interactiveProps(() => onSliceClick(row), `Voir détail de ${row.name}`)
              : {})}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              {row.icon && (
                <span className="text-caption leading-none shrink-0" aria-hidden="true">
                  {row.icon}
                </span>
              )}
              <p className="text-small font-medium text-text dark:text-dark-text truncate flex-1">
                {row.name}
              </p>
              <div className="flex items-baseline gap-2 shrink-0">
                {hasDelta && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-tiny font-medium ${
                      deltaIsUp ? 'text-error' : 'text-success'
                    }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    <DeltaIcon size={10} strokeWidth={2} aria-hidden="true" />
                    {deltaIsUp ? '+' : ''}{row.delta.toFixed(0)}%
                  </span>
                )}
                <span
                  className="text-small font-semibold text-text dark:text-dark-text whitespace-nowrap"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatAmount(row.value)}
                </span>
                {clickable && (
                  <ChevronRight
                    size={14}
                    strokeWidth={1.5}
                    className="text-text-subtle dark:text-dark-text-subtle -mr-1"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pl-5">
              <div
                className="relative flex-1 h-1 rounded-full overflow-hidden bg-bg-tertiary dark:bg-dark-bg-tertiary"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
              <span
                className="text-tiny text-text-muted dark:text-dark-text-muted w-10 text-right shrink-0"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {sharePct.toFixed(0)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
