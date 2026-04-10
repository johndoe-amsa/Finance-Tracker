import { useEffect, useRef, useState } from 'react'
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const ICONS = {
  neutral: <Info size={16} strokeWidth={1.5} className="text-text-muted" />,
  success: <CheckCircle size={16} strokeWidth={1.5} className="text-success" />,
  error:   <AlertCircle size={16} strokeWidth={1.5} className="text-error" />,
  warning: <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />,
}

const SHOW_DURATION = 3000
// Must be >= the exit animation duration in index.css (.toast-item[data-state="closed"]).
const EXIT_DURATION = 240

export default function Toast({ message, type = 'neutral', onDismiss }) {
  const [open, setOpen] = useState(true)
  const exitTimerRef = useRef(null)
  const showTimerRef = useRef(null)

  const handleDismiss = () => {
    if (exitTimerRef.current) return
    setOpen(false)
    exitTimerRef.current = setTimeout(onDismiss, EXIT_DURATION)
  }

  useEffect(() => {
    showTimerRef.current = setTimeout(handleDismiss, SHOW_DURATION)
    return () => {
      clearTimeout(showTimerRef.current)
      clearTimeout(exitTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      data-state={open ? 'open' : 'closed'}
      className="toast-item flex items-center gap-3 bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 px-4 py-3 text-small font-sans min-w-[280px] max-w-xs"
      role="alert"
    >
      <span className="shrink-0">{ICONS[type] || ICONS.neutral}</span>
      <p className="text-text dark:text-[#EDEDED] flex-1">{message}</p>
      <button
        onClick={handleDismiss}
        className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 shrink-0"
        aria-label="Fermer"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
