export default function Button({
  variant = 'primary',
  size = 'default',
  disabled,
  children,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full font-medium font-sans cursor-pointer ' +
    'transition-all duration-150 focus-visible:outline-2 focus-visible:outline-border-focus ' +
    'focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variants = {
    primary:     'bg-accent text-accent-text hover:opacity-85 active:scale-[0.97] dark:bg-[#EDEDED] dark:text-[#000000]',
    secondary:   'bg-transparent text-text border border-border hover:opacity-85 active:scale-[0.97]',
    ghost:       'bg-transparent text-text-muted hover:text-text active:scale-[0.97]',
    destructive: 'bg-error text-white hover:opacity-85 active:scale-[0.97]',
  }

  const sizes = {
    sm:      'h-8 px-3 text-[13px]',
    default: 'h-10 px-4 text-small',
    lg:      'h-12 px-6 text-body',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
