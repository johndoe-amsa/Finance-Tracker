import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Plus } from 'lucide-react'
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
} from '../hooks/useSubscriptions'
import {
  formatAmount,
  subscriptionKind,
  monthlyAmountByKind,
} from '../lib/utils'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import SubscriptionItem from '../components/subscription/SubscriptionItem'
import SubscriptionForm from '../components/subscription/SubscriptionForm'

const SECTIONS = [
  { kind: 'income', title: 'Revenus récurrents' },
  { kind: 'fixed_expense', title: 'Charges fixes' },
  { kind: 'subscription', title: 'Abonnements' },
]

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

  const grouped = useMemo(() => {
    const buckets = { income: [], fixed_expense: [], subscription: [] }
    for (const sub of subscriptions || []) {
      const k = subscriptionKind(sub)
      if (buckets[k]) buckets[k].push(sub)
    }
    return buckets
  }, [subscriptions])

  const totals = useMemo(() => {
    const list = subscriptions || []
    return {
      income: monthlyAmountByKind(list, 'income'),
      fixed_expense: monthlyAmountByKind(list, 'fixed_expense'),
      subscription: monthlyAmountByKind(list, 'subscription'),
    }
  }, [subscriptions])

  const net = totals.income - totals.fixed_expense - totals.subscription

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

  const isEmpty = !isLoading && (!subscriptions || subscriptions.length === 0)

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-h3 text-text dark:text-dark-text">Récurrences</h2>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} strokeWidth={1.5} /> Ajouter
        </Button>
      </div>

      {!isEmpty && (
        <div className="px-4 mb-6">
          <Card className="!p-4">
            <p className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em] mb-3">
              Estimation mensuelle
            </p>
            <div className="space-y-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <Row label="Revenus" amount={totals.income} sign="+" tone="success" />
              <Row label="Charges fixes" amount={totals.fixed_expense} sign="−" />
              <Row label="Abonnements" amount={totals.subscription} sign="−" />
              <div className="pt-2 mt-2 border-t border-border dark:border-dark-border-subtle">
                <Row
                  label="Reste théorique"
                  amount={Math.abs(net)}
                  sign={net >= 0 ? '+' : '−'}
                  tone={net >= 0 ? 'success' : 'error'}
                  bold
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="px-4 space-y-8">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <EmptyState
            icon={RefreshCw}
            title="Aucune récurrence"
            description="Abonnements, charges fixes et revenus récurrents apparaîtront ici."
            action={
              <Button variant="ghost" onClick={() => setShowAdd(true)}>
                Ajouter une récurrence
              </Button>
            }
          />
        )}

        {!isLoading && !isEmpty && SECTIONS.map(({ kind, title }) => {
          const items = grouped[kind]
          if (!items || items.length === 0) return null
          return (
            <section key={kind}>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-small font-semibold text-text dark:text-dark-text uppercase tracking-[0.05em]">
                  {title}
                </h3>
                <span
                  className="text-[13px] text-text-muted dark:text-dark-text-muted"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatAmount(totals[kind])}/mois
                </span>
              </div>
              <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg divide-y divide-border dark:divide-dark-border">
                {items.map((sub) => (
                  <SubscriptionItem key={sub.id} subscription={sub} onClick={() => setEditSub(sub)} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter une récurrence">
        <SubscriptionForm onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>

      <Modal open={!!editSub} onClose={() => setEditSub(null)} title="Modifier la récurrence">
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
        title="Supprimer la récurrence"
        message="Êtes-vous sûr de vouloir supprimer cette récurrence ?"
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

function Row({ label, amount, sign, tone, bold }) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'error' ? 'text-error' :
    'text-text dark:text-dark-text'
  return (
    <div className="flex items-center justify-between">
      <span className={`text-small ${bold ? 'font-medium text-text dark:text-dark-text' : 'text-text-muted dark:text-dark-text-muted'}`}>
        {label}
      </span>
      <span className={`text-small ${bold ? 'font-semibold' : ''} ${toneClass}`}>
        {sign}{formatAmount(amount)}
      </span>
    </div>
  )
}
