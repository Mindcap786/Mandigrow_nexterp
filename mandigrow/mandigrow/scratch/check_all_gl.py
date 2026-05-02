import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00076"
    entries = frappe.db.sql("""
        SELECT name, account, party, debit, credit, against_voucher, against_voucher_type, voucher_no, voucher_type, is_cancelled
        FROM `tabGL Entry`
        WHERE against_voucher = %s
    """, (sale_name,), as_dict=True)
    
    print(f"ALL GL Entries for {sale_name}:")
    for e in entries:
        print(f"[{e.voucher_no}] {e.account}: Dr={e.debit}, Cr={e.credit}, is_cancelled={e.is_cancelled}")
        
    print("\nALL JEs:")
    jes = frappe.db.sql("""
        SELECT parent, docstatus, account, debit, credit
        FROM `tabJournal Entry Account`
        WHERE reference_name = %s
    """, (sale_name,), as_dict=True)
    for je in jes:
        print(f"JE: {je.parent}, docstatus={je.docstatus}, account={je.account}, Dr={je.debit}, Cr={je.credit}")
