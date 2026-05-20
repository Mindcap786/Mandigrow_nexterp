import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Directly import the perfectly maintained JSON translation files to bundle them synchronously
import enCommon from '../../public/locales/en/common.json';
import hiCommon from '../../public/locales/hi/common.json';
import teCommon from '../../public/locales/te/common.json';
import taCommon from '../../public/locales/ta/common.json';
import knCommon from '../../public/locales/kn/common.json';
import mlCommon from '../../public/locales/ml/common.json';
import urCommon from '../../public/locales/ur/common.json';

import enGlossary from '../../public/locales/en/glossary.json';
import hiGlossary from '../../public/locales/hi/glossary.json';
import teGlossary from '../../public/locales/te/glossary.json';
import taGlossary from '../../public/locales/ta/glossary.json';
import knGlossary from '../../public/locales/kn/glossary.json';
import mlGlossary from '../../public/locales/ml/glossary.json';
import urGlossary from '../../public/locales/ur/glossary.json';

const resources = {
  en: { common: enCommon, glossary: enGlossary },
  hi: { common: hiCommon, glossary: hiGlossary },
  te: { common: teCommon, glossary: teGlossary },
  ta: { common: taCommon, glossary: taGlossary },
  kn: { common: knCommon, glossary: knGlossary },
  ml: { common: mlCommon, glossary: mlGlossary },
  ur: { common: urCommon, glossary: urGlossary },
};

i18n
  .use(LanguageDetector) // Persist and detect in localStorage
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'ur'],
    ns: ['common', 'glossary'],
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
