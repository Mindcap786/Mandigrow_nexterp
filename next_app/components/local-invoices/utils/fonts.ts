/**
 * fonts.ts
 * Noto font URLs for each supported Indian language.
 * Noto fonts are designed to display all Unicode characters correctly — 
 * essential for rendering Indian scripts in printed invoices.
 */

export type LangCode = 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'bn' | 'gu' | 'ur';

export const LANG_LABELS: Record<LangCode, string> = {
  te: 'తెలుగు',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  ur: 'اردو',
};

export const LANG_NAMES_ENGLISH: Record<LangCode, string> = {
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  gu: 'Gujarati',
  ur: 'Urdu',
};

/** Google Fonts URL for each language's Noto font */
export const FONT_URLS: Record<LangCode, string> = {
  te: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Telugu:wght@400;700;900&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700;900&display=swap',
  ta: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;700;900&display=swap',
  kn: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Kannada:wght@400;700;900&display=swap',
  ml: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Malayalam:wght@400;700;900&display=swap',
  bn: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700;900&display=swap',
  gu: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;700;900&display=swap',
  ur: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
};

/** CSS font-family string for each language */
export const FONT_FAMILIES: Record<LangCode, string> = {
  te: "'Noto Serif Telugu', serif",
  hi: "'Noto Serif Devanagari', serif",
  ta: "'Noto Serif Tamil', serif",
  kn: "'Noto Serif Kannada', serif",
  ml: "'Noto Serif Malayalam', serif",
  bn: "'Noto Serif Bengali', serif",
  gu: "'Noto Serif Gujarati', serif",
  ur: "'Noto Nastaliq Urdu', serif",
};

/** Text direction — only Urdu uses RTL */
export const TEXT_DIRECTION: Record<LangCode, 'ltr' | 'rtl'> = {
  te: 'ltr', hi: 'ltr', ta: 'ltr', kn: 'ltr',
  ml: 'ltr', bn: 'ltr', gu: 'ltr',
  ur: 'rtl',
};

/** Returns whether a lang code is valid */
export function isValidLang(lang: string): lang is LangCode {
  return ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'gu', 'ur'].includes(lang);
}
