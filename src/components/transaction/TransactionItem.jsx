import Badge from '../ui/Badge'
import { formatAmount } from '../../lib/utils'

export default function TransactionItem({ transaction: tx, onClick, onVerify }) {
  const displayTitle = tx.title || tx.description || '\u2014'
  const showDescription = tx.title && tx.description

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-secondary dark:hover:bg-[#0A0A0A] cursor-pointer transition-colors duration-150"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-small font-medium text-text dark:text-[#EDEDED] truncate">
          {displayTitle}
        </p>
        {showDescription && (
          <p className="text-[13px] text-text-muted dark:text-[#888888] truncate mt-0.5">
            {tx.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tx.categories?.name && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium tracking-[0.02em] bg-bg-secondary dark:bg-[#111111] text-text-muted dark:text-[#888888]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: tx.categories.color || '#6366f1' }}
              />
              {tx.categories.name}
            </span>
          )}
          {tx.is_auto && <Badge>Auto</Badge>}
          {!tx.is_verified && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onVerify()
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium tracking-[0.02em] bg-[rgba(245,166,35,0.1)] text-warning hover:bg-[rgba(245,166,35,0.2)] transition-colors duration-150 cursor-pointer"
            >
              A verifier
            </button>
          )}
        </div>
      </div>
      <p
        className={`text-small font-medium whitespace-nowrap ${
          tx.type === 'income' ? 'text-success' : 'text-text dark:text-[#EDEDED]'
        }`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
      </p>
    </div>
  )
}
