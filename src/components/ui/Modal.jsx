import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  const firstFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    firstFocusRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-t-lg sm:rounded-lg shadow-2 p-6 max-h-[85vh] overflow-y-auto"
        style={{ animation: 'modal-in 300ms var(--ease-out)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-h3 text-text dark:text-[#EDEDED]">{title}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors duration-150 rounded-md p-1"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
