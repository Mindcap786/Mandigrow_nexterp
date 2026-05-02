import frappe
def run():
    doc = frappe.get_doc("Mandi Sale", "SALE-ORG00002-2026-00076")
    print(f"Name: {doc.name}")
    print(f"Amount Received: {doc.amountreceived}")
    print(f"Payment Mode: {doc.paymentmode}")
    print(f"Total Amount: {doc.totalamount}")
    print(f"Invoice Total: {doc.invoice_total}")
    print(f"Status: {doc.status}")
    print(f"Flags: {doc.flags}")
    
    entries = frappe.get_all("GL Entry", filters={"against_voucher": doc.name, "is_cancelled": 0}, fields=["name", "voucher_type", "voucher_no", "account", "debit", "credit"])
    print(f"GL Entries: {entries}")
