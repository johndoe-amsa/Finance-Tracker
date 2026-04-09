import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, RefreshCw, Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/verify', icon: CheckSquare, label: 'À vérifier' },
  { to: '/subscriptions', icon: RefreshCw, label: 'Abonnements' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export default function BottomNav() {
  const unverifiedCount = useAppStore((s) => s.unverifiedCount)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-sticky h-16 flex items-center justify-around border-t border-border dark:border-[#333333] font-sans"
      style={{ background: 'var(--backdrop-bg)', backdropFilter: 'var(--backdrop)' }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-150 ${
              isActive
                ? 'text-text dark:text-[#EDEDED]'
                : 'text-text-muted dark:text-[#888888]'
            }`
          }
        >
          <div className="relative">
            <item.icon size={20} strokeWidth={1.5} />
            {item.to === '/verify' && unverifiedCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full px-1">
                {unverifiedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
