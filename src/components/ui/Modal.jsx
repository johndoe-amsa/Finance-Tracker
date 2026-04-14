import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// Must be >= the longest close animation duration in index.css (.modal-content[data-state="closed"]).
// Mobile sheet close = 400ms, desktop close = 160ms → prendre le max + marge confortable.
const CLOSE_DURATION = 460

// Counter-based scroll lock: only unlock when no modals are mounted.
// A simple save/restore would break when modals open/close in overlapping order
// (e.g. category modal starts closing while expense modal is already opening —
// the closing one restores overflow:'', leaving the still-open modal unsuppressed,
// and the expense modal later "restores" overflow:'hidden' permanently).
let _openModalsCount = 0

export default function Modal({ open, onClose, title, children }) {
  const [render, setRender] = useState(open)
  const [closing, setClosing] = useState(false)
  const cachedChildren = useRef(children)
  const cachedTitle = useRef(title)
  const firstFocusRef = useRef(null)

  // Cache children/title while the modal is open so they remain visible
  // during the exit animation, even if the parent clears them (a common
  // React pattern: `{editItem && <Form .../>}`).
  if (open) {
    cachedChildren.current = children
    cachedTitle.current = title
  }

  useEffect(() => {
    if (open) {
      setRender(true)
      setClosing(false)
      return
    }
    if (!render) return
    setClosing(true)
    const t = setTimeout(() => {
      setRender(false)
      setClosing(false)
    }, CLOSE_DURATION)
    return () => clearTimeout(t)
  }, [open, render])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    firstFocusRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll while the modal is mounted.
  useEffect(() => {
    if (!render) return
    _openModalsCount++
    document.body.style.overflow = 'hidden'
    return () => {
      _openModalsCount--
      if (_openModalsCount === 0) document.body.style.overflow = ''
    }
  }, [render])

  if (!render) return null

  const state = closing ? 'closed' : 'open'

  return (
    <div
      data-state={state}
      className="modal-backdrop fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        data-state={state}
        className="modal-content w-full max-w-lg bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-t-2xl sm:rounded-xl shadow-2 p-6 pb-10 sm:pb-6 max-h-[85vh] min-h-[50vh] sm:min-h-0 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Drag handle — mobile uniquement */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-border/70 dark:bg-white/20 mx-auto mb-5 -mt-1" />
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-h3 text-text dark:text-[#EDEDED]">
            {cachedTitle.current}
          </h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md p-1"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {cachedChildren.current}
      </div>
    </div>
  )
}
