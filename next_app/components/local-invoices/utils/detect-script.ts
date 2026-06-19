/**
 * detect-script.ts
 * Detects whether a string is purely Latin/ASCII or already in a local script.
 * Used to skip translation for names/items already entered in Telugu, Hindi, etc.
 */

/**
 * Returns true if text contains ONLY ASCII/Latin characters (A-Z, a-z, digits, punctuation).
 * Returns false if any non-Latin Unicode character is present (Devanagari, Telugu, Arabic, etc.)
 */
export function isLatinOnly(text: string): boolean {
  if (!text || text.trim() === '') return true;
  // Match any character outside Basic Latin (U+0000–U+007F)
  return !/[^\u0000-\u007F]/.test(text);
}

/**
 * Returns true if text appears to already be in a local/regional script.
 * Opposite of isLatinOnly.
 */
export function isLocalScript(text: string): boolean {
  return !isLatinOnly(text);
}
