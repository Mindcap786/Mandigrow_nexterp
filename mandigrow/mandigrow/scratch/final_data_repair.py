"""
Final data repair: re-post all arrivals/sales with 0 GL entries
"""
import frappe
import sys, os
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))
from mandigrow.mandigrow.logic.automation import post_arrival_ledger, post_sale_ledger
from mandigrow.api import repair_tenant


def _ensure_supplier(party_id, company):
    contact = frappe.db.get_value("Mandi Contact", party_id, "full_name")
    if not contact:
        return
    if frappe.db.get_value("Supplier", {"supplier_name": contact}, "name"):
        return
    groups = frappe.get_all("Supplier Group", fields=["name"], limit=1)
    group = groups[0].name if groups else "All Supplier Groups"
    try:
        s = frappe.get_doc({"doctype": "Supplier", "supplier_name": contact,
                            "supplier_group": group, "supplier_type": "Individual"})
        s.insert(ignore_permissions=True)
        frappe.db.commit()
    except Exception as e:
        print(f"    Supplier warning: {e}")


def _ensure_customer(buyer_id, company):
    contact = frappe.db.get_value("Mandi Contact", buyer_id, "full_name")
    if not contact:
        return
    if frappe.db.get_value("Customer", {"customer_name": contact}, "name"):
        return
    groups = frappe.get_all("Customer Group", fields=["name"], limit=1)
    group = groups[0].name if groups else "All Customer Groups"
    try:
        c = frappe.get_doc({"doctype": "Customer", "customer_name": contact,
                            "customer_group": group, "customer_type": "Individual"})
        c.insert(ignore_permissions=True)
        frappe.db.commit()
    except Exception as e:
        print(f"    Customer warning: {e}")


def run():
    print("=" * 60)
    print("FINAL DATA REPAIR — ALL ORGS")
    print("=" * 60)

    orgs = frappe.get_all("Mandi Organization", fields=["name", "organization_name"])

    for org in orgs:
        oid = org.name
        print(f"\n--- {org.organization_name} ({oid}) ---")

        # Arrivals
        arrivals = frappe.get_all("Mandi Arrival",
            filters={"organization_id": oid},
            fields=["name", "contact_bill_no", "party_id"])
        for a in arrivals:
            gl = frappe.db.count("GL Entry", {"against_voucher": a.name})
            if gl > 0:
                continue
            print(f"  Posting arrival {a.name} (Bill#{a.contact_bill_no})")
            if a.party_id:
                _ensure_supplier(a.party_id, None)
            try:
                doc = frappe.get_doc("Mandi Arrival", a.name)
                post_arrival_ledger(doc)
                frappe.db.commit()
                new = frappe.db.count("GL Entry", {"against_voucher": a.name})
                print(f"    OK — {new} GL entries")
            except Exception as e:
                print(f"    ERROR: {e}")
                frappe.db.rollback()

        # Sales
        sales = frappe.get_all("Mandi Sale",
            filters={"organization_id": oid},
            fields=["name", "buyerid"])
        for s in sales:
            gl = frappe.db.count("GL Entry", {"against_voucher": s.name})
            if gl > 0:
                continue
            print(f"  Posting sale {s.name}")
            if s.buyerid:
                _ensure_customer(s.buyerid, None)
            try:
                doc = frappe.get_doc("Mandi Sale", s.name)
                post_sale_ledger(doc)
                frappe.db.commit()
                new = frappe.db.count("GL Entry", {"against_voucher": s.name})
                print(f"    OK — {new} GL entries")
            except Exception as e:
                print(f"    ERROR: {e}")
                frappe.db.rollback()

    # Final summary
    print(f"\n{'='*60}")
    print("FINAL STATUS")
    print(f"{'='*60}")
    for org in orgs:
        oid = org.name
        arr_total = frappe.db.count("Mandi Arrival", {"organization_id": oid})
        arr_zero = sum(1 for a in frappe.get_all("Mandi Arrival", {"organization_id": oid}, ["name"])
                       if frappe.db.count("GL Entry", {"against_voucher": a.name}) == 0)
        sal_total = frappe.db.count("Mandi Sale", {"organization_id": oid})
        sal_zero = sum(1 for s in frappe.get_all("Mandi Sale", {"organization_id": oid}, ["name"])
                       if frappe.db.count("GL Entry", {"against_voucher": s.name}) == 0)
        arr_ok = "✅" if arr_zero == 0 else "❌"
        sal_ok = "✅" if sal_zero == 0 else "❌"
        print(f"  {org.organization_name}: {arr_ok} Arrivals ({arr_zero}/{arr_total} missing) | "
              f"{sal_ok} Sales ({sal_zero}/{sal_total} missing)")
