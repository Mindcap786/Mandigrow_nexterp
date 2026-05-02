"""
PHASE 2 REPAIR: Fix remaining 6 arrivals with missing Supplier Group
Uses the first available supplier group in the system instead of hardcoded name.
"""
import frappe
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))
from mandigrow.logic.automation import post_arrival_ledger


def _ensure_supplier_v2(party_id, company):
    """Create Supplier using whatever group exists in this company."""
    contact = frappe.get_doc("Mandi Contact", party_id)
    supplier_name = contact.full_name

    # Check if exists
    existing = frappe.db.get_value("Supplier", {"supplier_name": supplier_name}, "name")
    if existing:
        return existing

    # Find any available supplier group
    groups = frappe.get_all("Supplier Group", fields=["name"], limit=5)
    print(f"    Available supplier groups: {[g.name for g in groups]}")
    
    if not groups:
        # Create the default group
        sg = frappe.get_doc({"doctype": "Supplier Group", "supplier_group_name": "Farmers"})
        sg.insert(ignore_permissions=True)
        group_name = "Farmers"
    else:
        group_name = groups[0].name

    supplier = frappe.get_doc({
        "doctype": "Supplier",
        "supplier_name": supplier_name,
        "supplier_group": group_name,
        "supplier_type": "Individual",
    })
    supplier.insert(ignore_permissions=True)
    print(f"    Created Supplier: {supplier.name} (group: {group_name})")
    return supplier.name


def run():
    print("=" * 60)
    print("PHASE 2: Fix remaining 6 zero-GL arrivals")
    print("=" * 60)

    # These 6 failed
    failed_arrivals = [
        "ARR-ORG00002-2026-00022",  # Bill#11 Avocado/shauddin
        "ARR-ORG00002-2026-00021",  # Bill#10
        "ARR-ORG00002-2026-00019",  # Bill#9
        "ARR-ORG00002-2026-00016",  # Bill#8
        "ARR-ORG00002-2026-00014",  # Bill#7
        "ARR-ORG00002-2026-00012",  # Bill#6
    ]

    company = frappe.db.get_value("Mandi Organization", "ORG-00002", "erp_company")
    print(f"\nCompany: {company}")

    for arr_name in failed_arrivals:
        arr = frappe.get_doc("Mandi Arrival", arr_name)
        print(f"\n  POSTING {arr_name} (Bill#{arr.contact_bill_no} | type:{arr.arrival_type} | net_pay:{arr.net_payable_farmer})")

        try:
            if arr.party_id:
                _ensure_supplier_v2(arr.party_id, company)
            
            post_arrival_ledger(arr)
            frappe.db.commit()

            gl_count = frappe.db.count("GL Entry", {"against_voucher": arr_name})
            print(f"    SUCCESS — {gl_count} GL entries created")
        except Exception as e:
            print(f"    ERROR: {e}")
            frappe.db.rollback()

    # Also fix Bill#11 missing payment JE for ARR-...00011 (Lychee/shauddin)
    # Currently only has 3 GL rows (Goods JE only, payment JE was deleted)
    lychee = "ARR-ORG00002-2026-00011"
    lychee_gl = frappe.db.count("GL Entry", {"against_voucher": lychee})
    print(f"\n  Lychee (Bill#5) GL count: {lychee_gl}")
    if lychee_gl <= 3:
        print("  Lychee is missing payment JE — re-posting...")
        try:
            doc = frappe.get_doc("Mandi Arrival", lychee)
            if doc.party_id:
                _ensure_supplier_v2(doc.party_id, company)
            post_arrival_ledger(doc)
            frappe.db.commit()
            new_count = frappe.db.count("GL Entry", {"against_voucher": lychee})
            print(f"    SUCCESS — now has {new_count} GL entries")
        except Exception as e:
            print(f"    ERROR: {e}")
            frappe.db.rollback()

    # Final verification
    print(f"\n{'='*60}")
    print("FINAL VERIFICATION")
    print(f"{'='*60}")
    all_arr = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "contact_bill_no"],
        order_by="creation desc", limit=15)
    
    all_good = True
    for a in all_arr:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": a.name})
        status = "✅" if gl_count > 0 else "❌"
        if gl_count == 0:
            all_good = False
        print(f"  {status} {a.name} (Bill#{a.contact_bill_no}): {gl_count} GL rows")
    
    print(f"\n{'ALL CLEAR' if all_good else 'STILL ISSUES — see ❌ above'}")
