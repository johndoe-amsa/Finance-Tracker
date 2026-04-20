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
import { formatAmount } from '../../lib/utils'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const income  = payload.find((p) => p.dataKey === 'income')?.value  ?? 0
  const expense = payload.find((p) => p.dataKey === 'expense')?.value ?? 0
  const balance = income - expense
  return (
    <div className="bg-bg dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg shadow-2 px-3.5 py-2.5 text-xs font-sans min-w-[150px]">
      <p className="text-text-muted dark:text-dark-text-muted mb-2 capitalize font-medium text-[10px] uppercase tracking-widest">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DATA_COLORS[7] }} />
            <span className="text-text-muted dark:text-dark-text-muted">Revenus</span>
          </div>
          <span className="font-semibold text-text dark:text-dark-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAmount(income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DATA_COLORS[1] }} />
            <span className="text-text-muted dark:text-dark-text-muted">Dépenses</span>
          </div>
          <span className="font-semibold text-text dark:text-dark-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAmount(expense)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border dark:border-dark-border">
        <span className="text-text-muted dark:text-dark-text-muted">Solde</span>
        <span
          className={`font-semibold ${balance >= 0 ? 'text-success' : 'text-error'}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {balance >= 0 ? '+' : '−'}{formatAmount(Math.abs(balance))}
        </span>
      </div>
    </div>
  )
}

function ChartLegend({ items }) {
  return (
    <div className="flex gap-5 flex-wrap mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted">
          <span className="w-10 h-2.5 rounded-full shrink-0 opacity-90" style={{ background: item.color }} aria-hidden="true" />
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
      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          data={data}
          barCategoryGap="38%"
          barGap={3}
          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          onClick={handleClick}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        >
          <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} opacity={0.7} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#8b8b8b', fontFamily: 'Geist, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8b8b8b', fontFamily: 'Geist, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'rgba(0,0,0,0.04)', rx: 6, ry: 6 }}
          />
          <Bar dataKey="income"  name="Revenus"  fill={DATA_COLORS[7]} radius={[5, 5, 0, 0]} />
          <Bar dataKey="expense" name="Dépenses" fill={DATA_COLORS[1]} radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { label: 'Revenus',  color: DATA_COLORS[7] },
        { label: 'Dépenses', color: DATA_COLORS[1] },
      ]} />
      {onBarClick && (
        <p className="text-tiny text-text-subtle dark:text-dark-text-subtle mt-2.5 text-center">
          Cliquer sur une barre pour afficher le mois
        </p>
      )}
    </div>
  )
}
