import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DATA_COLORS } from '../../data'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const income  = payload.find((p) => p.dataKey === 'income')?.value  ?? 0
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0
  const balance = income - expense
  return (
    <div className="bg-bg dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-md shadow-lg px-3 py-2 text-[12px] font-sans">
      <p className="text-text-muted dark:text-[#a1a1aa] mb-1.5 capitalize font-medium">{label}</p>
      <p className="font-medium mb-0.5" style={{ color: DATA_COLORS[7] }}>
        Revenus : {income.toFixed(2)} CHF
      </p>
      <p className="font-medium mb-0.5" style={{ color: DATA_COLORS[1] }}>
        Dépenses : {expense.toFixed(2)} CHF
      </p>
      <p className={`font-semibold mt-1 pt-1 border-t border-border dark:border-[#52525b] ${balance >= 0 ? 'text-success' : 'text-error'}`}>
        Solde : {balance >= 0 ? '+' : '−'}{Math.abs(balance).toFixed(2)} CHF
      </p>
    </div>
  )
}

function ChartLegend({ items }) {
  return (
    <div className="flex gap-4 flex-wrap mt-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[12px] text-text-muted dark:text-[#a1a1aa]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default function SpendingBarChart({ data = [], onBarClick }) {
  if (!data.length) return null

  const handleClick = onBarClick
    ? (payload) => {
        const d = payload?.activePayload?.[0]?.payload
        if (d?.year && d?.month) onBarClick(d.year, d.month)
      }
    : undefined

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barCategoryGap="40%"
          barGap={2}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          onClick={handleClick}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Geist, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Geist, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="income"  name="Revenus"   fill={DATA_COLORS[7]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Dépenses"  fill={DATA_COLORS[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { label: 'Revenus',   color: DATA_COLORS[7] },
        { label: 'Dépenses',  color: DATA_COLORS[1] },
      ]} />
      {onBarClick && (
        <p className="text-[11px] text-text-subtle dark:text-[#71717a] mt-2 text-center">
          Cliquer sur une barre pour afficher le mois
        </p>
      )}
    </div>
  )
}
