import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { formatAmount, formatDate } from '../../lib/utils'

export default function BudgetDetailModal({
  open,
  onClose,
  category,
  spent,
  transactions,
  onTransactionClick,
}) {
  if (!category) return null

  const limit = parseFloat(category.budget_limit || 0)
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const remaining = limit - spent
  const catColor = category.color || '#6366f1'

  let barClass = null
  let barStyle = null
  if (pct >= 90) {
    barClass = 'bg-error'
  } else if (pct >= 70) {
    barClass = 'bg-warning'
  } else {
    barStyle = { backgroundColor: catColor }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: catColor }}
          />
          {category.name}
        </span>
      }
    >
      <div className="space-y-4">
        <p
          className="text-small text-text-muted dark:text-[#888888]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatAmount(spent)} / {formatAmount(limit)}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-bg-tertiary dark:bg-[#111111] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barClass || ''}`}
              style={{ width: `${Math.min(pct, 100)}%`, ...(!barClass ? barStyle : {}) }}
            />
          </div>
          <span
            className="text-[13px] font-medium text-text-muted"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>

        <p
          className={`text-small font-medium ${remaining >= 0 ? 'text-success' : 'text-error'}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {remaining >= 0
            ? `Reste ${formatAmount(remaining)}`
            : `Depassement de ${formatAmount(Math.abs(remaining))}`}
        </p>

        <p className="text-[13px] text-text-muted dark:text-[#888888]">
          {transactions.length} depense{transactions.length > 1 ? 's' : ''} ce mois
        </p>

        {transactions.length > 0 && (
          <div className="border-t border-border dark:border-[#333333] pt-3 space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onTransactionClick(tx)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-bg-secondary dark:hover:bg-[#0A0A0A] cursor-pointer transition-colors duration-150"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[13px] text-text-muted dark:text-[#888888] shrink-0">
                    {formatDate(tx.date)}
                  </span>
                  <span className="text-small text-text dark:text-[#EDEDED] truncate">
                    {tx.title || tx.description || '\u2014'}
                  </span>
                  {tx.is_auto && <Badge>Auto</Badge>}
                </div>
                <span
                  className="text-small font-medium text-text dark:text-[#EDEDED] ml-2"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  -{formatAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
