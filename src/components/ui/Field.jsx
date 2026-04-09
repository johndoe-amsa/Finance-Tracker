export default function Field({
  label,
  id,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  inCard = false,
  disabled = false,
  ...rest
}) {
  const inputBg = inCard ? 'bg-bg dark:bg-[#000000]' : 'bg-bg-secondary dark:bg-[#0A0A0A]'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...rest}
        className={[
          'h-10 px-3 rounded-md text-small text-text font-sans border transition-all duration-150',
          inputBg,
          error
            ? 'border-error ring-[3px] ring-error/10'
            : 'border-border focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
          'dark:text-[#EDEDED] dark:border-[#333333]',
        ].join(' ')}
      />
      {error && <p className="text-[12px] text-error">{error}</p>}
    </div>
  )
}
