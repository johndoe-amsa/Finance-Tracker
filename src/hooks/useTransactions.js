import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

export function useTransactions(year, month) {
  const pad = (n) => String(n).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const startDate = `${year}-${pad(month)}-01`
  const endDate = `${year}-${pad(month)}-${pad(lastDay)}`

  return useQuery({
    queryKey: ['transactions', year, month],
    queryFn: async () => {
      const { data, error } = await db
        .from('transactions')
        .select('*, categories(name)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useUnverifiedTransactions() {
  return useQuery({
    queryKey: ['transactions', 'unverified'],
    queryFn: async () => {
      const { data, error } = await db
        .from('transactions')
        .select('*, categories(name)')
        .eq('is_verified', false)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (tx) => {
      const { data: { user } } = await db.auth.getUser()
      const { data, error } = await db
        .from('transactions')
        .insert({ ...tx, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      show('Transaction ajoutée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await db
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      show('Transaction modifiée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      show('Transaction supprimée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useVerifyTransaction() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db
        .from('transactions')
        .update({ is_verified: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      show('Transaction vérifiée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}
