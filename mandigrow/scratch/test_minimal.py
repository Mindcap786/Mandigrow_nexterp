import frappe
from frappe.utils import flt

def run():
    """Minimal test: create a Mandi Sale doc with amountreceived=500 and check it sticks."""
    
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)[0].name
    org = frappe.get_all("Mandi Organization", limit=1)[0].name
    
    # Step 1: Create doc with explicit amountreceived
    doc = frappe.get_doc({
        "doctype": "Mandi Sale",
        "buyerid": buyer,
        "organization_id": org,
        "saledate": "2026-04-30",
        "paymentmode": "cash",
        "totalamount": 1000,
        "amountreceived": 500,
        "items": [{
            "item_id": "S-apple",
            "lot_id": "",
            "qty": 10,
            "rate": 100,
            "amount": 1000
        }]
    })
    
    print(f"BEFORE insert: amountreceived = {doc.amountreceived}")
    
    doc.insert(ignore_permissions=True)
    print(f"AFTER insert:  amountreceived = {doc.amountreceived}")
    print(f"AFTER insert:  invoice_total  = {doc.invoice_total}")
    print(f"AFTER insert:  status         = {doc.status}")
    
    # Re-fetch from DB
    doc2 = frappe.get_doc("Mandi Sale", doc.name)
    print(f"FROM DB:       amountreceived = {doc2.amountreceived}")
    print(f"FROM DB:       status         = {doc2.status}")
    
    # Clean up
    frappe.delete_doc("Mandi Sale", doc.name, force=True, ignore_permissions=True)
    frappe.db.commit()
    print(f"\nCleaned up {doc.name}")
