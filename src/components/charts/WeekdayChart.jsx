import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DATA_COLORS } from '../../data'
import { formatAmount } from '../../lib/utils'

const WEEKDAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
// On veut afficher Lun → Dim
const ORDER = [1, 2, 3, 4, 5, 6, 0]

function WeekdayTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="bg-bg dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-md shadow-1 px-3 py-2 text-xs font-sans">
      <p className="text-text-muted dark:text-dark-text-muted mb-0.5">{p.fullLabel}</p>
      <p
        className="font-semibold text-text dark:text-dark-text"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatAmount(p.value)}
      </p>
      <p className="text-tiny text-text-muted dark:text-dark-text-muted mt-0.5">
        {p.count} transaction{p.count > 1 ? 's' : ''}
      </p>
    </div>
  )
}

// Dépenses moyennes par jour de la semaine.
// Utilise la moyenne (total / nb d'occurrences du jour dans la période),
// pour que les mois incomplets restent comparables.
export default function WeekdayChart({ transactions }) {
  const data = useMemo(() => {
    const totals = Array(7).fill(0)
    const counts = Array(7).fill(0)
    const seenDates = Array.from({ length: 7 }, () => new Set())

    for (const tx of transactions || []) {
      if (tx.type !== 'expense') continue
      const d = new Date(tx.date + 'T00:00:00')
      const wd = d.getDay()
      totals[wd] += parseFloat(tx.amount)
      counts[wd] += 1
      seenDates[wd].add(tx.date)
    }

    const fullLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return ORDER.map((wd) => {
      const occurrences = seenDates[wd].size || 1
      return {
        label: WEEKDAY_LABELS[wd],
        fullLabel: fullLabels[wd],
        value: Math.round((totals[wd] / occurrences) * 100) / 100,
        count: counts[wd],
      }
    })
  }, [transactions])

  const hasData = data.some((d) => d.value > 0)
  if (!hasData) return null

  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="24%">
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#999999', fontFamily: 'Geist, system-ui, sans-serif' }}
        />
        <YAxis hide domain={[0, maxValue * 1.15]} />
        <Tooltip
          content={<WeekdayTooltip />}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.value === maxValue ? DATA_COLORS[4] : DATA_COLORS[1]}
              fillOpacity={d.value === maxValue ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
