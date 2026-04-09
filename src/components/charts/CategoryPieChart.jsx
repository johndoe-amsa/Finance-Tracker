import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#a16207',
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-bg dark:bg-[#111111] border border-border dark:border-[#333333] rounded-lg px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-text dark:text-[#EDEDED]">{entry.name}</p>
      <p style={{ color: entry.payload.fill }}>{entry.value.toFixed(2)} CHF</p>
    </div>
  )
}

export default function CategoryPieChart({ expensesByCategory = {}, categories = [] }) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  const slices = Object.entries(expensesByCategory)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount], i) => {
      const cat = catMap[id]
      return {
        name: cat?.name || 'Autre',
        value: amount,
        fill: cat?.color || PALETTE[i % PALETTE.length],
      }
    })
    .sort((a, b) => b.value - a.value)

  if (!slices.length) return null

  const total = slices.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
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
          <div key={i} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-text-muted dark:text-[#888888] truncate">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className="text-text-muted dark:text-[#888888]">
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
    </div>
  )
}
