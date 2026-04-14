import { useMemo } from 'react'
import TransactionItem from './TransactionItem'
import SwipeableRow from '../ui/SwipeableRow'
import { formatDateLabel } from '../../lib/utils'

export default function TransactionList({ transactions, onItemClick, onVerify, onDelete }) {
  const sortedDates = useMemo(() => {
    const grouped = {}
    for (const tx of transactions) {
      if (!grouped[tx.date]) grouped[tx.date] = []
      grouped[tx.date].push(tx)
    }
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
    return dates.map((date) => ({ date, items: grouped[date] }))
  }, [transactions])

  return (
    <div className="space-y-8">
      {sortedDates.map(({ date, items }) => (
        <div key={date}>
          <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] pb-2.5 mb-3 border-b border-border dark:border-[#1A1A1A]">
            {formatDateLabel(date)}
          </p>
          <div className="rounded-lg border border-border dark:border-[#1A1A1A] divide-y divide-border dark:divide-[#1A1A1A] overflow-hidden">
            {items.map((tx) => (
              <SwipeableRow
                key={tx.id}
                onSwipeLeft={onDelete ? () => onDelete(tx) : undefined}
                onSwipeRight={!tx.is_verified && onVerify ? () => onVerify(tx.id) : undefined}
              >
                <TransactionItem
                  transaction={tx}
                  onClick={onItemClick}
                  onVerify={onVerify}
                />
              </SwipeableRow>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
