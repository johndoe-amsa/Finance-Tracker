import { useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

export default function useUndoableDelete() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)
  const timerRef = useRef(null)

  const undoableDelete = useCallback(
    (transaction) => {
      // Cancel any pending previous undo timer
      if (timerRef.current) clearTimeout(timerRef.current)

      // Snapshot all query caches that include transactions
      const queryCache = qc.getQueryCache()
      const txQueries = queryCache.findAll({ queryKey: ['transactions'] })
      const snapshots = txQueries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      // Optimistically remove from all transaction caches
      for (const snap of snapshots) {
        if (!Array.isArray(snap.data)) continue
        qc.setQueryData(snap.queryKey, snap.data.filter((t) => t.id !== transaction.id))
      }

      // Also update unverified count if applicable
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })

      let cancelled = false

      const undo = () => {
        cancelled = true
        clearTimeout(timerRef.current)
        // Restore all caches
        for (const snap of snapshots) {
          if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
        }
        qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      }

      // Show undo toast
      show('Transaction supprimee', 'success', undo, 'Annuler')

      // Schedule the real delete
      timerRef.current = setTimeout(async () => {
        if (cancelled) return
        try {
          const { error } = await db.from('transactions').delete().eq('id', transaction.id)
          if (error) throw error
          // Invalidate to ensure consistency
          qc.invalidateQueries({ queryKey: ['transactions'] })
          qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
        } catch (err) {
          // Restore on failure
          for (const snap of snapshots) {
            if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
          }
          show(`Erreur : ${err.message}`, 'error')
        }
      }, 5000)
    },
    [qc, show],
  )

  return undoableDelete
}
