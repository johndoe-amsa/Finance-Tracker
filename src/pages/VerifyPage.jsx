import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useUnverifiedTransactions,
  useUpdateTransaction,
  useUnverifyTransaction,
} from '../hooks/useTransactions'
import useUndoableDelete from '../hooks/useUndoableDelete'
import useUndoableVerify from '../hooks/useUndoableVerify'
import TransactionList from '../components/transaction/TransactionList'
import Modal from '../components/ui/Modal'
import TransactionForm from '../components/transaction/TransactionForm'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { generateMissingSubscriptionTransactions } from '../lib/subscriptionGenerator'
import { useToastStore } from '../store/useToastStore'

export default function VerifyPage() {
  const { data: transactions, isLoading } = useUnverifiedTransactions()
  const undoableVerify = useUndoableVerify()
  const updateMutation = useUpdateTransaction()
  const unverifyMutation = useUnverifyTransaction()
  const undoableDelete = useUndoableDelete()
  const qc = useQueryClient()
  const showToast = useToastStore((s) => s.show)

  const [editTx, setEditTx] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await generateMissingSubscriptionTransactions()
      await qc.invalidateQueries({ queryKey: ['transactions'] })
      showToast('Abonnements à jour', 'success')
    } catch (err) {
      showToast(`Erreur : ${err.message}`, 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const count = transactions?.length || 0

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editTx.id, ...data }, { onSuccess: () => setEditTx(null) })
  }

  const handleDelete = () => {
    undoableDelete(editTx)
    setEditTx(null)
  }

  const handleUnverify = () => {
    unverifyMutation.mutate(editTx.id, { onSuccess: () => setEditTx(null) })
  }

  // Stable handler so memoized TransactionItem children don't re-render
  // on every parent render.
  const handleVerify = useCallback(
    (tx) => undoableVerify(tx),
    [undoableVerify],
  )

  return (
    <div className="pb-24">
      <div className="px-4 py-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-h3 text-text dark:text-dark-text">A verifier</h2>
          <p className="text-small text-text-muted dark:text-dark-text-muted mt-1">
            {count} transaction{count > 1 ? 's' : ''} en attente de verification
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Actualiser depuis les abonnements"
          title="Actualiser depuis les abonnements"
          className="p-2 text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors duration-150 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw
            size={20}
            strokeWidth={1.5}
            className={isRefreshing ? 'animate-spin' : ''}
          />
        </button>
      </div>

      <div className="px-4">
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
        ) : count === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Tout est verifie"
            description="Aucune transaction en attente de verification."
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onItemClick={setEditTx}
            onVerify={handleVerify}
          />
        )}
      </div>

      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Modifier la transaction">
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

    </div>
  )
}
