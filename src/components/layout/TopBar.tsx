import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function TopBar() {
  const { t } = useTranslation()
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍌</span>
        <span className="font-bold text-gray-900">{t('app.name')}</span>
      </div>
      <LanguageSwitcher />
    </header>
  )
}
