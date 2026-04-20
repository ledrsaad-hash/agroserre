import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Warehouse, TrendingDown, ShoppingCart, BarChart3 } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/',         icon: LayoutDashboard, key: 'dashboard' },
  { to: '/serres',   icon: Warehouse,       key: 'serres' },
  { to: '/ventes',   icon: ShoppingCart,    key: 'ventes' },
  { to: '/depenses', icon: TrendingDown,    key: 'depenses' },
  { to: '/rapports', icon: BarChart3,       key: 'rapports' },
]

export function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 lg:hidden safe-bottom">
      <div className="flex items-stretch h-16">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn('p-1 rounded-xl transition-colors', isActive && 'bg-primary-50')}>
                  <Icon size={22} />
                </div>
                <span className="text-[10px]">{t(`nav.${key}`)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
