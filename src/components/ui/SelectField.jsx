import { ChevronDown } from 'lucide-react'

export default function SelectField({
  label,
  id,
  value,
  onChange,
  children,
  error,
  inCard = false,
  disabled = false,
}) {
  const inputBg = inCard ? 'bg-bg dark:bg-dark-bg' : 'bg-bg-secondary dark:bg-dark-bg-secondary'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted dark:text-dark-text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[
            'w-full h-10 pl-3 pr-9 rounded-md text-small text-text font-sans border transition-all duration-150',
            inputBg,
            error
              ? 'border-error ring-[3px] ring-error/10'
              : 'border-border dark:border-dark-border focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:text-dark-text',
            'appearance-none cursor-pointer',
          ].join(' ')}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-dark-text-muted pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-[12px] text-error">{error}</p>}
    </div>
  )
}
