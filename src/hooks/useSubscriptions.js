import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await db
        .from('subscriptions')
        .select('*, categories(name, icon)')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateSubscription() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (sub) => {
      const { data: { user } } = await db.auth.getUser()
      const { data, error } = await db
        .from('subscriptions')
        .insert({ ...sub, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      show('Abonnement ajouté', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useUpdateSubscription() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await db
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      // Transactions embed subscriptions(kind) via join and the subscription
      // name, so refresh them too when the parent subscription changes.
      qc.invalidateQueries({ queryKey: ['transactions'] })
      show('Abonnement modifié', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useDeleteSubscription() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      // Refresh transaction lists so orphaned subscription_id rows reflect
      // the new DB state (the DB-side FK rule decides whether rows are
      // kept with subscription_id=null or removed).
      qc.invalidateQueries({ queryKey: ['transactions'] })
      show('Abonnement supprimé', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}
