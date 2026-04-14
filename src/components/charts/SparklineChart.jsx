import { useMemo } from 'react'

const W = 80
const H = 28
const PAD = 2

export default function SparklineChart({ transactions, className }) {
  const result = useMemo(() => {
    if (!transactions || transactions.length === 0) return null

    // Net par jour
    const dailyNet = {}
    for (const tx of transactions) {
      const net = tx.type === 'income' ? parseFloat(tx.amount) : -parseFloat(tx.amount)
      dailyNet[tx.date] = (dailyNet[tx.date] || 0) + net
    }

    const dates = Object.keys(dailyNet).sort()
    if (dates.length < 2) return null

    // Balance cumulée jour par jour
    let cumulative = 0
    const values = dates.map((date) => {
      cumulative += dailyNet[date]
      return cumulative
    })

    // On inclut 0 dans le range pour garder la référence du zéro
    const min = Math.min(0, ...values)
    const max = Math.max(0, ...values)
    const range = max - min || 1

    const toSvgY = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2)

    const pts = values.map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
      return `${x.toFixed(1)},${toSvgY(v).toFixed(1)}`
    })

    const lastVal = values[values.length - 1]
    const lastX = (W - PAD).toFixed(1)
    const lastY = toSvgY(lastVal).toFixed(1)
    const color = lastVal >= 0 ? '#16A34A' : '#EE0000'

    return { svgPoints: pts.join(' '), lastX, lastY, color }
  }, [transactions])

  if (!result) return null

  const { svgPoints, lastX, lastY, color } = result

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={svgPoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  )
}
