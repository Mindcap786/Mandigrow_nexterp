"""
Translator for local invoice printing.
Uses deep-translator (free, no API key) with Redis caching.
Results are NEVER stored in the DB - only in Redis with 30-day TTL.
"""

import re
import frappe

CACHE_PREFIX = "inv_tr"
CACHE_TTL = 2592000  # 30 days in seconds


def is_latin_only(text: str) -> bool:
    """True if text is ASCII/Latin only - meaning it needs translation."""
    if not text:
        return True
    return bool(re.match(r'^[\x00-\x7F\s]+$', text.strip()))


def _cache_key(lang: str, text: str) -> str:
    return f"{CACHE_PREFIX}:{lang}:{text.strip().lower()}"


def translate_batch(texts: list, target_lang: str, org_id: str = None) -> dict:
    """
    Translate a list of English texts to target_lang.
    Uses Redis cache first, falls back to deep-translator (free, no API key).
    Returns dict: { original_text: translated_text }
    """
    if not texts or not target_lang:
        return {}

    results = {}
    to_translate = []

    for text in texts:
        if not text:
            results[text] = text
            continue

        if not is_latin_only(text):
            results[text] = text  # Already in local script
            continue

        # Check Redis cache
        try:
            cached = frappe.cache.get_value(_cache_key(target_lang, text))
            if cached:
                results[text] = cached
                continue
        except Exception:
            pass

        to_translate.append(text)

    if not to_translate:
        return results

    # Batch translate with deep-translator (free, no API key needed)
    try:
        from deep_translator import GoogleTranslator

        # Map our lang codes to deep-translator codes
        lang_map = {
            "te": "te", "hi": "hi", "ta": "ta",
            "kn": "kn", "ml": "ml", "bn": "bn",
            "gu": "gu", "ur": "ur"
        }
        dt_lang = lang_map.get(target_lang, target_lang)

        if len(to_translate) == 1:
            translated_list = [
                GoogleTranslator(source="en", target=dt_lang).translate(to_translate[0])
            ]
        else:
            translated_list = GoogleTranslator(
                source="en", target=dt_lang
            ).translate_batch(to_translate)

        for original, translated in zip(to_translate, translated_list):
            if translated:
                # Cache the result for 30 days
                try:
                    frappe.cache.set_value(
                        _cache_key(target_lang, original),
                        translated,
                        expires_in_sec=CACHE_TTL
                    )
                except Exception:
                    pass
                results[original] = translated
            else:
                results[original] = original  # Fallback: English

    except Exception as e:
        frappe.log_error(
            f"deep-translator error for lang={target_lang}: {str(e)}",
            "Local Invoice Translate"
        )
        # Graceful fallback: return originals
        for text in to_translate:
            results[text] = text

    return results
