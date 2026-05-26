import frappe
from mandigrow.api import repair_single_party_settlement

def execute():
    # Find syed
    syed = frappe.db.sql("""SELECT name, organization_id, full_name, customer FROM `tabMandi Contact` WHERE full_name LIKE '%syed%' LIMIT 1""", as_dict=True)
    if not syed:
        print("Syed not found")
        return
    syed = syed[0]
    print(f"Testing for {syed.full_name} (Contact: {syed.name}, Customer: {syed.customer})")
    
    org_id = syed.organization_id
    company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
    
    party_list = [syed.name]
    if syed.customer: party_list.append(syed.customer)
    
    # 1. Check unlinked credits
    unlinked_credits = frappe.db.sql("""
        SELECT SUM(gl.credit - gl.debit) FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
        WHERE gl.is_cancelled = 0 AND gl.company = %s
        AND gl.party IN %s AND (gl.against_voucher IS NULL OR gl.against_voucher = '')
        AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
    """, (company, tuple(party_list)))[0][0] or 0
    print(f"Unlinked Credits: {unlinked_credits}")
    
    # 2. List Sales
    sales = frappe.db.sql("""
        SELECT name, IFNULL(invoice_total,0) as invoice_total, status, amountreceived
        FROM `tabMandi Sale`
        WHERE organization_id = %s AND buyerid = %s AND docstatus = 1
        ORDER BY saledate ASC, creation ASC
    """, (org_id, syed.name), as_dict=True)
    
    print(f"Total Sales: {len(sales)}")
    for s in sales:
        linked_paid = frappe.db.sql("""
            SELECT SUM(gl.credit) FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.party IN %s 
            AND gl.against_voucher = %s AND gl.credit > 0
            AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
        """, (tuple(party_list), s.name))[0][0] or 0
        print(f"Sale {s.name}: Total={s.invoice_total}, LinkedPaid={linked_paid}, CurrentStatus={s.status}, CurrentReceived={s.amountreceived}")

