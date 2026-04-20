import { useState, useMemo, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Calendar,
  Receipt,
  Tag,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useTransactions, useMonthlyTrend } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import {
  formatMonthYear,
  formatAmount,
  formatDateLabel,
  calculateMonthTotals,
  calculateExpensesByCategory,
} from '../lib/utils'
import { Card } from '../components/ui/Card'
import ToggleGroup from '../components/ui/ToggleGroup'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import SpendingBarChart from '../components/charts/SpendingBarChart'
import CumulativeBalanceChart from '../components/charts/CumulativeBalanceChart'
import CategoryBreakdown from '../components/charts/CategoryBreakdown'
import WeekdayChart from '../components/charts/WeekdayChart'

const PERIOD_OPTIONS = [
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
]

function SectionHeader({ icon: Icon, title, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="text-text-muted dark:text-dark-text-muted"
            aria-hidden="true"
          />
        )}
        <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em]">
          {title}
        </h3>
      </div>
      {right}
    </div>
  )
}

function pctDelta(current, previous) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

export default function AnalyticsPage() {
  const { currentYear, currentMonth, setMonth } = useAppStore()
  const navigate = useNavigate()

  // Mois précédent pour les comparaisons
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const { data: transactions, isLoading } = useTransactions(currentYear, currentMonth)
  const { data: prevTransactions } = useTransactions(prevYear, prevMonth)
  const { data: categories = [] } = useCategories()

  const [period, setPeriod] = useState(6)
  const [selectedSlice, setSelectedSlice] = useState(null)

  const { data: monthlyTrend = [] } = useMonthlyTrend(period)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentYear, currentMonth])

  const goPrevMonth = () => {
    if (currentMonth === 1) setMonth(currentYear - 1, 12)
    else setMonth(currentYear, currentMonth - 1)
  }

  const goNextMonth = () => {
    if (currentMonth === 12) setMonth(currentYear + 1, 1)
    else setMonth(currentYear, currentMonth + 1)
  }

  const currentTotals = useMemo(
    () =>
      transactions
        ? calculateMonthTotals(transactions)
        : { totalIncome: 0, totalExpense: 0, balance: 0 },
    [transactions],
  )

  const prevTotals = useMemo(
    () =>
      prevTransactions
        ? calculateMonthTotals(prevTransactions)
        : { totalIncome: 0, totalExpense: 0, balance: 0 },
    [prevTransactions],
  )

  const savingsRate = currentTotals.totalIncome > 0
    ? (currentTotals.balance / currentTotals.totalIncome) * 100
    : null

  const prevSavingsRate = prevTotals.totalIncome > 0
    ? (prevTotals.balance / prevTotals.totalIncome) * 100
    : null

  const savingsRateDelta =
    savingsRate !== null && prevSavingsRate !== null
      ? savingsRate - prevSavingsRate
      : null

  const expensesByCategory = useMemo(
    () => (transactions ? calculateExpensesByCategory(transactions) : {}),
    [transactions],
  )

  const prevExpensesByCategory = useMemo(
    () => (prevTransactions ? calculateExpensesByCategory(prevTransactions) : {}),
    [prevTransactions],
  )

  const topExpenses = useMemo(() => {
    if (!transactions) return []
    return transactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5)
  }, [transactions])

  // Nombre de jours écoulés dans le mois affiché — pour calculer une
  // moyenne de dépense comparable sur un mois en cours vs un mois clos.
  const daysElapsed = useMemo(() => {
    const today = new Date()
    const isCurrentMonth =
      currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1
    return isCurrentMonth
      ? today.getDate()
      : new Date(currentYear, currentMonth, 0).getDate()
  }, [currentYear, currentMonth])

  const dailyAvgExpense = currentTotals.totalExpense / Math.max(1, daysElapsed)

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

  const hasTransactions = (transactions?.length ?? 0) > 0
  const hasCategoryData = Object.keys(expensesByCategory).length > 0

  return (
    <div className="pb-24">
      {/* Header — sticky, même pattern que le dashboard */}
      <div className="sticky top-0 z-sticky bg-bg dark:bg-dark-bg border-b border-border dark:border-dark-border-subtle">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={goPrevMonth}
            className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors duration-150 rounded-md cursor-pointer"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="text-h3 text-text dark:text-dark-text capitalize">
            {formatMonthYear(currentYear, currentMonth)}
          </h2>
          <button
            onClick={goNextMonth}
            className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors duration-150 rounded-md cursor-pointer"
            aria-label="Mois suivant"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {isLoading ? (
            <>
              <KpiCard isLoading label="" value="" />
              <KpiCard isLoading label="" value="" />
              <KpiCard isLoading label="" value="" />
              <KpiCard isLoading label="" value="" />
            </>
          ) : (
            <>
              <KpiCard
                label="Revenus"
                value={formatAmount(currentTotals.totalIncome)}
                delta={pctDelta(currentTotals.totalIncome, prevTotals.totalIncome)}
              />
              <KpiCard
                label="Dépenses"
                value={formatAmount(currentTotals.totalExpense)}
                delta={pctDelta(currentTotals.totalExpense, prevTotals.totalExpense)}
                inverse
              />
              <KpiCard
                label="Épargne"
                value={`${currentTotals.balance >= 0 ? '+' : '−'}${formatAmount(Math.abs(currentTotals.balance))}`}
                accent={currentTotals.balance >= 0 ? 'success' : 'error'}
                delta={
                  prevTotals.balance !== 0
                    ? ((currentTotals.balance - prevTotals.balance) / Math.abs(prevTotals.balance)) * 100
                    : null
                }
              />
              <KpiCard
                label="Taux d'épargne"
                value={savingsRate !== null ? `${savingsRate.toFixed(0)}%` : '—'}
                deltaLabel={
                  savingsRate === null
                    ? 'aucun revenu'
                    : savingsRateDelta === null
                      ? 'vs mois préc.'
                      : `${savingsRateDelta > 0 ? '+' : ''}${savingsRateDelta.toFixed(1)} pts`
                }
                accent={
                  savingsRate === null
                    ? 'neutral'
                    : savingsRate >= 20
                      ? 'success'
                      : savingsRate < 0
                        ? 'error'
                        : 'neutral'
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Pas encore de data pour ce mois → state vide */}
      {!isLoading && !hasTransactions && (
        <div className="px-4 mt-4">
          <Card>
            <EmptyState
              icon={BarChart3}
              title="Aucune donnée ce mois"
              description="Ajoutez des transactions pour visualiser vos statistiques."
            />
          </Card>
        </div>
      )}

      {hasTransactions && (
        <>
          {/* Flux de trésorerie — balance cumulée jour par jour */}
          <div className="px-4 mt-5">
            <SectionHeader icon={Activity} title="Flux de trésorerie" />
            <Card className="!p-4">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <div>
                  <p className="text-tiny text-text-muted dark:text-dark-text-muted uppercase tracking-[0.05em] mb-0.5">
                    Solde fin de période
                  </p>
                  <p
                    className={`text-h3 font-bold tracking-[-0.02em] ${
                      currentTotals.balance >= 0 ? 'text-success' : 'text-error'
                    }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {currentTotals.balance >= 0 ? '+' : '−'}
                    {formatAmount(Math.abs(currentTotals.balance))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-tiny text-text-muted dark:text-dark-text-muted uppercase tracking-[0.05em] mb-0.5">
                    Dépense moyenne / jour
                  </p>
                  <p
                    className="text-small font-semibold text-text dark:text-dark-text"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatAmount(dailyAvgExpense)}
                  </p>
                </div>
              </div>
              <CumulativeBalanceChart
                transactions={transactions}
                year={currentYear}
                month={currentMonth}
              />
            </Card>
          </div>

          {/* Tendance multi-mois */}
          <div className="px-4 mt-5">
            <SectionHeader
              icon={BarChart3}
              title="Tendance"
              right={
                <ToggleGroup options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
              }
            />
            <Card className="!p-4">
              <SpendingBarChart data={monthlyTrend} onBarClick={handleBarClick} />
            </Card>
          </div>

          {/* Répartition par catégorie */}
          {hasCategoryData && (
            <div className="px-4 mt-5">
              <SectionHeader icon={Tag} title="Par catégorie" />
              <Card className="!p-3">
                <CategoryBreakdown
                  expensesByCategory={expensesByCategory}
                  prevExpensesByCategory={prevExpensesByCategory}
                  categories={categories}
                  onSliceClick={handleSliceClick}
                />
              </Card>
            </div>
          )}

          {/* Top dépenses */}
          {topExpenses.length > 0 && (
            <div className="px-4 mt-5">
              <SectionHeader icon={Receipt} title="Top dépenses" />
              <Card className="!p-0 overflow-hidden">
                <ul className="divide-y divide-border dark:divide-dark-border-subtle">
                  {topExpenses.map((tx) => {
                    const cat = tx.categories
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <span
                          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-caption"
                          style={{
                            backgroundColor: cat?.color ? `${cat.color}1A` : 'rgba(0,0,0,0.05)',
                          }}
                          aria-hidden="true"
                        >
                          {cat?.icon || '•'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-small font-medium text-text dark:text-dark-text truncate">
                            {tx.title || tx.description || cat?.name || '—'}
                          </p>
                          <p className="text-tiny text-text-muted dark:text-dark-text-muted capitalize truncate">
                            {formatDateLabel(tx.date)}
                            {cat?.name ? ` · ${cat.name}` : ''}
                          </p>
                        </div>
                        <p
                          className="text-small font-semibold text-text dark:text-dark-text shrink-0 whitespace-nowrap"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          −{formatAmount(tx.amount)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            </div>
          )}

          {/* Habitudes par jour de la semaine */}
          <div className="px-4 mt-5">
            <SectionHeader icon={Calendar} title="Dépenses par jour" />
            <Card className="!p-4">
              <p className="text-tiny text-text-muted dark:text-dark-text-muted mb-3">
                Moyenne par jour de la semaine · la barre la plus haute est mise en évidence.
              </p>
              <WeekdayChart transactions={transactions} />
            </Card>
          </div>
        </>
      )}

      {/* Modal drill-down catégorie */}
      <Modal
        open={!!selectedSlice}
        onClose={() => setSelectedSlice(null)}
        title={selectedSlice?.name ?? ''}
      >
        {selectedSlice && (
          <div>
            <p className="text-small text-text-muted dark:text-dark-text-muted mb-4">
              {selectedSlice.transactions.length} transaction
              {selectedSlice.transactions.length !== 1 ? 's' : ''}
              {' · '}
              <span
                className="font-medium text-text dark:text-dark-text"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
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
