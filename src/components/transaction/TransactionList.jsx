import TransactionItem from './TransactionItem'
import { formatDate } from '../../lib/utils'

export default function TransactionList({ transactions, onItemClick, onVerify }) {
  const grouped = {}
  for (const tx of transactions) {
    if (!grouped[tx.date]) grouped[tx.date] = []
    grouped[tx.date].push(tx)
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-2">
            {formatDate(date)}
          </p>
          <div className="space-y-0.5">
            {grouped[date].map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onClick={() => onItemClick(tx)}
                onVerify={() => onVerify(tx.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
