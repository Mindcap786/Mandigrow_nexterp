"""
Local Invoice Backend API
Provides org-level language settings and in-memory translation for local invoice printing.
"""

import frappe
from mandigrow.local_invoices.commodity_dict import get_local_name as dict_lookup
from mandigrow.local_invoices.translator import translate_batch, is_latin_only

SUPPORTED_LANGS = {"te", "hi", "ta", "kn", "ml", "bn", "gu", "ur"}


@frappe.whitelist(allow_guest=False)
def get_org_invoice_language():
    """
    Returns the invoice_language set for the current user's organization.
    Returns None if not set (= English).
    """
    user = frappe.session.user
    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if not org_id:
        return None
    lang = frappe.db.get_value("Mandi Organization", org_id, "invoice_language")
    return lang if lang in SUPPORTED_LANGS else None


@frappe.whitelist(allow_guest=False)
def set_org_invoice_language(language):
    """
    Set the invoice_language for the current user's organization.
    Pass language='' or language=None to disable (revert to English).
    """
    user = frappe.session.user
    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if not org_id:
        frappe.throw("No organization found for current user")

    if language and language not in SUPPORTED_LANGS:
        frappe.throw(f"Unsupported language: {language}. Supported: {', '.join(SUPPORTED_LANGS)}")

    frappe.db.set_value("Mandi Organization", org_id, "invoice_language", language or "")
    frappe.db.commit()
    return {"success": True, "language": language or ""}


@frappe.whitelist(allow_guest=False)
def translate_invoice_names(item_names, party_name, lang):
    """
    Translate item names and a party name for local invoice printing.
    Called at print time. Results are NOT stored in DB.

    item_names: JSON list of English item name strings
    party_name: the English party/contact name
    lang: target language code (te, hi, ta, kn, ml, bn, gu, ur)

    Returns:
    {
        "items": {"Apple US": "ఆపిల్ US", "Dragon Fruit": "డ్రాగన్ ఫ్రూట్", ...},
        "party": "అబిద్"
    }
    """
    import json

    if lang not in SUPPORTED_LANGS:
        return {"items": {}, "party": party_name}

    # Parse item_names if it's a JSON string
    if isinstance(item_names, str):
        item_names = json.loads(item_names)

    user = frappe.session.user
    org_id = frappe.db.get_value("User", user, "mandi_organization")

    translated_items = {}
    api_fallback_needed = []

    # Step 1: Try commodity dictionary first (no API, instant)
    for name in item_names:
        if not name:
            continue
        local = dict_lookup(name, lang)
        if local:
            translated_items[name] = local
        elif not is_latin_only(name):
            translated_items[name] = name  # Already in local script
        else:
            api_fallback_needed.append(name)  # Needs Google Translate

    # Step 2: Batch translate items not in dictionary
    if api_fallback_needed:
        batch_result = translate_batch(api_fallback_needed, lang, org_id)
        translated_items.update(batch_result)

    # Step 3: Translate party name
    translated_party = party_name
    if party_name and is_latin_only(party_name):
        batch_party = translate_batch([party_name], lang, org_id)
        translated_party = batch_party.get(party_name, party_name)
    elif party_name and not is_latin_only(party_name):
        translated_party = party_name  # Already in local script

    return {
        "items": translated_items,
        "party": translated_party
    }
