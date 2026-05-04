import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function TopBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍌</span>
        <span className="font-bold text-gray-900">{t('app.name')}</span>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => navigate('/parametres')}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          title={t('nav.parametres')}
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  )
}
