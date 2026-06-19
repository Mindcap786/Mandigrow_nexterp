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
    Implements Phase 2 Scalable L10n:
      1. Tenant-level entity overrides (Mandi Contact, Mandi Item Override)
      2. Database Translation Memory (Mandi Translation Cache)
      3. Hardcoded commodity dict fallback
      4. Cloud Translation API fallback
    """
    import json

    if lang not in SUPPORTED_LANGS:
        return {"items": {}, "party": party_name}

    if isinstance(item_names, str):
        item_names = json.loads(item_names)

    user = frappe.session.user
    org_id = frappe.db.get_value("User", user, "mandi_organization")

    translated_items = {}
    api_fallback_needed = []

    # Process Items
    for name in item_names:
        if not name:
            continue
            
        # 1. Check Tenant-level Override
        item_code = frappe.db.get_value("Item", {"item_name": name}, "name") or name
        override = frappe.db.get_value("Mandi Item Override", {"item_code": item_code, "organization_id": org_id}, "local_name")
        if override:
            translated_items[name] = override
            continue
            
        # 2. Check Database Translation Cache
        cached = frappe.db.get_value("Mandi Translation Cache", {"source_text": name, "language": lang}, "translated_text")
        if cached:
            translated_items[name] = cached
            continue

        # 3. Check hardcoded dictionary
        local = dict_lookup(name, lang)
        if local:
            translated_items[name] = local
            continue
            
        # 4. Fallback condition
        if not is_latin_only(name):
            translated_items[name] = name  # Already in local script
        else:
            api_fallback_needed.append(name)  # Needs Cloud Translation

    # Batch translate items not in dictionary/cache
    if api_fallback_needed:
        batch_result = translate_batch(api_fallback_needed, lang, org_id)
        for src, translated in batch_result.items():
            if translated and translated != src:
                # Save to Translation Cache
                if not frappe.db.exists("Mandi Translation Cache", {"source_text": src, "language": lang}):
                    doc = frappe.new_doc("Mandi Translation Cache")
                    doc.source_text = src
                    doc.language = lang
                    doc.translated_text = translated
                    doc.insert(ignore_permissions=True)
            translated_items[src] = translated

    # Process Party Name
    translated_party = party_name
    if party_name:
        # 1. Check Tenant-level Override
        override = frappe.db.get_value("Mandi Contact", {"full_name": party_name, "organization_id": org_id}, "local_name")
        if override:
            translated_party = override
        else:
            # 2. Check Database Cache
            cached = frappe.db.get_value("Mandi Translation Cache", {"source_text": party_name, "language": lang}, "translated_text")
            if cached:
                translated_party = cached
            elif is_latin_only(party_name):
                # 3. Fallback to Cloud Translation API
                batch_party = translate_batch([party_name], lang, org_id)
                translated_party = batch_party.get(party_name, party_name)
                # Save to cache
                if translated_party and translated_party != party_name:
                    if not frappe.db.exists("Mandi Translation Cache", {"source_text": party_name, "language": lang}):
                        doc = frappe.new_doc("Mandi Translation Cache")
                        doc.source_text = party_name
                        doc.language = lang
                        doc.translated_text = translated_party
                        doc.insert(ignore_permissions=True)
            else:
                translated_party = party_name # Already in local script

    frappe.db.commit() # Commit all new cache entries

    return {
        "items": translated_items,
        "party": translated_party
    }
