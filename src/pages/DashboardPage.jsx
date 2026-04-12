import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Wallet, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import {
  useTransactions,
  useVerifyTransaction,
  useUpdateTransaction,
  useMonthlyTrend,
} from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useInsights, computeInsights } from '../hooks/useInsights'
import useUndoableDelete from '../hooks/useUndoableDelete'
import {
  formatMonthYear,
  formatAmount,
  calculateMonthTotals,
  calculateExpensesByCategory,
} from '../lib/utils'
import { Card } from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import TransactionList from '../components/transaction/TransactionList'
import TransactionForm from '../components/transaction/TransactionForm'
import BudgetBar from '../components/budget/BudgetBar'
import BudgetDetailModal from '../components/budget/BudgetDetailModal'
import SpendingBarChart from '../components/charts/SpendingBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import InsightsSection from '../components/insights/InsightsSection'
import SearchModal from '../components/search/SearchModal'

export default function DashboardPage() {
  const { currentYear, currentMonth, setMonth } = useAppStore()
  const { data: transactions, isLoading } = useTransactions(currentYear, currentMonth)
  const { data: categories = [] } = useCategories()
  const { data: monthlyTrend = [] } = useMonthlyTrend(6)
  const { data: insightData } = useInsights(currentYear, currentMonth)
  const verifyMutation = useVerifyTransaction()
  const updateMutation = useUpdateTransaction()
  const undoableDelete = useUndoableDelete()

  const [editTx, setEditTx] = useState(null)
  const [budgetDetail, setBudgetDetail] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

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

  const totals = useMemo(
    () =>
      transactions
        ? calculateMonthTotals(transactions)
        : { totalIncome: 0, totalExpense: 0, balance: 0 },
    [transactions],
  )

  const expensesByCategory = useMemo(
    () => (transactions ? calculateExpensesByCategory(transactions) : {}),
    [transactions],
  )

  const budgetCategories = useMemo(
    () =>
      categories
        .filter((c) => c.type === 'expense' && c.budget_limit > 0)
        .map((c) => ({
          ...c,
          spent: expensesByCategory[c.id] || 0,
          pct: c.budget_limit > 0
            ? ((expensesByCategory[c.id] || 0) / parseFloat(c.budget_limit)) * 100
            : 0,
        }))
        .sort((a, b) => b.pct - a.pct),
    [categories, expensesByCategory],
  )

  const insights = useMemo(
    () => computeInsights(insightData, categories, currentMonth),
    [insightData, categories, currentMonth],
  )

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editTx.id, ...data }, { onSuccess: () => setEditTx(null) })
  }

  const handleDelete = () => {
    undoableDelete(editTx)
    setEditTx(null)
  }

  const budgetDetailTransactions = useMemo(
    () =>
      budgetDetail && transactions
        ? transactions.filter(
            (t) => t.type === 'expense' && t.category_id === budgetDetail.id,
          )
        : [],
    [budgetDetail, transactions],
  )

  // Stable handlers so TransactionList / TransactionItem can be memoized
  // without breaking referential equality on every render.
  const handleItemClick = useCallback((tx) => setEditTx(tx), [])
  const handleVerify = useCallback(
    (id) => verifyMutation.mutate(id),
    [verifyMutation],
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
            aria-label="Rechercher"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 mb-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg p-4"
              >
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Card className="!p-4">
              <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-1">
                Revenus
              </p>
              <p
                className="text-[16px] font-semibold text-success"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                +{formatAmount(totals.totalIncome)}
              </p>
            </Card>
            <Card className="!p-4">
              <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-1">
                Depenses
              </p>
              <p
                className="text-[16px] font-semibold text-text dark:text-[#EDEDED]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                -{formatAmount(totals.totalExpense)}
              </p>
            </Card>
            <Card className={`!p-4 ${totals.balance < 0 ? '!border-error/30' : ''}`}>
              <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-1">
                Solde
              </p>
              <p
                className={`text-[16px] font-semibold ${totals.balance >= 0 ? 'text-success' : 'text-error'}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {totals.balance >= 0 ? '+' : '-'}{formatAmount(Math.abs(totals.balance))}
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Analytics */}
      <div className="px-4 mb-6">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-3">
          Analytiques
        </h3>
        <div className="space-y-4">
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

      {/* Insights */}
      <InsightsSection insights={insights} />

      {/* Budgets */}
      {budgetCategories.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-3">
            Budgets
          </h3>
          <div className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg divide-y divide-border dark:divide-[#333333]">
            {budgetCategories.map((cat) => (
              <BudgetBar
                key={cat.id}
                name={cat.name}
                spent={cat.spent}
                limit={parseFloat(cat.budget_limit)}
                color={cat.color}
                onClick={() => setBudgetDetail(cat)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="px-4">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-3">
          Transactions
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aucune transaction"
            description="Les transactions de cette periode apparaitront ici."
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onItemClick={handleItemClick}
            onVerify={handleVerify}
            onDelete={undoableDelete}
          />
        )}
      </div>

      {/* Edit transaction modal */}
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Modifier la transaction">
        {editTx && (
          <TransactionForm
            transaction={editTx}
            onSubmit={handleEditSubmit}
            onDelete={handleDelete}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Budget detail modal */}
      <BudgetDetailModal
        open={!!budgetDetail}
        onClose={() => setBudgetDetail(null)}
        category={budgetDetail}
        spent={budgetDetail?.spent || 0}
        transactions={budgetDetailTransactions}
        onTransactionClick={(tx) => {
          setBudgetDetail(null)
          setEditTx(tx)
        }}
      />

      {/* Search modal */}
      <SearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onItemClick={handleItemClick}
        onVerify={handleVerify}
      />
    </div>
  )
}
