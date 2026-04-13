import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, BarChart2, RefreshCw, Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/verify', icon: CheckSquare, label: 'À vérifier' },
  { to: '/analytics', icon: BarChart2, label: 'Analytiques' },
  { to: '/subscriptions', icon: RefreshCw, label: 'Abonnements' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export default function BottomNav() {
  const unverifiedCount = useAppStore((s) => s.unverifiedCount)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-sticky border-t border-border dark:border-[#333333] font-sans md:hidden"
      style={{ background: 'var(--backdrop-bg)', backdropFilter: 'var(--backdrop)' }}
    >
      <div className="h-16 flex items-center justify-around">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          aria-label={item.label}
          className={({ isActive }) =>
            `flex items-center justify-center px-5 py-3 transition-colors duration-150 ${
              isActive
                ? 'text-text dark:text-[#EDEDED]'
                : 'text-text-muted dark:text-[#888888]'
            }`
          }
        >
          <div className="relative">
            <item.icon size={26} strokeWidth={1.5} />
            {item.to === '/verify' && unverifiedCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-error text-white text-label font-bold rounded-full px-1">
                {unverifiedCount}
              </span>
            )}
          </div>
        </NavLink>
      ))}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
