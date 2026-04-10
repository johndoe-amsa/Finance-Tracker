import { useEffect } from 'react'
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const ICONS = {
  neutral: <Info size={16} strokeWidth={1.5} className="text-text-muted" />,
  success: <CheckCircle size={16} strokeWidth={1.5} className="text-success" />,
  error:   <AlertCircle size={16} strokeWidth={1.5} className="text-error" />,
  warning: <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />,
}

export default function Toast({ message, type = 'neutral', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="flex items-center gap-3 bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 px-4 py-3 text-small font-sans min-w-[280px] max-w-xs"
      style={{ animation: 'enter 300ms var(--ease-out)' }}
      role="alert"
    >
      <span className="shrink-0">{ICONS[type] || ICONS.neutral}</span>
      <p className="text-text dark:text-[#EDEDED] flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 shrink-0"
        aria-label="Fermer"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
