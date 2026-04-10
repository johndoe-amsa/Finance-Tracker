export default function Badge({ variant = 'neutral', children }) {
  const variants = {
    neutral: 'bg-bg-tertiary text-text-muted dark:bg-[#111111] dark:text-[#888888]',
    success: 'bg-[rgba(22,163,74,0.1)] text-success',
    error:   'bg-[rgba(238,0,0,0.08)] text-error',
    warning: 'bg-[rgba(245,166,35,0.1)] text-warning',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-label font-medium tracking-[0.02em] ${variants[variant]}`}>
      {children}
    </span>
  )
}
