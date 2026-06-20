/**
 * translations/index.ts
 * Registry for all 8 language translation dictionaries.
 * Also provides name resolution for party names and item names.
 */

import { te } from './te';
import { hi } from './hi';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { bn } from './bn';
import { gu } from './gu';
import { ur } from './ur';
import type { LangCode } from '../utils/fonts';
import { isLatinOnly } from '../utils/detect-script';

export type TranslationKeys = typeof te;

const TRANSLATIONS: Record<string, Partial<TranslationKeys>> = { te, hi, ta, kn, ml, bn, gu, ur };

/**
 * Get the full translation dictionary for a language.
 * Falls back to Telugu if lang is unknown (should not happen in practice).
 */
export function getTranslation(lang: string): Partial<TranslationKeys> {
  return TRANSLATIONS[lang] ?? te;
}

/**
 * Get a single translated label.
 * @param key - one of the TranslationKeys keys
 * @param lang - target language code
 */
export function t(key: keyof TranslationKeys, lang: string): string {
  return TRANSLATIONS[lang]?.[key] ?? key;
}

/**
 * Resolve a party/contact name to its local language equivalent.
 * Priority order:
 * 1. Contact has local_name field set (user-entered, clean)
 * 2. translatedNames map (fetched from backend translate_invoice_names API at print time)
 * 3. Name already in local script (non-Latin chars) → use as-is
 * 4. Fallback: English name
 */
export function getPartyName(
  englishName: string,
  localName: string | undefined | null,
  translatedName: string | undefined | null,
): string {
  // 1. Manual local_name (user-entered, highest trust)
  if (localName && localName.trim()) return localName.trim();
  // 2. API-translated name (in-memory, at print time)
  if (translatedName && translatedName.trim()) return translatedName.trim();
  // 3. Already in local script
  if (englishName && !isLatinOnly(englishName)) return englishName;
  // 4. English fallback
  return englishName || '';
}

/**
 * Resolve an item/commodity name to its local language equivalent.
 * Priority order:
 * 1. translatedNames map (from translate_invoice_names API or commodity dict)
 * 2. Already in local script
 * 3. English fallback
 */
export function getItemName(
  englishName: string,
  translatedName: string | undefined | null,
  allTranslations?: Record<string, string>
): string {
  if (translatedName && translatedName.trim()) return translatedName.trim();
  
  if (englishName && allTranslations && englishName.includes(' - ')) {
    const [base, ...rest] = englishName.split(' - ');
    const translatedBase = allTranslations[base.trim()];
    if (translatedBase) {
      return `${translatedBase} - ${rest.join(' - ')}`;
    }
  }

  if (englishName && !isLatinOnly(englishName)) return englishName;
  return englishName || '';
}
