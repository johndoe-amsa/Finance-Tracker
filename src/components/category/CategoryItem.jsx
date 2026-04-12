import { ChevronRight } from 'lucide-react'
import { formatAmount, interactiveProps } from '../../lib/utils'

export default function CategoryItem({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      {...interactiveProps(onClick, category.name)}
      className="flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-[#111111] cursor-pointer transition-colors duration-150"
    >
      <div>
        <p className="text-small font-medium text-text dark:text-[#EDEDED]">{category.name}</p>
        {category.type === 'expense' && category.budget_limit > 0 && (
          <p
            className="text-[13px] text-text-muted dark:text-[#888888] mt-0.5"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            Budget : {formatAmount(category.budget_limit)}
          </p>
        )}
      </div>
      <ChevronRight size={16} className="text-text-muted dark:text-[#888888]" strokeWidth={1.5} />
    </div>
  )
}
