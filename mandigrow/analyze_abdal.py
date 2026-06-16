import frappe
import sys

def analyze():
    frappe.init(site="mandigrow.com")
    frappe.connect()

    buyers = frappe.db.get_list('Mandi Contact', filters={'full_name': ['like', '%abdal%'], 'contact_type': 'buyer'}, fields=['name', 'full_name', 'organization_id'])

    for b in buyers:
        print(f"\nAnalyzing buyer: {b.full_name} ({b.name}) in ORG {b.organization_id}")
        
        org_id = b.organization_id
        company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
        contact_id = b.name
        
        sales = frappe.db.sql("""
            SELECT name, IFNULL(invoice_total,0) as invoice_total, amountreceived, status
            FROM `tabMandi Sale`
            WHERE organization_id = %s AND buyerid = %s AND docstatus = 1
            ORDER BY saledate ASC, creation ASC
        """, (org_id, contact_id), as_dict=True)
        
        unlinked_pool = frappe.db.sql("""
            SELECT SUM(gl.credit - gl.debit) FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.company = %s
            AND gl.party = %s AND (gl.against_voucher IS NULL OR gl.against_voucher = '')
            AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
        """, (company, contact_id))[0][0] or 0
        
        print("Sales total:", sum([s.invoice_total for s in sales]))
        print("Unlinked pool:", unlinked_pool)
        
        gl = frappe.db.sql("""
            SELECT name, posting_date, voucher_type, voucher_no, debit, credit, against_voucher, remarks
            FROM `tabGL Entry`
            WHERE party = %s AND is_cancelled = 0
            ORDER BY posting_date ASC, creation ASC
        """, (contact_id,), as_dict=True)
        
        print("--- GL ENTRIES ---")
        for g in gl:
            print(f"GL: {g.posting_date} | Dr {g.debit} | Cr {g.credit} | agst: {g.against_voucher}")

        print("--- SALES ---")
        for s in sales:
            print(f"Sale: {s.name} | Total: {s.invoice_total} | Received: {s.amountreceived} | Status: {s.status}")

if __name__ == "__main__":
    analyze()
