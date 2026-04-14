import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DATA_COLORS } from '../../data'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-bg dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-md shadow-lg px-3 py-2 text-[12px] font-sans">
      <p className="font-medium text-text dark:text-[#EDEDED]">{entry.name}</p>
      <p style={{ color: entry.payload.fill }}>{entry.value.toFixed(2)} CHF</p>
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
        value: amount,
        fill: cat?.color || DATA_COLORS[(i % 7) + 1],
      }
    })
    .sort((a, b) => b.value - a.value)

  if (!slices.length) return null

  const total = slices.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            activeIndex={activeIndex}
            activeShape={{ outerRadius: 80 }}
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

      <div className="space-y-1.5">
        {slices.map((entry, i) => (
          <div
            key={i}
            className={`flex items-center justify-between text-[12px] rounded-md px-1 py-0.5 transition-colors duration-100 ${
              onSliceClick ? 'cursor-pointer hover:bg-bg-secondary dark:hover:bg-[#1f1f23]' : ''
            }`}
            onClick={onSliceClick ? () => onSliceClick(entry) : undefined}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-text-muted dark:text-[#a1a1aa] truncate">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className="text-text-muted dark:text-[#a1a1aa]">
                {((entry.value / total) * 100).toFixed(0)}%
              </span>
              <span
                className="font-medium text-text dark:text-[#EDEDED]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {entry.value.toFixed(2)} CHF
              </span>
            </div>
          </div>
        ))}
      </div>

      {onSliceClick && (
        <p className="text-[11px] text-text-subtle dark:text-[#71717a] text-center">
          Cliquer sur une catégorie pour voir les transactions
        </p>
      )}
    </div>
  )
}
