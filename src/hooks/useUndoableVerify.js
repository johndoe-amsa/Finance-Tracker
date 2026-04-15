import { useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

/**
 * Verify a transaction (is_verified = true) with an optimistic cache update
 * and a 5-second "Annuler" toast that lets the user revert the operation
 * before it is persisted to the database.
 *
 * Accepts the full transaction object (not just the id) so we can both:
 *   - remove it immediately from the unverified queries, and
 *   - restore the original is_verified=false value if the user cancels.
 */
export default function useUndoableVerify() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)
  const timerRef = useRef(null)

  const undoableVerify = useCallback(
    (transaction) => {
      if (!transaction?.id) return
      if (transaction.is_verified) return // already verified, no-op

      // Cancel any previous pending undo timer
      if (timerRef.current) clearTimeout(timerRef.current)

      // Snapshot all transaction query caches so we can restore on undo
      const queryCache = qc.getQueryCache()
      const txQueries = queryCache.findAll({ queryKey: ['transactions'] })
      const snapshots = txQueries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      // Optimistically update caches:
      //   - drop the tx from ['transactions', 'unverified']
      //   - flip is_verified=true everywhere else so the "A verifier" badge
      //     disappears immediately from the dashboard too
      for (const snap of snapshots) {
        if (!Array.isArray(snap.data)) continue
        const isUnverifiedList =
          Array.isArray(snap.queryKey) && snap.queryKey[1] === 'unverified'
        const next = isUnverifiedList
          ? snap.data.filter((t) => t.id !== transaction.id)
          : snap.data.map((t) =>
              t.id === transaction.id ? { ...t, is_verified: true } : t,
            )
        qc.setQueryData(snap.queryKey, next)
      }

      // Also refresh the unverified count badge
      qc.invalidateQueries({ queryKey: ['unverifiedCount'] })

      let cancelled = false

      const undo = () => {
        cancelled = true
        clearTimeout(timerRef.current)
        // Restore every snapshot we touched
        for (const snap of snapshots) {
          if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
        }
        qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      }

      show('Transaction vérifiée', 'success', undo, 'Annuler')

      // Persist the change after the undo window has elapsed
      timerRef.current = setTimeout(async () => {
        if (cancelled) return
        try {
          const { error } = await db
            .from('transactions')
            .update({ is_verified: true })
            .eq('id', transaction.id)
          if (error) throw error
          qc.invalidateQueries({ queryKey: ['transactions'] })
          qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
        } catch (err) {
          // Restore on failure so the UI matches the DB
          for (const snap of snapshots) {
            if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
          }
          qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
          show(`Erreur : ${err.message}`, 'error')
        }
      }, 5000)
    },
    [qc, show],
  )

  return undoableVerify
}
