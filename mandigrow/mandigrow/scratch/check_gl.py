import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00076"
    print("Mandi Sale:")
    doc = frappe.get_doc("Mandi Sale", sale_name)
    print(f"Amount Received: {doc.amountreceived}")
    print(f"Status: {doc.status}")
    
    print("\nGL Entries for this sale:")
    entries = frappe.db.sql("""
        SELECT name, account, party, debit, credit, against_voucher, against_voucher_type, voucher_no, voucher_type
        FROM `tabGL Entry`
        WHERE is_cancelled = 0 AND against_voucher = %s
    """, (sale_name,), as_dict=True)
    
    for e in entries:
        print(f"[{e.voucher_no}] {e.account}: Dr={e.debit}, Cr={e.credit}, party={e.party}")
        
    print("\nChecking _get_ledger_summary:")
    from mandigrow.mandigrow.api import _get_ledger_summary
    from frappe.utils import today
    summary = _get_ledger_summary("Mandi Sale", sale_name, doc.invoice_total, as_of_date=today(), due_date=doc.duedate, party_id=doc.buyerid)
    print(summary)
