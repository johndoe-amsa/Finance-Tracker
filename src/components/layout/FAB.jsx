import { Plus } from 'lucide-react'

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-1/2 -translate-x-1/2 z-sticky w-14 h-14 rounded-full bg-accent text-accent-text dark:bg-[#EDEDED] dark:text-[#000000] shadow-1 flex items-center justify-center hover:opacity-85 active:scale-[0.95] transition-all duration-150 cursor-pointer md:hidden"
      style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Ajouter une transaction"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
