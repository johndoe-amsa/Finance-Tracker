import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (cat) => {
      const { data: { user } } = await db.auth.getUser()
      const { data, error } = await db
        .from('categories')
        .insert({ ...cat, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      show('Catégorie ajoutée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await db
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      show('Catégorie modifiée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      show('Catégorie supprimée', 'success')
    },
    onError: (err) => show(`Erreur : ${err.message}`, 'error'),
  })
}
