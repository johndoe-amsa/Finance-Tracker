import Badge from '../ui/Badge'
import {
  formatAmount,
  getNextBillingDate,
  formatDate,
  interactiveProps,
  subscriptionKind,
} from '../../lib/utils'

export default function SubscriptionItem({ subscription: sub, onClick }) {
  const nextDate = getNextBillingDate(sub)
  const freqLabel = sub.frequency === 'monthly' ? '/mois' : '/an'
  const kind = subscriptionKind(sub)
  const isIncome = kind === 'income'

  return (
    <div
      onClick={onClick}
      {...interactiveProps(onClick, `${sub.name}, ${formatAmount(sub.amount)}${freqLabel}`)}
      className="flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary cursor-pointer transition-colors duration-150"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-small font-medium text-text dark:text-dark-text">{sub.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {sub.categories?.name && (
            <Badge>{sub.categories.icon ? `${sub.categories.icon} ${sub.categories.name}` : sub.categories.name}</Badge>
          )}
          <Badge variant={sub.is_active ? 'success' : 'neutral'}>
            {sub.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
        <p className="text-[13px] text-text-muted dark:text-dark-text-muted mt-1">
          Prochaine : {nextDate ? formatDate(nextDate.toISOString().split('T')[0]) : '\u2014'}
        </p>
      </div>
      <p
        className={`text-small font-medium whitespace-nowrap ${
          isIncome ? 'text-success' : 'text-text dark:text-dark-text'
        }`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {isIncome ? '+' : ''}{formatAmount(sub.amount)}{freqLabel}
      </p>
    </div>
  )
}
