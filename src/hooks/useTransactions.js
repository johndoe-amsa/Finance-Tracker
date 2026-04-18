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
        .select('*, categories(name, color, icon), subscriptions(kind)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: true })
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
        .select('*, categories(name, color, icon), subscriptions(kind)')
        .eq('is_verified', false)
        .order('date', { ascending: false })
        .order('created_at', { ascending: true })
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

export function useUnverifyTransaction() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db
        .from('transactions')
        .update({ is_verified: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      show('Transaction renvoyée à la vérification', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useMonthlyTrend(count = 6) {
  return useQuery({
    queryKey: ['monthlyTrend', count],
    queryFn: async () => {
      const today = new Date()
      const months = []
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
      }
      const startDate = `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`
      const lastM = months[months.length - 1]
      const lastDay = new Date(lastM.year, lastM.month, 0).getDate()
      const endDate = `${lastM.year}-${String(lastM.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const { data, error } = await db
        .from('transactions')
        .select('date, type, amount')
        .gte('date', startDate)
        .lte('date', endDate)
      if (error) throw error

      const map = {}
      for (const { year, month } of months) {
        const key = `${year}-${month}`
        map[key] = { income: 0, expense: 0 }
      }
      for (const tx of data) {
        const d = new Date(tx.date)
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`
        if (map[key]) map[key][tx.type] += parseFloat(tx.amount)
      }

      return months.map(({ year, month }) => {
        const key = `${year}-${month}`
        const label = new Date(year, month - 1, 1)
          .toLocaleDateString('fr-FR', { month: 'short' })
          .replace('.', '')
        return { label, year, month, ...map[key] }
      })
    },
  })
}
