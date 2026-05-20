import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { callApi } from '@/lib/frappeClient';

export function useAppLanguage() {
  const { i18n, t } = useTranslation(['common', 'glossary']);

  const changeLanguage = useCallback(async (lang: string) => {
    // 1. Change locally (updates DOM dir and localStorage automatically via i18next)
    await i18n.changeLanguage(lang);
  }, [i18n]);

  return {
    language: i18n.language,
    dir: i18n.dir(),
    changeLanguage,
    t
  };
}
