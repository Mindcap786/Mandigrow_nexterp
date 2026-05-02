import frappe
from mandigrow.logic.automation import post_sale_ledger

def fix():
    frappe.connect()
    try:
        doc = frappe.get_doc("Mandi Sale", "SALE-ORG00002-2026-00028")
        # Simulate what the API should have done
        doc.amountreceived = 195.0
        doc.flags.cheque_status = True
        doc.save()
        doc.submit()
        print(f"Status after fix: {doc.status}")
    finally:
        frappe.destroy()

if __name__ == "__main__":
    fix()
