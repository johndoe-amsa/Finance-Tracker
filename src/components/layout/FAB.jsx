import { Plus } from 'lucide-react'

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 z-sticky w-14 h-14 rounded-full bg-accent text-accent-text dark:bg-[#EDEDED] dark:text-[#000000] shadow-2 flex items-center justify-center hover:opacity-85 active:scale-[0.95] transition-all duration-150 cursor-pointer"
      aria-label="Ajouter une transaction"
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  )
}
