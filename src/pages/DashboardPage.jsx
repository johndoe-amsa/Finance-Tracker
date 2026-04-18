import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Wallet, Search } from 'lucide-react'
import SparklineChart from '../components/charts/SparklineChart'
import { useAppStore } from '../store/useAppStore'
import {
  useTransactions,
  useUpdateTransaction,
  useUnverifyTransaction,
} from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useSubscriptions } from '../hooks/useSubscriptions'
import useUndoableDelete from '../hooks/useUndoableDelete'
import useUndoableVerify from '../hooks/useUndoableVerify'
import {
  formatMonthYear,
  formatAmount,
  calculateMonthTotals,
  calculateExpensesByCategory,
  getNextBillingDate,
} from '../lib/utils'
import { Card } from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import TransactionList from '../components/transaction/TransactionList'
import TransactionForm from '../components/transaction/TransactionForm'
import BudgetBar from '../components/budget/BudgetBar'
import BudgetDetailModal from '../components/budget/BudgetDetailModal'
import SearchModal from '../components/search/SearchModal'

function SubRow({ sub }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <p className="text-small font-medium text-text dark:text-[#EDEDED] truncate flex-1">{sub.name}</p>
      <p className="text-label text-text-muted dark:text-[#a1a1aa] flex-shrink-0 w-12 text-right">
        {sub.nextDate.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })}
      </p>
      <p className="text-small font-semibold text-text dark:text-[#EDEDED] flex-shrink-0 w-20 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
        −{formatAmount(sub.amount)}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { currentYear, currentMonth, setMonth } = useAppStore()
const { data: transactions, isLoading } = useTransactions(currentYear, currentMonth)
  const { data: categories = [] } = useCategories()
  const { data: subscriptions = [] } = useSubscriptions()
  const undoableVerify = useUndoableVerify()
  const updateMutation = useUpdateTransaction()
  const unverifyMutation = useUnverifyTransaction()
  const undoableDelete = useUndoableDelete()

  const [editTx, setEditTx] = useState(null)
  const [budgetDetail, setBudgetDetail] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showAllSubs, setShowAllSubs] = useState(false)
  // Remember which budget category opened the expense modal so we can
  // navigate back to it when the expense modal is dismissed.
  const budgetDetailBeforeEdit = useRef(null)

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

  const upcomingSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => s.is_active && s.kind !== 'income')
      .map((s) => ({ ...s, nextDate: getNextBillingDate(s) }))
      .filter((s) => s.nextDate)
      .sort((a, b) => a.nextDate - b.nextDate)
      .slice(0, 10)
  }, [subscriptions])

  // Close the expense modal and return to the budget-detail modal if the
  // expense was opened from there.
  const clearEditTx = useCallback(() => {
    setEditTx(null)
    if (budgetDetailBeforeEdit.current) {
      setBudgetDetail(budgetDetailBeforeEdit.current)
      budgetDetailBeforeEdit.current = null
    }
  }, [])

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editTx.id, ...data }, { onSuccess: clearEditTx })
  }

  const handleDelete = () => {
    undoableDelete(editTx)
    clearEditTx()
  }

  const handleUnverify = () => {
    unverifyMutation.mutate(editTx.id, { onSuccess: clearEditTx })
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
    (tx) => undoableVerify(tx),
    [undoableVerify],
  )

  return (
    <div className="pb-24">
      {/* Month navigation — sticky, toujours opaque */}
      <div className="sticky top-0 z-[150] bg-bg dark:bg-[#18181b] border-b border-border dark:border-[#3f3f46]">
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

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-text-muted hover:text-text dark:text-[#a1a1aa] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
              aria-label="Rechercher"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-text-muted hover:text-text dark:text-[#a1a1aa] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md cursor-pointer"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero solde */}
      <div className="px-4 pt-4 mb-5">
        {isLoading ? (
          <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg p-5">
            <Skeleton className="h-3 w-12 mb-3" />
            <Skeleton className="h-9 w-36 mb-4" />
            <div className="flex gap-6 pt-3 border-t border-border dark:border-[#52525b]">
              <div><Skeleton className="h-3 w-14 mb-1.5" /><Skeleton className="h-4 w-20" /></div>
              <div><Skeleton className="h-3 w-14 mb-1.5" /><Skeleton className="h-4 w-20" /></div>
            </div>
          </div>
        ) : (
          <Card className="!p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-1">
                  Solde
                </p>
                <p
                  className={`text-[34px] font-bold leading-tight ${totals.balance >= 0 ? 'text-success' : 'text-error'}`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {totals.balance >= 0 ? '+' : '−'}{formatAmount(Math.abs(totals.balance))}
                </p>
              </div>
              <SparklineChart
                transactions={transactions}
                className="w-20 h-7 mt-1 flex-shrink-0"
              />
            </div>
            <div className="flex gap-6 mt-3 pt-3 border-t border-border dark:border-[#52525b]">
              <div>
                <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-0.5">
                  Revenus
                </p>
                <p className="text-small font-semibold text-success" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  +{formatAmount(totals.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-0.5">
                  Dépenses
                </p>
                <p className="text-small font-semibold text-text dark:text-[#EDEDED]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  −{formatAmount(totals.totalExpense)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Prochains prélèvements */}
      {upcomingSubscriptions.length > 0 && (
        <div className="px-4 mb-5">
          <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em] mb-3">
            Prochains prélèvements
          </h3>
          <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg">
            <div className="divide-y divide-border dark:divide-[#52525b]">
              {upcomingSubscriptions.slice(0, 3).map((sub) => (
                <SubRow key={sub.id} sub={sub} />
              ))}
            </div>
            {upcomingSubscriptions.length > 3 && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: showAllSubs ? '1fr' : '0fr',
                    transition: 'grid-template-rows 280ms ease',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="divide-y divide-border dark:divide-[#52525b] border-t border-border dark:border-[#52525b]">
                      {upcomingSubscriptions.slice(3).map((sub) => (
                        <SubRow key={sub.id} sub={sub} />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllSubs((v) => !v)}
                  className="w-full flex items-center justify-center py-2.5 border-t border-border dark:border-[#52525b] text-text-muted dark:text-[#a1a1aa] hover:text-text dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                >
                  {showAllSubs ? <ChevronUp size={16} strokeWidth={1.5} /> : <ChevronDown size={16} strokeWidth={1.5} />}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Budgets */}
      {budgetCategories.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em] mb-3">
            Budgets
          </h3>
          <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg divide-y divide-border dark:divide-[#52525b] overflow-hidden">
            {budgetCategories.map((cat, i) => (
              <BudgetBar
                key={cat.id}
                index={i}
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
        <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em] mb-3">
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
          />
        )}
      </div>

      {/* Search modal — rendered before edit modal so that edit (same z-index,
          later in DOM) appears on top, preserving search state on close. */}
      <SearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onItemClick={handleItemClick}
        onVerify={handleVerify}
        hasModalAbove={!!editTx}
      />

      {/* Edit transaction modal */}
      <Modal open={!!editTx} onClose={clearEditTx} title="Modifier la transaction">
        {editTx && (
          <TransactionForm
            transaction={editTx}
            onSubmit={handleEditSubmit}
            onDelete={handleDelete}
            onUnverify={handleUnverify}
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
          budgetDetailBeforeEdit.current = budgetDetail
          setBudgetDetail(null)
          setEditTx(tx)
        }}
      />
    </div>
  )
}
