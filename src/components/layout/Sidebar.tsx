import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Warehouse, TrendingDown, Leaf,
  Zap, ShoppingCart, Store, BarChart3
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const navItems = [
  { to: '/',         icon: LayoutDashboard, key: 'dashboard' },
  { to: '/serres',   icon: Warehouse,       key: 'serres' },
  { to: '/depenses', icon: TrendingDown,    key: 'depenses' },
  { to: '/actions',  icon: Zap,             key: 'actions' },
  { to: '/intrants', icon: Leaf,            key: 'intrants' },
  { to: '/ventes',   icon: ShoppingCart,    key: 'ventes' },
  { to: '/marche',   icon: Store,           key: 'marche' },
  { to: '/rapports', icon: BarChart3,       key: 'rapports' },
]

export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-e border-gray-100 fixed inset-y-0 z-40">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <span className="text-3xl">🍌</span>
        <div>
          <p className="font-bold text-gray-900">{t('app.name')}</p>
          <p className="text-xs text-gray-400">{t('app.tagline')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={20} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <LanguageSwitcher className="w-full" />
      </div>
    </aside>
  )
}
