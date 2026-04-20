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
  calculateMonthTotals,
} from '../lib/utils'
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
  const isGood = inverse ? pct <= 0 : pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-tiny font-medium ${isGood ? 'text-success' : 'text-error'}`}>
      {pct >= 0 ? <TrendingUp size={11} strokeWidth={1.5} /> : <TrendingDown size={11} strokeWidth={1.5} />}
      {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
    </span>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3 px-0.5">
      {children}
    </p>
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

  const { totalIncome, totalExpense, balance } = useMemo(
    () =>
      transactions
        ? calculateMonthTotals(transactions)
        : { totalIncome: 0, totalExpense: 0, balance: 0 },
    [transactions],
  )

  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : null
  const savingsBarWidth = savingsRate !== null ? Math.max(0, Math.min(100, savingsRate)) : 0

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

  const hasCategories = Object.keys(expensesByCategory).length > 0

  return (
    <div className="pb-24">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="bg-accent dark:bg-dark-bg-tertiary px-4 pt-4 pb-7">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 text-white/40 hover:text-white dark:text-dark-text-muted dark:hover:text-dark-text transition-colors rounded-md cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="text-h3 text-white dark:text-dark-text capitalize">
            {formatMonthYear(currentYear, currentMonth)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 text-white/40 hover:text-white dark:text-dark-text-muted dark:hover:text-dark-text transition-colors rounded-md cursor-pointer"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 dark:text-dark-text-muted mb-1.5">
            Solde du mois
          </p>
          <p
            className={`text-[36px] font-bold leading-none tracking-tight ${
              balance >= 0 ? 'text-white dark:text-dark-text' : 'text-error'
            }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {balance >= 0 ? '+' : '−'}{formatAmount(Math.abs(balance))}
          </p>
        </div>

        {/* Savings rate bar */}
        {savingsRate !== null && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 dark:text-dark-text-muted">
                Taux d'épargne
              </p>
              <span className={`text-[11px] font-semibold ${savingsRate >= 0 ? 'text-white/70 dark:text-dark-text-muted' : 'text-error'}`}>
                {savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/10 dark:bg-dark-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${savingsBarWidth}%`,
                  backgroundColor: savingsRate >= 0 ? '#10B981' : '#EE0000',
                }}
              />
            </div>
          </div>
        )}

        {/* Income / expense chips */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/8 dark:bg-dark-bg rounded-xl px-3.5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 dark:text-dark-text-muted mb-1">
              Revenus
            </p>
            <p className="text-[13px] font-semibold text-success" style={{ fontVariantNumeric: 'tabular-nums' }}>
              +{formatAmount(totalIncome)}
            </p>
          </div>
          <div className="bg-white/8 dark:bg-dark-bg rounded-xl px-3.5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40 dark:text-dark-text-muted mb-1">
              Dépenses
            </p>
            <p className="text-[13px] font-semibold text-error" style={{ fontVariantNumeric: 'tabular-nums' }}>
              −{formatAmount(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sections ─────────────────────────────────── */}
      <div className="px-4 pt-6 space-y-6">

        {/* Section: Ce mois (month-dependent) */}
        {hasCategories && (
          <section>
            <SectionLabel>Ce mois</SectionLabel>
            <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-5">
              <p className="text-caption font-semibold text-text dark:text-dark-text mb-4">
                Répartition par catégorie
              </p>
              <CategoryPieChart
                expensesByCategory={expensesByCategory}
                categories={categories}
                onSliceClick={handleSliceClick}
              />
            </div>
          </section>
        )}

        {/* Section: Évolution (independent of selected month) */}
        <section>
          <SectionLabel>Évolution</SectionLabel>
          <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <p className="text-caption font-semibold text-text dark:text-dark-text">
                  Revenus & dépenses
                </p>
                {trend && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-tiny text-text-muted dark:text-dark-text-muted flex items-center gap-1">
                      Rev.&nbsp;<TrendBadge current={trend.curr.income} previous={trend.prev.income} />
                    </span>
                    <span className="text-tiny text-text-muted dark:text-dark-text-muted flex items-center gap-1">
                      Dép.&nbsp;<TrendBadge current={trend.curr.expense} previous={trend.prev.expense} inverse />
                    </span>
                  </div>
                )}
              </div>
              <ToggleGroup options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
            </div>
            <SpendingBarChart data={monthlyTrend} onBarClick={handleBarClick} />
          </div>
        </section>

      </div>

      {/* ── Category drill-down modal ─────────────────── */}
      <Modal
        open={!!selectedSlice}
        onClose={() => setSelectedSlice(null)}
        title={selectedSlice?.name ?? ''}
      >
        {selectedSlice && (
          <div>
            <p className="text-small text-text-muted dark:text-dark-text-muted mb-4">
              {selectedSlice.transactions.length} transaction{selectedSlice.transactions.length !== 1 ? 's' : ''}
              {' · '}
              <span className="font-semibold text-text dark:text-dark-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatAmount(selectedSlice.value)}
              </span>
            </p>
            {selectedSlice.transactions.length === 0 ? (
              <p className="text-small text-text-muted dark:text-dark-text-muted text-center py-6">
                Aucune transaction
              </p>
            ) : (
              <div className="rounded-lg border border-border dark:border-dark-border-subtle divide-y divide-border dark:divide-dark-border-subtle overflow-hidden">
                {selectedSlice.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-3 py-2.5 bg-bg dark:bg-dark-bg"
                  >
                    <div className="min-w-0 mr-3">
                      <p className="text-small font-medium text-text dark:text-dark-text truncate">
                        {tx.title || tx.description || '—'}
                      </p>
                      <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5 capitalize">
                        {formatDateLabel(tx.date)}
                      </p>
                    </div>
                    <p
                      className="text-small font-medium text-text dark:text-dark-text whitespace-nowrap"
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
