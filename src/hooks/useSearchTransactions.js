import { useQuery } from '@tanstack/react-query'
import { db } from '../lib/supabase'

export function useSearchTransactions(filters) {
  const { term, type, categoryId, amountMin, amountMax, dateFrom, dateTo, isAuto, enabled } = filters

  return useQuery({
    queryKey: ['transactions', 'search', term, type, categoryId, amountMin, amountMax, dateFrom, dateTo, isAuto],
    queryFn: async () => {
      let query = db
        .from('transactions')
        .select('*, categories(name, color)')
        .order('date', { ascending: false })
        .limit(100)

      if (term) {
        query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
      }
      if (type) {
        query = query.eq('type', type)
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }
      if (amountMin) {
        query = query.gte('amount', parseFloat(amountMin))
      }
      if (amountMax) {
        query = query.lte('amount', parseFloat(amountMax))
      }
      if (dateFrom) {
        query = query.gte('date', dateFrom)
      }
      if (dateTo) {
        query = query.lte('date', dateTo)
      }
      if (isAuto) {
        query = query.eq('is_auto', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: enabled !== false,
  })
}
