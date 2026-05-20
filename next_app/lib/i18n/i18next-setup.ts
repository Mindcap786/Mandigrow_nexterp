import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from '@/components/i18n/translations';

// Map the legacy translations.ts deeply nested objects directly into the 'common' namespace
const resources = {
  en: { common: translations.en },
  hi: { common: translations.hi },
  te: { common: translations.te },
  ta: { common: translations.ta },
  kn: { common: translations.kn },
  // ML and UR will gracefully fallback to English if not present in translations.ts yet
  ml: { common: (translations as any).ml || translations.en },
  ur: { common: (translations as any).ur || translations.en },
};

i18n
  .use(LanguageDetector) // Persist and detect in localStorage
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'ur'],
    ns: ['common'], // Everything from translations.ts is dumped into 'common'
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevents SSR/SSG hangs
    }
  });

// Automatically handle RTL changes on the document root
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    // Hardcode 'ur' as RTL since i18n.dir() relies on internal map that might need customization
    const isRtl = lng === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }
});

export default i18n;
