export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div role="group" className="inline-flex items-center gap-1 p-1 bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={[
            'h-9 px-4 text-[13px] font-medium rounded-md transition-all duration-150 whitespace-nowrap cursor-pointer',
            value === opt.value
              ? 'text-text dark:text-[#EDEDED] bg-bg dark:bg-[#18181b] shadow-1'
              : 'text-text-muted dark:text-[#a1a1aa] hover:text-text dark:hover:text-[#EDEDED]',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
