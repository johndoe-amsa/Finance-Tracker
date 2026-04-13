import { useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useTransactions, useMonthlyTrend } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { formatMonthYear, calculateExpensesByCategory } from '../lib/utils'
import { Card } from '../components/ui/Card'
import SpendingBarChart from '../components/charts/SpendingBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'

export default function AnalyticsPage() {
  const { currentYear, currentMonth, setMonth } = useAppStore()
  const { data: transactions } = useTransactions(currentYear, currentMonth)
  const { data: categories = [] } = useCategories()
  const { data: monthlyTrend = [] } = useMonthlyTrend(6)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentYear, currentMonth])

  const prevMonth = () => {
    if (currentMonth === 1) setMonth(currentYear - 1, 12)
    else setMonth(currentYear, currentMonth - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 12) setMonth(currentYear + 1, 1)
    else setMonth(currentYear, currentMonth + 1)
  }

  const expensesByCategory = useMemo(
    () => (transactions ? calculateExpensesByCategory(transactions) : {}),
    [transactions],
  )

  return (
    <div className="pb-24">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={prevMonth}
          className="p-2 text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <h2 className="text-h3 text-text dark:text-[#EDEDED] capitalize">
          {formatMonthYear(currentYear, currentMonth)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-4 space-y-4">
        <Card>
          <p className="text-[13px] font-medium text-text dark:text-[#EDEDED] mb-3">
            Tendance 6 mois
          </p>
          <SpendingBarChart data={monthlyTrend} />
        </Card>

        {Object.keys(expensesByCategory).length > 0 && (
          <Card>
            <p className="text-[13px] font-medium text-text dark:text-[#EDEDED] mb-3">
              Dépenses par catégorie
            </p>
            <CategoryPieChart
              expensesByCategory={expensesByCategory}
              categories={categories}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
