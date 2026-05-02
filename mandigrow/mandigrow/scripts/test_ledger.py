import frappe
from mandigrow.mandigrow.api import get_ledger_statement

def run():
    frappe.session.user = "Administrator"
    
    # Bypass the organization check in get_ledger_statement by mocking _get_user_org
    import mandigrow.mandigrow.api
    mandigrow.api._get_user_org = lambda: "ORG-00002"
    mandigrow.api._get_user_company = lambda: "ssb"
    
    res = get_ledger_statement("6blb4b0b5r", "2026-04-01", "2026-04-29")
    print("Closing Balance:", res.get("closing_balance"))
    for t in res.get("transactions", [])[-5:]:
        print(f"[{t['date']}] {t['voucher_type']} {t['voucher_no']} | Dr: {t['debit']} | Cr: {t['credit']} | Bal: {t['running_balance']}")

