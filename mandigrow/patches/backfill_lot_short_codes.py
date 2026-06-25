import frappe
import random

def execute():
    """
    Backfill short_code for old lots:
    1. If lot_code is a numeric string (old lots used lot_code as the 6-digit code), copy it to short_code
    2. For lots with no lot_code or non-numeric lot_code, generate a new unique 6-digit code
    """
    lots = frappe.db.sql("""
        SELECT name, lot_code, short_code
        FROM `tabMandi Lot`
        WHERE short_code IS NULL OR short_code = ''
    """, as_dict=True)

    updated = 0
    generated = 0
    for lot in lots:
        # Case 1: lot_code is a pure numeric string (5-8 digits) — use it as short_code
        lc = (lot.lot_code or '').strip()
        if lc and lc.isdigit() and 5 <= len(lc) <= 8:
            frappe.db.set_value('Mandi Lot', lot.name, 'short_code', lc, update_modified=False)
            updated += 1
        else:
            # Case 2: generate a unique 6-digit short_code
            for _ in range(20):
                candidate = str(random.randint(100000, 999999))
                exists = frappe.db.exists('Mandi Lot', {'short_code': candidate})
                if not exists:
                    frappe.db.set_value('Mandi Lot', lot.name, 'short_code', candidate, update_modified=False)
                    generated += 1
                    break

    frappe.db.commit()
    print(f"Short code backfill complete: {updated} copied from lot_code, {generated} newly generated.")
