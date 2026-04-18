import { memo, useCallback } from 'react'
import Badge from '../ui/Badge'
import { formatAmount, interactiveProps, KIND_LABELS } from '../../lib/utils'

function TransactionItem({ transaction: tx, onClick, onVerify }) {
  const displayTitle = tx.title || tx.description || '\u2014'
  const showDescription = tx.title && tx.description

  const handleClick = useCallback(() => onClick(tx), [onClick, tx])
  const handleVerify = useCallback(
    (e) => {
      e.stopPropagation()
      onVerify(tx)
    },
    [onVerify, tx],
  )

  return (
    <div
      onClick={handleClick}
      {...interactiveProps(handleClick, `${displayTitle}, ${tx.type === 'income' ? '+' : '-'}${formatAmount(tx.amount)}`)}
      className="flex items-center justify-between p-3 bg-bg-secondary dark:bg-[#1f1f23] hover:bg-bg-tertiary dark:hover:bg-[#27272a] cursor-pointer transition-colors duration-150"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-small font-medium text-text dark:text-[#EDEDED] truncate">
          {displayTitle}
        </p>
        {showDescription && (
          <p className="text-[13px] text-text-muted dark:text-[#a1a1aa] truncate mt-0.5">
            {tx.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tx.categories?.name && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium tracking-[0.02em] bg-bg-tertiary dark:bg-[#27272a] text-text-muted dark:text-[#a1a1aa]">
              {tx.categories.icon ? (
                <span className="text-[12px] leading-none" aria-hidden>{tx.categories.icon}</span>
              ) : (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tx.categories.color || '#6366f1' }}
                />
              )}
              {tx.categories.name}
            </span>
          )}
          {tx.is_auto && (
            <Badge>{KIND_LABELS[tx.subscriptions?.kind] || 'Auto'}</Badge>
          )}
          {!tx.is_verified && (
            <button
              onClick={handleVerify}
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

export default memo(TransactionItem)
