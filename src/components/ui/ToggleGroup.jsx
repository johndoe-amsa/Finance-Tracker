export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div role="group" className="inline-flex items-center gap-1 p-1 bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={[
            'h-9 px-4 text-caption font-medium rounded-md transition-all duration-150 whitespace-nowrap cursor-pointer',
            value === opt.value
              ? 'text-text dark:text-dark-text bg-bg dark:bg-dark-bg shadow-1'
              : 'text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
