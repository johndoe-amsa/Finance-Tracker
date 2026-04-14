export function Card({ children, clickable = false, className = '' }) {
  return (
    <div
      className={[
        'bg-bg-secondary border border-border rounded-lg p-6 shadow-none',
        'transition-all duration-200',
        'dark:bg-[#1f1f23] dark:border-[#52525b]',
        clickable ? 'hover:shadow-1 hover:border-border-strong cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardLabel({ children }) {
  return (
    <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-2">
      {children}
    </p>
  )
}

export function CardTitle({ children }) {
  return (
    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-text dark:text-[#EDEDED] mb-2">
      {children}
    </h3>
  )
}

export function CardBody({ children }) {
  return (
    <p className="text-small text-text-muted dark:text-[#a1a1aa] leading-[1.5]">
      {children}
    </p>
  )
}
