import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useTransactions, useMonthlyTrend } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import {
  formatMonthYear,
  formatAmount,
  formatDateLabel,
  calculateExpensesByCategory,
} from '../lib/utils'
import { Card } from '../components/ui/Card'
import ToggleGroup from '../components/ui/ToggleGroup'
import Modal from '../components/ui/Modal'
import SpendingBarChart from '../components/charts/SpendingBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'

const PERIOD_OPTIONS = [
  { value: 3,  label: '3M'  },
  { value: 6,  label: '6M'  },
  { value: 12, label: '12M' },
]

function TrendBadge({ current, previous, inverse = false }) {
  if (!previous) return null
  const pct = ((current - previous) / previous) * 100
  // Pour les dépenses (inverse=true), une baisse est positive
  const isGood = inverse ? pct <= 0 : pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${isGood ? 'text-success' : 'text-error'}`}>
      {pct >= 0
        ? <TrendingUp size={11} strokeWidth={1.5} />
        : <TrendingDown size={11} strokeWidth={1.5} />}
      {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
    </span>
  )
}

export default function AnalyticsPage() {
  const { currentYear, currentMonth, setMonth } = useAppStore()
  const navigate = useNavigate()
  const { data: transactions } = useTransactions(currentYear, currentMonth)
  const { data: categories = [] } = useCategories()

  const [period, setPeriod] = useState(6)
  const [selectedSlice, setSelectedSlice] = useState(null)

  const { data: monthlyTrend = [] } = useMonthlyTrend(period)

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

  // Comparaison des deux derniers mois du trend pour les indicateurs
  const trend = useMemo(() => {
    if (monthlyTrend.length < 2) return null
    const curr = monthlyTrend[monthlyTrend.length - 1]
    const prev = monthlyTrend[monthlyTrend.length - 2]
    return { curr, prev }
  }, [monthlyTrend])

  const handleBarClick = (year, month) => {
    setMonth(year, month)
    navigate('/')
  }

  const handleSliceClick = (slice) => {
    const catTransactions = (transactions || [])
      .filter((t) => t.type === 'expense' && t.category_id === slice.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    setSelectedSlice({ ...slice, transactions: catTransactions })
  }

  return (
    <div className="pb-24">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={prevMonth}
          className="p-2 text-text-muted hover:text-text dark:text-[#a1a1aa] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <h2 className="text-h3 text-text dark:text-[#EDEDED] capitalize">
          {formatMonthYear(currentYear, currentMonth)}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 text-text-muted hover:text-text dark:text-[#a1a1aa] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Bar chart — switcher période + indicateurs de tendance */}
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[13px] font-medium text-text dark:text-[#EDEDED]">
                Tendance {period} mois
              </p>
              {trend && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-text-muted dark:text-[#a1a1aa] flex items-center gap-1">
                    Rev.&nbsp;<TrendBadge current={trend.curr.income}  previous={trend.prev.income} />
                  </span>
                  <span className="text-[11px] text-text-muted dark:text-[#a1a1aa] flex items-center gap-1">
                    Dép.&nbsp;<TrendBadge current={trend.curr.expense} previous={trend.prev.expense} inverse />
                  </span>
                </div>
              )}
            </div>
            <ToggleGroup
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </div>
          <SpendingBarChart data={monthlyTrend} onBarClick={handleBarClick} />
        </Card>

        {/* Pie chart — drill-down par catégorie */}
        {Object.keys(expensesByCategory).length > 0 && (
          <Card>
            <p className="text-[13px] font-medium text-text dark:text-[#EDEDED] mb-3">
              Dépenses par catégorie
            </p>
            <CategoryPieChart
              expensesByCategory={expensesByCategory}
              categories={categories}
              onSliceClick={handleSliceClick}
            />
          </Card>
        )}
      </div>

      {/* Modal drill-down catégorie */}
      <Modal
        open={!!selectedSlice}
        onClose={() => setSelectedSlice(null)}
        title={selectedSlice?.name ?? ''}
      >
        {selectedSlice && (
          <div>
            <p className="text-small text-text-muted dark:text-[#a1a1aa] mb-4">
              {selectedSlice.transactions.length} transaction{selectedSlice.transactions.length !== 1 ? 's' : ''}
              {' · '}
              <span className="font-medium text-text dark:text-[#EDEDED]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatAmount(selectedSlice.value)}
              </span>
            </p>

            {selectedSlice.transactions.length === 0 ? (
              <p className="text-small text-text-muted dark:text-[#a1a1aa] text-center py-6">
                Aucune transaction
              </p>
            ) : (
              <div className="rounded-lg border border-border dark:border-[#3f3f46] divide-y divide-border dark:divide-[#3f3f46] overflow-hidden">
                {selectedSlice.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-3 py-2.5 bg-bg dark:bg-[#18181b]"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-small font-medium text-text dark:text-[#EDEDED] truncate">
                        {tx.title || tx.description || '—'}
                      </p>
                      <p className="text-[12px] text-text-muted dark:text-[#a1a1aa] mt-0.5 capitalize">
                        {formatDateLabel(tx.date)}
                      </p>
                    </div>
                    <p
                      className="text-small font-medium text-text dark:text-[#EDEDED] whitespace-nowrap"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      −{formatAmount(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
