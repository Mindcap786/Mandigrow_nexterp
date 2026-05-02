import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00076"
    jes = frappe.db.sql("""
        SELECT parent, docstatus, account, debit, credit
        FROM `tabJournal Entry Account`
        WHERE against_voucher = %s
    """, (sale_name,), as_dict=True)
    
    print(f"JEs for {sale_name} (against_voucher):")
    for je in jes:
        print(f"JE: {je.parent}, docstatus={je.docstatus}, account={je.account}, Dr={je.debit}, Cr={je.credit}")
