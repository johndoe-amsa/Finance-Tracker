import { useMemo } from 'react'
import TransactionItem from './TransactionItem'
import { formatDateLabel } from '../../lib/utils'

export default function TransactionList({ transactions, onItemClick, onVerify }) {
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
          <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] pb-2.5 mb-3 border-b border-border dark:border-[#3f3f46]">
            {formatDateLabel(date)}
          </p>
          <div className="rounded-lg border border-border dark:border-[#52525b] divide-y divide-border dark:divide-[#52525b] overflow-hidden">
            {items.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={onItemClick}
                onVerify={onVerify}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
