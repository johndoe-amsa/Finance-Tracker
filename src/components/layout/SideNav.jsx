import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, BarChart2, RefreshCw, Settings, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/verify', icon: CheckSquare, label: 'À vérifier' },
  { to: '/analytics', icon: BarChart2, label: 'Analytiques' },
  { to: '/subscriptions', icon: RefreshCw, label: 'Abonnements' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export default function SideNav({ onAddTransaction }) {
  const unverifiedCount = useAppStore((s) => s.unverifiedCount)

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 border-r border-border dark:border-[#3f3f46] bg-bg dark:bg-[#18181b] z-sticky">
      <div className="px-5 h-16 flex items-center border-b border-border dark:border-[#3f3f46]">
        <span className="text-[15px] font-semibold text-text dark:text-[#EDEDED] tracking-tight">Finance Tracker</span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-bg-secondary dark:bg-[#27272a] text-text dark:text-[#EDEDED]'
                  : 'text-text-muted dark:text-[#a1a1aa] hover:bg-bg-secondary dark:hover:bg-[#1f1f23] hover:text-text dark:hover:text-[#EDEDED]'
              }`
            }
          >
            <div className="relative flex-shrink-0">
              <item.icon size={18} strokeWidth={1.5} />
              {item.to === '/verify' && unverifiedCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full px-1">
                  {unverifiedCount}
                </span>
              )}
            </div>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={onAddTransaction}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-text dark:bg-[#EDEDED] dark:text-[#000000] text-[14px] font-medium hover:opacity-85 transition-opacity duration-150 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2} />
          Ajouter
        </button>
      </div>
    </aside>
  )
}
