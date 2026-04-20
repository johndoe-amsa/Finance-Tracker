import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { DATA_COLORS } from '../../data'
import { formatAmount } from '../../lib/utils'

function AreaTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const balance = point.balance
  return (
    <div className="bg-bg dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-md shadow-1 px-3 py-2 text-xs font-sans">
      <p className="text-text-muted dark:text-dark-text-muted mb-1">
        {point.label}
      </p>
      <p
        className={`font-semibold ${balance >= 0 ? 'text-success' : 'text-error'}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {balance >= 0 ? '+' : '−'}{formatAmount(Math.abs(balance))}
      </p>
      {point.netDay !== 0 && (
        <p
          className="text-tiny text-text-muted dark:text-dark-text-muted mt-0.5"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Jour : {point.netDay >= 0 ? '+' : '−'}{formatAmount(Math.abs(point.netDay))}
        </p>
      )}
    </div>
  )
}

// Balance cumulée jour par jour du mois. Affiche une ligne zéro pour
// repérer en un clin d'œil si le mois est en excédent ou déficit.
export default function CumulativeBalanceChart({ transactions, year, month }) {
  const data = useMemo(() => {
    if (!transactions) return []

    const lastDay = new Date(year, month, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const capDay = isCurrentMonth ? today.getDate() : lastDay

    const dailyNet = new Array(lastDay + 1).fill(0)
    for (const tx of transactions) {
      const day = parseInt(tx.date.slice(8, 10), 10)
      if (day < 1 || day > lastDay) continue
      const sign = tx.type === 'income' ? 1 : -1
      dailyNet[day] += sign * parseFloat(tx.amount)
    }

    let cum = 0
    const rows = []
    for (let d = 1; d <= capDay; d++) {
      cum += dailyNet[d]
      rows.push({
        day: d,
        label: new Date(year, month - 1, d).toLocaleDateString('fr-CH', {
          day: 'numeric',
          month: 'short',
        }),
        balance: Math.round(cum * 100) / 100,
        netDay: Math.round(dailyNet[d] * 100) / 100,
      })
    }
    return rows
  }, [transactions, year, month])

  if (!data.length) return null

  const finalBalance = data[data.length - 1].balance
  const isPositive = finalBalance >= 0
  const strokeColor = isPositive ? DATA_COLORS[7] : DATA_COLORS[5]
  const gradientId = `bal-grad-${isPositive ? 'up' : 'down'}`

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#999999', fontFamily: 'Geist, system-ui, sans-serif' }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fontSize: 11, fill: '#999999', fontFamily: 'Geist, system-ui, sans-serif' }}
            tickFormatter={(v) => {
              const abs = Math.abs(v)
              if (abs >= 1000) return `${(v / 1000).toFixed(0)}k`
              return v
            }}
          />
          <ReferenceLine y={0} stroke={DATA_COLORS.grid} strokeWidth={1} />
          <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#666666', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: strokeColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
