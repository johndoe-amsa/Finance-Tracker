import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Info } from 'lucide-react'

const ICONS = {
  success: TrendingDown,
  warning: AlertTriangle,
  info: Info,
}

const COLORS = {
  success: { bg: 'bg-success/10', text: 'text-success', icon: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', icon: 'text-warning' },
  info: { bg: 'bg-accent/10 dark:bg-dark-accent/10', text: 'text-text dark:text-dark-text', icon: 'text-accent dark:text-dark-text' },
}

export default function InsightsSection({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="px-4 mb-6">
      <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em] mb-3">
        Insights
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {insights.map((insight, i) => {
          const colors = COLORS[insight.type] || COLORS.info
          const Icon = insight.title.includes('epargne') ? PiggyBank
            : insight.title.includes('hausse') ? TrendingUp
            : ICONS[insight.type] || Info

          return (
            <div
              key={i}
              className={`${colors.bg} rounded-lg p-3`}
              style={{ animation: `enter 200ms var(--ease-out) both`, animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-2">
                <Icon size={14} strokeWidth={1.5} className={`${colors.icon} mt-0.5 shrink-0`} />
                <div className="min-w-0">
                  <p className={`text-[13px] font-medium ${colors.text} leading-tight`}>
                    {insight.title}
                  </p>
                  <p className="text-[11px] text-text-muted dark:text-dark-text-muted mt-0.5 leading-tight">
                    {insight.detail}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
