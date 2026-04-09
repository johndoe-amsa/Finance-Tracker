import Badge from '../ui/Badge'
import { formatAmount, getNextBillingDate, formatDate } from '../../lib/utils'

export default function SubscriptionItem({ subscription: sub, onClick }) {
  const nextDate = getNextBillingDate(sub)
  const freqLabel = sub.frequency === 'monthly' ? '/mois' : '/an'

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-[#111111] cursor-pointer transition-colors duration-150"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-small font-medium text-text dark:text-[#EDEDED]">{sub.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {sub.categories?.name && <Badge>{sub.categories.name}</Badge>}
          <Badge>{sub.type === 'expense' ? 'Depense' : 'Revenu'}</Badge>
          <Badge variant={sub.is_active ? 'success' : 'neutral'}>
            {sub.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
        <p className="text-[13px] text-text-muted dark:text-[#888888] mt-1">
          Prochaine : {nextDate ? formatDate(nextDate.toISOString().split('T')[0]) : '\u2014'}
        </p>
      </div>
      <p
        className="text-small font-medium text-text dark:text-[#EDEDED] whitespace-nowrap"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatAmount(sub.amount)}{freqLabel}
      </p>
    </div>
  )
}
