"""
Repair Script: Fix Journal Entries with wrong cheque_no
========================================================
Run via: bench --site mandigrow.localhost console

Purpose:
- JEs created for UPI/Bank arrivals/sales had cheque_no = doc.name (the Arrival/Sale ID)
- This made the Day Book treat them as post-dated cheques (hidden until clearance_date)
- This script removes the incorrect cheque_no from those JEs and adds clearance_date 
  to instant-clear cheque JEs that are missing it.
"""
import frappe
from frappe.utils import today

# ── 1. Find all JEs where cheque_no looks like an Arrival or Sale ID ──────────
broken_jes = frappe.db.sql("""
    SELECT name, cheque_no, clearance_date, cheque_date, user_remark, voucher_type
    FROM `tabJournal Entry`
    WHERE docstatus = 1
      AND cheque_no IS NOT NULL AND cheque_no != ''
      AND (
          cheque_no LIKE 'ARR-%'
          OR cheque_no LIKE 'MAR-%'
          OR cheque_no LIKE 'MSL-%'
          OR cheque_no LIKE 'SALE-%'
      )
""", as_dict=True)

print(f"\n{'='*60}")
print(f"Found {len(broken_jes)} JEs with incorrect cheque_no (Arrival/Sale ID used as cheque_no)")
print('='*60)

fixed_count = 0
for je in broken_jes:
    print(f"\nJE: {je.name} | cheque_no={je.cheque_no} | cleared={je.clearance_date}")
    print(f"  Remark: {je.user_remark}")
    
    # Clear the incorrect cheque_no
    frappe.db.set_value("Journal Entry", je.name, {
        "cheque_no": None,
        "cheque_date": None
    }, update_modified=False)
    
    # Also clear from GL Entries (they don't store cheque_no directly, but good to verify)
    fixed_count += 1
    print(f"  ✅ Cleared cheque_no from JE {je.name}")

# ── 2. Find cheque JEs that should be cleared but are missing clearance_date ──
# These are cheques where clearance_date <= today() but clearance_date is NULL
cheque_jes = frappe.db.sql("""
    SELECT name, cheque_no, cheque_date, clearance_date, user_remark
    FROM `tabJournal Entry`
    WHERE docstatus = 1
      AND cheque_no IS NOT NULL AND cheque_no != ''
      AND cheque_date IS NOT NULL
      AND cheque_date <= CURDATE()
      AND clearance_date IS NULL
""", as_dict=True)

print(f"\n{'='*60}")
print(f"Found {len(cheque_jes)} Cheque JEs with cheque_date <= today but no clearance_date")
print('='*60)

for je in cheque_jes:
    print(f"\nJE: {je.name} | cheque_no={je.cheque_no} | cheque_date={je.cheque_date}")
    # NOTE: We do NOT auto-clear these — only the user knows if these cheques 
    # were actually cleared. We just report them.
    print(f"  ⚠️  Needs manual review: was this cheque actually cleared?")

frappe.db.commit()
print(f"\n{'='*60}")
print(f"✅ Fixed {fixed_count} JEs with incorrect cheque_no")
print(f"ℹ️  {len(cheque_jes)} cheque JEs need manual review for clearance_date")
print('='*60)
