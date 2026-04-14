import { useState, useEffect } from 'react'
import { formatAmount, interactiveProps } from '../../lib/utils'

export default function BudgetBar({ name, spent, limit, color, onClick, index = 0 }) {
  // Déclenche l'animation de la barre un tick après le montage
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 16)
    return () => clearTimeout(t)
  }, [])

  const actualPct  = limit > 0 ? (spent / limit) * 100 : 0
  const displayPct = Math.min(actualPct, 100)
  const remaining  = limit - spent
  const isOverspent = remaining < 0

  // Couleur de la barre
  let barColor = null
  let barStyle  = null
  if (actualPct >= 90)      { barColor = 'bg-error'   }
  else if (actualPct >= 70) { barColor = 'bg-warning'  }
  else                      { barStyle = { backgroundColor: color || '#6366f1' } }

  // Couleur + graisse du montant restant
  const remainingClass = isOverspent
    ? 'text-error font-bold'
    : actualPct >= 70
    ? 'text-warning font-semibold'
    : 'text-text-muted dark:text-[#888888]'

  const staggerMs = index * 60

  return (
    <div
      onClick={onClick}
      {...interactiveProps(onClick, `${name}, ${spent.toFixed(2)} de ${limit.toFixed(2)} CHF`)}
      className="p-4 hover:bg-bg-tertiary dark:hover:bg-[#111111] cursor-pointer transition-colors duration-150"
      style={{ animation: `enter 320ms var(--spring) ${staggerMs}ms both` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color || '#6366f1' }}
          />
          <p className="text-small font-medium text-text dark:text-[#EDEDED]">{name}</p>
        </div>

        <p
          className={`text-[13px] ${remainingClass}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {isOverspent
            ? `−${formatAmount(Math.abs(remaining))} dépassé`
            : `${formatAmount(remaining)} restants`}
        </p>
      </div>

      <div className="relative h-2">
        {/* Track */}
        <div className="absolute inset-0 bg-bg-tertiary dark:bg-[#111111] rounded-full" />
        {/* Fill — animé via scaleX pour partir de 0 */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor || ''}`}
          style={{
            width: `${displayPct}%`,
            transformOrigin: 'left',
            transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 600ms var(--spring)',
            transitionDelay: `${staggerMs + 60}ms`,
            ...(!barColor ? barStyle : {}),
          }}
        />
      </div>
    </div>
  )
}
