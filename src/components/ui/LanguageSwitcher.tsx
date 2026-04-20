import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const toggle = () => {
    i18n.changeLanguage(isAr ? 'fr' : 'ar')
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200',
        'bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors',
        'min-w-[64px] justify-center shadow-sm',
        className
      )}
      title={isAr ? 'Passer en français' : 'التبديل إلى العربية'}
    >
      {isAr ? (
        <>
          <span>🇫🇷</span>
          <span>FR</span>
        </>
      ) : (
        <>
          <span>🇲🇦</span>
          <span>ع</span>
        </>
      )}
    </button>
  )
}
