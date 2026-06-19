'use client';
/**
 * use-local-invoice.ts
 * Hook that manages:
 * 1. Org-level default invoice language (from backend)
 * 2. Per-invoice language override (user selects at print time)
 * 3. Translation of item names and party names (in-memory, at print time)
 *
 * Design: Default = org language (if set). User can change per-invoice
 * using a dropdown on the invoice page before printing.
 */

import { useState, useEffect, useCallback } from 'react';
import { callApi } from '@/lib/frappeClient';
import type { LangCode } from '@/components/local-invoices/utils/fonts';
import { isValidLang } from '@/components/local-invoices/utils/fonts';

export interface LocalInvoiceState {
  /** Is the local_language_invoices feature flag enabled for this org? */
  isEnabled: boolean;
  /** Org-level default language (null = English) */
  orgLang: LangCode | null;
  /** Currently active language for THIS invoice (null = English) */
  activeLang: LangCode | null;
  /** Set per-invoice language override (null to revert to org default) */
  setActiveLang: (lang: LangCode | null) => void;
  /** Translated item names: { "Apple US": "ఆపిల్ US", ... } */
  itemTranslations: Record<string, string>;
  /** Translated party name */
  partyTranslation: string | null;
  /** True while translation API call is in progress */
  isTranslating: boolean;
  /** Trigger a translation fetch with the given item names and party name */
  fetchTranslations: (itemNames: string[], partyName: string) => Promise<void>;
}

export function useLocalInvoice(featureFlags: Record<string, boolean>): LocalInvoiceState {
  const [orgLang, setOrgLang] = useState<LangCode | null>(null);
  const [activeLang, setActiveLangState] = useState<LangCode | null>(null);
  const [itemTranslations, setItemTranslations] = useState<Record<string, string>>({});
  const [partyTranslation, setPartyTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<{
    lang: string; items: string[]; party: string;
  } | null>(null);

  const isEnabled = !!featureFlags?.local_language_invoices;

  // Fetch org-level default language on mount (if feature is enabled)
  useEffect(() => {
    if (!isEnabled) return;
    callApi('mandigrow.local_invoices.api.get_org_invoice_language')
      .then((lang: any) => {
        if (lang && isValidLang(lang)) {
          setOrgLang(lang as LangCode);
          setActiveLangState(lang as LangCode); // default active = org lang
        }
      })
      .catch(() => {}); // fail silently
  }, [isEnabled]);

  // Set per-invoice override (or null to revert to org default)
  const setActiveLang = useCallback((lang: LangCode | null) => {
    setActiveLangState(lang ?? orgLang);
    // Reset translations when language changes
    setItemTranslations({});
    setPartyTranslation(null);
    setTranslationCache(null);
  }, [orgLang]);

  // Fetch translations for this invoice from the backend
  const fetchTranslations = useCallback(async (itemNames: string[], partyName: string) => {
    if (!activeLang) return;

    // Cache check: skip if same lang + same items + same party
    const cacheKey = JSON.stringify({ lang: activeLang, items: itemNames.sort(), party: partyName });
    if (translationCache && JSON.stringify(translationCache) === cacheKey) return;

    setIsTranslating(true);
    try {
      const result: any = await callApi('mandigrow.local_invoices.api.translate_invoice_names', {
        item_names: JSON.stringify(itemNames),
        party_name: partyName,
        lang: activeLang,
      });
      if (result) {
        setItemTranslations(result.items || {});
        setPartyTranslation(result.party || null);
        setTranslationCache({ lang: activeLang, items: itemNames.sort(), party: partyName });
      }
    } catch {
      // Fail silently — English fallback is used in the component
    } finally {
      setIsTranslating(false);
    }
  }, [activeLang, translationCache]);

  return {
    isEnabled,
    orgLang,
    activeLang,
    setActiveLang,
    itemTranslations,
    partyTranslation,
    isTranslating,
    fetchTranslations,
  };
}
