import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { db } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export function useUnverifiedCount() {
  const setUnverifiedCount = useAppStore((s) => s.setUnverifiedCount)

  const query = useQuery({
    queryKey: ['unverifiedCount'],
    queryFn: async () => {
      const { count, error } = await db
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)
      if (error) throw error
      return count || 0
    },
  })

  useEffect(() => {
    if (query.data !== undefined) {
      setUnverifiedCount(query.data)
    }
  }, [query.data, setUnverifiedCount])

  return query
}
