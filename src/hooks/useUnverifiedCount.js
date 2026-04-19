import { useEffect } from 'react'
import { useUnverifiedTransactions } from './useTransactions'
import { useAppStore } from '../store/useAppStore'

// The badge count is derived from the same list query as the Verify page
// so the two can never drift out of sync and we avoid a second round-trip
// just to count rows.
export function useUnverifiedCount() {
  const setUnverifiedCount = useAppStore((s) => s.setUnverifiedCount)
  const { data } = useUnverifiedTransactions()

  useEffect(() => {
    if (data !== undefined) {
      setUnverifiedCount(data.length)
    }
  }, [data, setUnverifiedCount])
}
