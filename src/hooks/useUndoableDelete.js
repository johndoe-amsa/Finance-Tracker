import { useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { db } from '../lib/supabase'
import { useToastStore } from '../store/useToastStore'

export default function useUndoableDelete() {
  const qc = useQueryClient()
  const show = useToastStore((s) => s.show)
  // Holds the pending op so a second call can flush it to the DB before
  // starting its own 5-second window (otherwise the first delete would be
  // silently dropped when its timer is cleared).
  const pendingRef = useRef(null)

  const undoableDelete = useCallback(
    (transaction) => {
      // Flush any previous pending delete immediately so it is not lost
      if (pendingRef.current) {
        pendingRef.current.flush()
      }

      // Snapshot all query caches that include transactions
      const queryCache = qc.getQueryCache()
      const txQueries = queryCache.findAll({ queryKey: ['transactions'] })
      const snapshots = txQueries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      // Optimistically remove from all transaction caches. The badge count
      // is derived from the ['transactions', 'unverified'] cache entry, so
      // this update also decrements it in place without an extra refetch.
      for (const snap of snapshots) {
        if (!Array.isArray(snap.data)) continue
        qc.setQueryData(snap.queryKey, snap.data.filter((t) => t.id !== transaction.id))
      }

      let settled = false
      let timer = null

      const commit = async () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (pendingRef.current?.id === transaction.id) pendingRef.current = null
        try {
          const { error } = await db.from('transactions').delete().eq('id', transaction.id)
          if (error) throw error
          // Skip the refetch if another undoable op has since taken over:
          // the server doesn't know about the newer optimistic update yet,
          // so refetching would resurrect the next row in the UI until its
          // own timer finally commits. The next op's own commit will
          // invalidate at the end of the chain.
          if (!pendingRef.current) {
            qc.invalidateQueries({ queryKey: ['transactions'] })
          }
        } catch (err) {
          for (const snap of snapshots) {
            if (snap.data) qc.setQueryData(snap.queryKey, snap.data)
          }
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
      }

      show('Transaction supprimee', 'success', undo, 'Annuler')

      timer = setTimeout(commit, 5000)
      pendingRef.current = { id: transaction.id, flush: commit }
    },
    [qc, show],
  )

  return undoableDelete
}
