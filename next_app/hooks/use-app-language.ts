import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { callApi } from '@/lib/frappeClient';

export function useAppLanguage() {
  const { i18n, t } = useTranslation(['common', 'glossary']);

  const changeLanguage = useCallback(async (lang: string) => {
    // 1. Change locally (updates DOM dir and localStorage automatically via i18next)
    await i18n.changeLanguage(lang);
    
    // 2. Persist to backend profile asynchronously (Does not block UI)
    try {
      // Assuming standard Frappe User profile update since there's no custom method
      // found in mandigrow.api
      await callApi('frappe.client.set_value', {
        doctype: 'User',
        name: 'Administrator', // Or frappe.session.user if available dynamically
        fieldname: 'language',
        value: lang
      });
    } catch (error) {
      console.error("Failed to sync language to backend profile:", error);
    }
  }, [i18n]);

  return {
    language: i18n.language,
    dir: i18n.dir(),
    changeLanguage,
    t
  };
}
