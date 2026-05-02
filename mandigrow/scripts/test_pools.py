import frappe
from mandigrow.api import _get_ledger_summary

def run():
    frappe.session.user = "Administrator"
    import mandigrow.api
    mandigrow.api._get_user_org = lambda: "ORG-00002"
    mandigrow.api._get_user_company = lambda: "ssb"

    print("Checking bills for Raju on Apr 29...")
    bills = frappe.get_all("Mandi Sale", 
        filters={"buyerid": "6blb4b0b5r", "saledate": "2026-04-29", "docstatus": 1},
        fields=["name", "totalamount", "creation"],
        order_by="creation asc"
    )
    for b in bills:
        res = _get_ledger_summary("Mandi Sale", b.name, b.totalamount)
        print(f"[{b.creation}] {b.name} (Amt: {b.totalamount}): {res['status']} (Paid: {res['paid']})")

    # Let's see the prior_billings calculation for the first bill
    first_bill = bills[0]
    
    party_ref = "Raju (ORG-00002)"
    company = "ssb"
    
    target_gl = frappe.db.get_value("GL Entry", 
        {"voucher_type": "Mandi Sale", "voucher_no": first_bill.name, "party": party_ref, "is_cancelled": 0},
        ["name", "debit", "credit", "posting_date", "creation"],
        as_dict=True
    )
    
    prior_res = frappe.db.sql(f"""
        SELECT COALESCE(SUM(gl.debit), 0) as prior_billings
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE gl.is_cancelled = 0
          AND gl.party = %s
          AND gl.company = %s
          AND (
            (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NOT NULL AND (
                je.clearance_date < %s OR (je.clearance_date = %s AND gl.creation < %s)
            ))
            OR
            ((je.cheque_no IS NULL OR je.cheque_no = '') AND (
                gl.posting_date < %s OR (gl.posting_date = %s AND gl.creation < %s)
            ))
          )
    """, (party_ref, company, 
          target_gl.posting_date, target_gl.posting_date, target_gl.creation,
          target_gl.posting_date, target_gl.posting_date, target_gl.creation), as_dict=True)
          
    print(f"First bill prior_billings: {prior_res[0].prior_billings}")
    print(f"First bill receipts_pool: 63200.0")
