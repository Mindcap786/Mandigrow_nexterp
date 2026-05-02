import frappe
def run():
    sale_id = "SALE-ORG00002-2026-00083"
    d = frappe.get_doc("Mandi Sale", sale_id)
    print(f"Sale: {sale_id}")
    print(f"Status: {d.status}")
    print(f"Total: {d.invoice_total}")
    print(f"Received: {d.amountreceived}")
    print(f"Payment Mode: {d.paymentmode}")
    print(f"Cheque Date: {d.chequedate}")
    
    # Check JEs
    jes = frappe.get_all("Journal Entry Account", filters={"reference_name": sale_id}, fields=["parent"])
    print(f"Related JEs: {jes}")
    for je_name in [j.parent for j in jes]:
        je = frappe.get_doc("Journal Entry", je_name)
        print(f"  JE: {je_name}, Type: {je.voucher_type}, Date: {je.posting_date}, Clearance: {je.clearance_date}")

run()
