export default function SelectField({
  label,
  id,
  value,
  onChange,
  children,
  inCard = false,
  disabled = false,
}) {
  const inputBg = inCard ? 'bg-bg dark:bg-[#000000]' : 'bg-bg-secondary dark:bg-[#0A0A0A]'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'h-10 px-3 rounded-md text-small text-text font-sans border transition-all duration-150',
          inputBg,
          'border-border focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'dark:text-[#EDEDED] dark:border-[#333333]',
          'appearance-none cursor-pointer',
        ].join(' ')}
      >
        {children}
      </select>
    </div>
  )
}
