import frappe

def run():
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    
    party = "Raju (ORG-00002)"
    company = "MandiGrow Enterprise"
    
    print("--- FIFO Trace for Raju ---")
    
    # Get all GL entries for Raju
    gl_entries = frappe.db.sql("""
        SELECT name, posting_date, creation, debit, credit, voucher_type, voucher_no
        FROM `tabGL Entry`
        WHERE is_cancelled = 0 AND party = %s AND company = %s
        ORDER BY posting_date ASC, creation ASC
    """, (party, company), as_dict=True)
    
    total_debits = sum(e.debit for e in gl_entries)
    total_credits = sum(e.credit for e in gl_entries)
    print(f"Total Debits: {total_debits}, Total Credits: {total_credits}, Balance: {total_debits - total_credits}")
    
    receipts_pool = total_credits
    print(f"Initial Receipts Pool: {receipts_pool}")
    
    prior_billings = 0
    for e in gl_entries:
        if e.debit > 0:
            bill_amount = e.debit
            available = max(0, receipts_pool - prior_billings)
            paid = min(bill_amount, available)
            status = "paid" if paid >= (bill_amount - 0.1) else ("partial" if paid > 0.1 else "pending")
            
            print(f"[{e.posting_date}] {e.voucher_type} {e.voucher_no}: Bill={bill_amount}, Prior={prior_billings}, Available={available}, Paid={paid}, Status={status}")
            
            prior_billings += bill_amount

