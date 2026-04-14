export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <Icon size={24} className="text-text-subtle dark:text-[#71717a] mb-4" aria-hidden="true" strokeWidth={1.5} />
      )}
      <h3 className="text-[16px] font-semibold text-text dark:text-[#EDEDED] mb-2">{title}</h3>
      <p className="text-small text-text-muted dark:text-[#a1a1aa] max-w-xs mb-6">{description}</p>
      {action && action}
    </div>
  )
}
