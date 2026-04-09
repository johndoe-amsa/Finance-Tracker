export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'h-9 px-4 text-[13px] font-medium rounded-md transition-all duration-150 whitespace-nowrap cursor-pointer',
            value === opt.value
              ? 'text-text dark:text-[#EDEDED] bg-bg dark:bg-[#000000] shadow-1'
              : 'text-text-muted dark:text-[#888888] hover:text-text dark:hover:text-[#EDEDED]',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
