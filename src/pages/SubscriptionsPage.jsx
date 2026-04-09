import { useState, useEffect } from 'react'
import { RefreshCw, Plus } from 'lucide-react'
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
} from '../hooks/useSubscriptions'
import { calculateMonthlyTotal, formatAmount } from '../lib/utils'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import SubscriptionItem from '../components/subscription/SubscriptionItem'
import SubscriptionForm from '../components/subscription/SubscriptionForm'

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions()
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const deleteMutation = useDeleteSubscription()

  const [showAdd, setShowAdd] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const monthlyTotal = subscriptions ? calculateMonthlyTotal(subscriptions) : 0

  const handleCreate = (data) => {
    createMutation.mutate(data, { onSuccess: () => setShowAdd(false) })
  }

  const handleUpdate = (data) => {
    updateMutation.mutate({ id: editSub.id, ...data }, { onSuccess: () => setEditSub(null) })
  }

  const handleDelete = () => {
    deleteMutation.mutate(editSub.id, {
      onSuccess: () => {
        setEditSub(null)
        setConfirmDelete(false)
      },
    })
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-h3 text-text dark:text-[#EDEDED]">Abonnements</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} strokeWidth={1.5} /> Ajouter
        </Button>
      </div>

      <div className="px-4 mb-6">
        <Card className="!p-4">
          <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-1">
            Cout mensuel
          </p>
          <p
            className="text-[24px] font-bold tracking-[-0.03em] text-text dark:text-[#EDEDED]"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatAmount(monthlyTotal)}
          </p>
        </Card>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : !subscriptions || subscriptions.length === 0 ? (
          <EmptyState
            icon={RefreshCw}
            title="Aucun abonnement"
            description="Vos abonnements recurrents apparaitront ici."
            action={
              <Button variant="secondary" onClick={() => setShowAdd(true)}>
                Ajouter un abonnement
              </Button>
            }
          />
        ) : (
          <div className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg divide-y divide-border dark:divide-[#333333]">
            {subscriptions.map((sub) => (
              <SubscriptionItem key={sub.id} subscription={sub} onClick={() => setEditSub(sub)} />
            ))}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un abonnement">
        <SubscriptionForm onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editSub} onClose={() => setEditSub(null)} title="Modifier l'abonnement">
        {editSub && (
          <SubscriptionForm
            subscription={editSub}
            onSubmit={handleUpdate}
            onDelete={() => setConfirmDelete(true)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer l'abonnement"
        message="Etes-vous sur de vouloir supprimer cet abonnement ?"
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
