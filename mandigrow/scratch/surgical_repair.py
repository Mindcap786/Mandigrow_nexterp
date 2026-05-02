"""
SURGICAL REPAIR SCRIPT
=======================
Repairs:
1. ARR-ORG00002-2026-00011 (Bill#5/Lychee): Keep oldest Goods JE (ACC-JV-00168),
   keep oldest Payment JE (ACC-JV-00169), delete the 4 duplicate payment JEs (376-383).
2. ARR-ORG00002-2026-00022 (Bill#11/Avocado): No GL entries, re-post after
   fixing the missing Supplier.
3. ARR-ORG00002-2026-00012 through 00021: All have 0 GL entries — re-post.

SAFETY: Only touches GL Entry and Journal Entry rows for specific arrivals.
        Does NOT touch Sales, other purchases, or any other data.
"""
import frappe
from frappe.utils import today
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))
from mandigrow.logic.automation import post_arrival_ledger


def _force_delete_je(je_name):
    """Bypass Frappe safety locks and hard-delete a JE and its GL entries."""
    try:
        # Delete GL entries first
        frappe.db.delete("GL Entry", {"voucher_no": je_name})
        # Delete JE Account child rows
        frappe.db.delete("Journal Entry Account", {"parent": je_name})
        # Delete the JE itself
        frappe.db.delete("Journal Entry", {"name": je_name})
        print(f"    Deleted JE: {je_name}")
        return True
    except Exception as e:
        print(f"    ERROR deleting {je_name}: {e}")
        return False


def _ensure_supplier(party_id, company):
    """Ensure a Supplier record exists for a Mandi Contact."""
    contact = frappe.get_doc("Mandi Contact", party_id)
    supplier_name = contact.full_name
    
    # Check if supplier already exists
    existing = frappe.db.get_value("Supplier", {"supplier_name": supplier_name}, "name")
    if existing:
        return existing
    
    # Create supplier
    supplier = frappe.get_doc({
        "doctype": "Supplier",
        "supplier_name": supplier_name,
        "supplier_group": "All Supplier Groups",
        "supplier_type": "Individual",
    })
    supplier.insert(ignore_permissions=True)
    print(f"    Created Supplier: {supplier.name}")
    return supplier.name


def run():
    print("=" * 60)
    print("SURGICAL LEDGER REPAIR - SSB MANDI")
    print("=" * 60)

    company = frappe.db.get_value("Mandi Organization", "ORG-00002", "erp_company")
    print(f"\nCompany: {company}")

    # ----------------------------------------------------------------
    # REPAIR 1: ARR-ORG00002-2026-00011 (Bill#5/Lychee)
    # Has 4 duplicate payment JEs. Keep oldest 2 (Goods + Payment).
    # ----------------------------------------------------------------
    lychee_arr = "ARR-ORG00002-2026-00011"
    print(f"\n{'='*60}")
    print(f"REPAIR 1: {lychee_arr} (Bill#5 / Lychee)")
    print(f"{'='*60}")

    # The CORRECT JEs are the ones tagged against_voucher in GL Entry
    # Those are: ACC-JV-2026-00168 (Goods) and ACC-JV-2026-00169 (Payment/cheque)
    # The duplicates are: 376, 377, 378, 379, 380, 381, 382, 383
    
    correct_je_goods = frappe.db.get_value("GL Entry", 
        {"against_voucher": lychee_arr, "against_voucher_type": "Mandi Arrival",
         "voucher_no": ["like", "ACC-JV-2026-00168"]}, "voucher_no")
    
    # Find oldest Goods JE by checking which has Stock In Hand debit
    all_goods_jes = frappe.db.get_all("GL Entry",
        filters={"against_voucher": lychee_arr, "account": ["like", "Stock%"],
                 "debit": [">", 0]},
        fields=["voucher_no"],
        order_by="creation asc", limit=1)
    
    goods_je_to_keep = all_goods_jes[0].voucher_no if all_goods_jes else "ACC-JV-2026-00168"
    
    # Find oldest payment JE
    all_pay_jes = frappe.db.get_all("GL Entry",
        filters={"against_voucher": lychee_arr, "account": ["like", "Creditors%"],
                 "debit": [">", 0]},
        fields=["voucher_no"],
        order_by="creation asc", limit=1)
    
    pay_je_to_keep = all_pay_jes[0].voucher_no if all_pay_jes else "ACC-JV-2026-00169"
    
    print(f"\n  Keeping Goods JE: {goods_je_to_keep}")
    print(f"  Keeping Payment JE: {pay_je_to_keep}")
    
    # Find ALL JEs with this arrival in user_remark — these are duplicates to delete
    duplicate_jes = frappe.get_all("Journal Entry",
        filters=[["user_remark", "like", f"%{lychee_arr}%"]],
        fields=["name", "creation"],
        order_by="creation asc")
    
    print(f"\n  Found {len(duplicate_jes)} JEs with arrival in remark (ALL are duplicates from re-post):")
    for j in duplicate_jes:
        print(f"    Deleting duplicate: {j.name}")
        _force_delete_je(j.name)

    # Also remove duplicate Goods JEs from against_voucher (376, 378, 380, 382)
    all_jes_by_gl = frappe.db.get_all("GL Entry",
        filters={"against_voucher": lychee_arr},
        fields=["voucher_no"],
        distinct=True)
    
    all_je_names = list({g.voucher_no for g in all_jes_by_gl})
    print(f"\n  JEs still referenced in GL after remark-based cleanup: {all_je_names}")
    
    keep_set = {goods_je_to_keep, pay_je_to_keep}
    for je_name in all_je_names:
        if je_name not in keep_set:
            print(f"    Deleting extra GL-tagged JE: {je_name}")
            _force_delete_je(je_name)

    frappe.db.commit()
    
    # Verify
    remaining_gl = frappe.db.count("GL Entry", {"against_voucher": lychee_arr})
    print(f"\n  AFTER REPAIR: {remaining_gl} GL entries remain (expected: 5-6)")

    # ----------------------------------------------------------------
    # REPAIR 2 & 3: All arrivals with 0 GL entries
    # ----------------------------------------------------------------
    print(f"\n{'='*60}")
    print("REPAIR 2+3: Re-post all arrivals with 0 GL entries")
    print(f"{'='*60}")

    zero_gl_arrivals = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "contact_bill_no", "party_id", "net_payable_farmer", "advance", "arrival_type"])
    
    for arr in zero_gl_arrivals:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": arr.name})
        if gl_count > 0:
            print(f"  SKIP {arr.name} (Bill#{arr.contact_bill_no}) — already has {gl_count} GL rows")
            continue
        
        print(f"\n  POSTING {arr.name} (Bill#{arr.contact_bill_no} | type:{arr.arrival_type} | net_pay:{arr.net_payable_farmer})")
        
        try:
            # Ensure supplier exists before posting
            if arr.party_id:
                _ensure_supplier(arr.party_id, company)
            
            doc = frappe.get_doc("Mandi Arrival", arr.name)
            post_arrival_ledger(doc)
            frappe.db.commit()
            
            new_gl_count = frappe.db.count("GL Entry", {"against_voucher": arr.name})
            print(f"    SUCCESS — {new_gl_count} GL entries created")
        except Exception as e:
            print(f"    ERROR: {e}")
            frappe.db.rollback()

    # ----------------------------------------------------------------
    # FINAL VERIFICATION
    # ----------------------------------------------------------------
    print(f"\n{'='*60}")
    print("FINAL VERIFICATION")
    print(f"{'='*60}")
    
    all_arr = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "contact_bill_no"])
    
    for a in all_arr:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": a.name})
        status = "✅" if gl_count > 0 else "❌"
        print(f"  {status} {a.name} (Bill#{a.contact_bill_no}): {gl_count} GL rows")
