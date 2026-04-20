import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DATA_COLORS } from '../../data'
import { formatAmount } from '../../lib/utils'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-bg dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg shadow-2 px-3 py-2 text-xs font-sans">
      <div className="flex items-center gap-1.5 mb-1">
        {entry.payload.icon && (
          <span aria-hidden className="text-caption leading-none">{entry.payload.icon}</span>
        )}
        <span className="font-medium text-text dark:text-dark-text">{entry.name}</span>
      </div>
      <span className="font-semibold" style={{ color: entry.payload.fill, fontVariantNumeric: 'tabular-nums' }}>
        {formatAmount(entry.value)}
      </span>
    </div>
  )
}

export default function CategoryPieChart({ expensesByCategory = {}, categories = [], onSliceClick }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  const slices = Object.entries(expensesByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount], i) => {
      const cat = catMap[id]
      return {
        id,
        name: cat?.name || 'Autre',
        icon: cat?.icon || null,
        value: amount,
        fill: cat?.color || DATA_COLORS[(i % 7) + 1],
      }
    })
    .sort((a, b) => b.value - a.value)

  if (!slices.length) return null

  const total = slices.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Donut chart with center label */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              activeIndex={activeIndex}
              activeShape={{ outerRadius: 98 }}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={onSliceClick ? (data) => onSliceClick(data) : undefined}
              style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
            >
              {slices.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
            Total
          </p>
          <p
            className="text-small font-semibold text-text dark:text-dark-text mt-0.5"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatAmount(total)}
          </p>
        </div>
      </div>

      {/* Category legend with progress bars */}
      <div className="space-y-1">
        {slices.map((entry, i) => {
          const pct = (entry.value / total) * 100
          return (
            <div
              key={i}
              className={`rounded-lg px-3 py-2.5 transition-colors duration-100 ${
                onSliceClick
                  ? 'cursor-pointer hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                  : ''
              }`}
              onClick={onSliceClick ? () => onSliceClick(entry) : undefined}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {entry.icon && (
                    <span className="text-caption leading-none shrink-0" aria-hidden>{entry.icon}</span>
                  )}
                  <span className="text-xs font-medium text-text dark:text-dark-text truncate">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 ml-2 shrink-0">
                  <span className="text-[11px] text-text-muted dark:text-dark-text-muted">
                    {pct.toFixed(0)}%
                  </span>
                  <span
                    className="text-xs font-semibold text-text dark:text-dark-text"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatAmount(entry.value)}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: entry.fill, opacity: 0.85 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {onSliceClick && (
        <p className="text-tiny text-text-subtle dark:text-dark-text-subtle text-center -mt-1">
          Cliquer sur une catégorie pour voir les transactions
        </p>
      )}
    </div>
  )
}
