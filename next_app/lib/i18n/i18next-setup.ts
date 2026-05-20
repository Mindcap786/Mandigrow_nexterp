import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from '@/components/i18n/translations';

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

// Utility to deeply merge objects (used to merge the 3 tiers of translations)
function deepMerge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (target === undefined) target = {};
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Map the legacy fallback logic: translations.en -> translations[lang] -> JSON[lang]
const resources = {
  en: { common: deepMerge({}, translations.en, enCommon), glossary: enGlossary },
  hi: { common: deepMerge({}, translations.en, translations.hi, hiCommon), glossary: hiGlossary },
  te: { common: deepMerge({}, translations.en, translations.te, teCommon), glossary: teGlossary },
  ta: { common: deepMerge({}, translations.en, translations.ta, taCommon), glossary: taGlossary },
  kn: { common: deepMerge({}, translations.en, translations.kn, knCommon), glossary: knGlossary },
  ml: { common: deepMerge({}, translations.en, (translations as any).ml || {}, mlCommon), glossary: mlGlossary },
  ur: { common: deepMerge({}, translations.en, (translations as any).ur || {}, urCommon), glossary: urGlossary },
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
