export default function BudgetBar({ name, spent, limit, onClick }) {
  const actualPct = limit > 0 ? (spent / limit) * 100 : 0
  const displayPct = Math.min(actualPct, 100)

  let barColor = 'bg-success'
  if (actualPct >= 90) barColor = 'bg-error'
  else if (actualPct >= 70) barColor = 'bg-warning'

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-bg-tertiary dark:hover:bg-[#111111] cursor-pointer transition-colors duration-150"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-small font-medium text-text dark:text-[#EDEDED]">{name}</p>
        <p
          className="text-[13px] text-text-muted dark:text-[#888888]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {spent.toFixed(2)} / {limit.toFixed(2)} CHF
        </p>
      </div>
      <div className="h-2 bg-bg-tertiary dark:bg-[#111111] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
