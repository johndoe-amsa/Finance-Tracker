import { Plus } from 'lucide-react'

export default function FAB({ onClick }) {
  const handleClick = () => {
    navigator.vibrate?.(8)
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      className="fixed inset-x-0 mx-auto z-sticky w-14 h-14 rounded-full bg-accent text-accent-text dark:bg-[#EDEDED] dark:text-[#000000] shadow-1 flex items-center justify-center hover:opacity-85 press-feedback cursor-pointer md:hidden"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Ajouter une transaction"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
