import { ChevronRight } from 'lucide-react'
import { formatAmount, interactiveProps } from '../../lib/utils'

export default function CategoryItem({ category, onClick }) {
  return (
    <div
      onClick={onClick}
      {...interactiveProps(onClick, category.name)}
      className="flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary cursor-pointer transition-colors duration-150"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {category.icon && (
          <span className="text-subtitle leading-none shrink-0" aria-hidden>{category.icon}</span>
        )}
        <div className="min-w-0">
          <p className="text-small font-medium text-text dark:text-dark-text truncate">{category.name}</p>
          {category.type === 'expense' && category.budget_limit > 0 && (
            <p
              className="text-caption text-text-muted dark:text-dark-text-muted mt-0.5"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              Budget : {formatAmount(category.budget_limit)}
            </p>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-text-muted dark:text-dark-text-muted" strokeWidth={1.5} />
    </div>
  )
}
