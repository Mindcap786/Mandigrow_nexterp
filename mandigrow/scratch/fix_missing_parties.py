"""
Script to create missing customers and suppliers for existing contacts.
This fixes P0 item #3 and #4.
"""
import frappe

def _ensure_supplier(party_id, company=None):
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
        print(f"Created Supplier: {contact}")
    except Exception as e:
        print(f"Supplier warning for {contact}: {e}")

def _ensure_customer(buyer_id, company=None):
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
        print(f"Created Customer: {contact}")
    except Exception as e:
        print(f"Customer warning for {contact}: {e}")

def run():
    print("=" * 60)
    print("FIXING MISSING SUPPLIERS & CUSTOMERS")
    print("=" * 60)
    
    # 1. Fix Suppliers
    print("\nChecking Suppliers...")
    contacts = frappe.get_all("Mandi Contact", fields=["name", "full_name"])
    for c in contacts:
        _ensure_supplier(c.name)
        
    # 2. Fix Customers (from Sales)
    print("\nChecking Customers...")
    sale_buyers = frappe.db.sql("""
        SELECT DISTINCT buyerid
        FROM `tabMandi Sale`
        WHERE buyerid IS NOT NULL AND buyerid != ''
    """, as_dict=True)
    
    for b in sale_buyers:
        _ensure_customer(b.buyerid)
        
    print("\nDone.")
