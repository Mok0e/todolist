import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

const browserLang = navigator.language.split('-')[0] ?? 'ko'
const defaultLang: string = ['ko', 'en'].includes(browserLang) ? browserLang : 'ko'

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: defaultLang,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
})

export default i18n
