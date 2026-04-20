import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './fr/translation.json'
import ar from './ar/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'agroserre_lang',
    },
    interpolation: { escapeValue: false },
  })

export const applyLangToDOM = (lang: string) => {
  const isAr = lang === 'ar'
  document.documentElement.lang = lang
  document.documentElement.dir = isAr ? 'rtl' : 'ltr'
}

applyLangToDOM(i18n.language)

i18n.on('languageChanged', applyLangToDOM)

export default i18n
