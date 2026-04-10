import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg dark:bg-[#111111] border border-border dark:border-[#333333] rounded-lg px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-text dark:text-[#EDEDED] mb-1 capitalize">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name} : {entry.value.toFixed(2)} CHF
        </p>
      ))}
    </div>
  )
}

export default function SpendingBarChart({ data = [] }) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="30%" barGap={2}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888888)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted, #888888)' }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: 'var(--color-text-muted, #888888)' }}>{value}</span>}
        />
        <Bar dataKey="income" name="Revenus" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" name="Dépenses" fill="#6366f1" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
