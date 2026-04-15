import { useState, useEffect, useCallback } from 'react'
import { CheckSquare } from 'lucide-react'
import {
  useUnverifiedTransactions,
  useUpdateTransaction,
} from '../hooks/useTransactions'
import useUndoableDelete from '../hooks/useUndoableDelete'
import useUndoableVerify from '../hooks/useUndoableVerify'
import TransactionList from '../components/transaction/TransactionList'
import Modal from '../components/ui/Modal'
import TransactionForm from '../components/transaction/TransactionForm'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function VerifyPage() {
  const { data: transactions, isLoading } = useUnverifiedTransactions()
  const undoableVerify = useUndoableVerify()
  const updateMutation = useUpdateTransaction()
  const undoableDelete = useUndoableDelete()

  const [editTx, setEditTx] = useState(null)

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

  // Stable handler so memoized TransactionItem children don't re-render
  // on every parent render.
  const handleVerify = useCallback(
    (tx) => undoableVerify(tx),
    [undoableVerify],
  )

  return (
    <div className="pb-24">
      <div className="px-4 py-4">
        <h2 className="text-h3 text-text dark:text-[#EDEDED]">A verifier</h2>
        <p className="text-small text-text-muted dark:text-[#a1a1aa] mt-1">
          {count} transaction{count > 1 ? 's' : ''} en attente de verification
        </p>
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
            onDelete={undoableDelete}
          />
        )}
      </div>

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

    </div>
  )
}
