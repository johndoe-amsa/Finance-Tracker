import { useState, useEffect } from 'react'
import { CheckSquare } from 'lucide-react'
import {
  useUnverifiedTransactions,
  useVerifyTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../hooks/useTransactions'
import TransactionList from '../components/transaction/TransactionList'
import Modal from '../components/ui/Modal'
import TransactionForm from '../components/transaction/TransactionForm'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'

export default function VerifyPage() {
  const { data: transactions, isLoading } = useUnverifiedTransactions()
  const verifyMutation = useVerifyTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const [editTx, setEditTx] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const count = transactions?.length || 0

  const handleEditSubmit = (data) => {
    updateMutation.mutate({ id: editTx.id, ...data }, { onSuccess: () => setEditTx(null) })
  }

  const handleDelete = () => {
    deleteMutation.mutate(editTx.id, {
      onSuccess: () => {
        setEditTx(null)
        setConfirmDelete(false)
      },
    })
  }

  return (
    <div className="pb-24">
      <div className="px-4 py-4">
        <h2 className="text-h3 text-text dark:text-[#EDEDED]">A verifier</h2>
        <p className="text-small text-text-muted dark:text-[#888888] mt-1">
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
            onVerify={(id) => verifyMutation.mutate(id)}
          />
        )}
      </div>

      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Modifier la transaction">
        {editTx && (
          <TransactionForm
            transaction={editTx}
            onSubmit={handleEditSubmit}
            onDelete={() => setConfirmDelete(true)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer la transaction"
        message="Etes-vous sur de vouloir supprimer cette transaction ?"
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
