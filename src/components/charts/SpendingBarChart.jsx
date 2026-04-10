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
  return (
    <div className="bg-bg dark:bg-[#0A0A0A] border border-border-strong dark:border-[#FFFFFF] rounded-md shadow-2 px-3 py-2 text-[12px] font-sans">
      <p className="text-text-muted dark:text-[#888888] mb-1 capitalize">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-medium" style={{ color: entry.color }}>
          {entry.name} : {entry.value.toFixed(2)} CHF
        </p>
      ))}
    </div>
  )
}

function ChartLegend({ items }) {
  return (
    <div className="flex gap-4 flex-wrap mt-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[12px] text-text-muted dark:text-[#888888]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default function SpendingBarChart({ data = [] }) {
  if (!data.length) return null

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="40%" barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          <Bar dataKey="income" name="Revenus" fill={DATA_COLORS[7]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Depenses" fill={DATA_COLORS[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { label: 'Revenus',  color: DATA_COLORS[7] },
        { label: 'Depenses', color: DATA_COLORS[1] },
      ]} />
    </div>
  )
}
