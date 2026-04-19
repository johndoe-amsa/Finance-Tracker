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
  // Holds the pending op so a second call can flush it to the DB before
  // starting its own 5-second window (otherwise the first verify would be
  // silently dropped when its timer is cleared).
  const pendingRef = useRef(null)

  const undoableVerify = useCallback(
    (transaction) => {
      if (!transaction?.id) return
      if (transaction.is_verified) return // already verified, no-op

      // Flush any previous pending verify immediately so it is not lost
      if (pendingRef.current) {
        pendingRef.current.flush()
      }

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

      let settled = false
      let timer = null

      const commit = async () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (pendingRef.current?.id === transaction.id) pendingRef.current = null
        try {
          const { error } = await db
            .from('transactions')
            .update({ is_verified: true })
            .eq('id', transaction.id)
          if (error) throw error
          // Skip the refetch if another undoable op has since taken over:
          // the server doesn't know about the newer optimistic update yet,
          // so refetching would resurrect the next row in the UI until its
          // own timer finally commits. The next op's own commit will
          // invalidate at the end of the chain.
          if (!pendingRef.current) {
            qc.invalidateQueries({ queryKey: ['transactions'] })
            qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
          }
        } catch (err) {
          for (const snap of snapshots) {
            if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
          }
          qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
          show(`Erreur : ${err.message}`, 'error')
        }
      }

      const undo = () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (pendingRef.current?.id === transaction.id) pendingRef.current = null
        for (const snap of snapshots) {
          if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
        }
        qc.invalidateQueries({ queryKey: ['unverifiedCount'] })
      }

      show('Transaction vérifiée', 'success', undo, 'Annuler')

      timer = setTimeout(commit, 5000)
      pendingRef.current = { id: transaction.id, flush: commit }
    },
    [qc, show],
  )

  return undoableVerify
}
