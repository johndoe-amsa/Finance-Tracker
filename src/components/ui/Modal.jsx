import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  const firstFocusRef = useRef(null)
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else if (visible) {
      setClosing(true)
      const t = setTimeout(() => { setVisible(false); setClosing(false) }, 290)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    firstFocusRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ opacity: closing ? 0 : 1, transition: 'opacity 300ms var(--ease-out)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-t-lg sm:rounded-lg shadow-2 p-6 max-h-[85vh] overflow-y-auto"
        style={{ animation: closing ? 'modal-out 300ms var(--ease-out) forwards' : 'modal-in 300ms var(--ease-out)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-h3 text-text dark:text-[#EDEDED]">{title}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 rounded-md p-1"
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
