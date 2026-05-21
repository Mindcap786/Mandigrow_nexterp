import frappe

def run():
    je = frappe.get_doc("Journal Entry", "ACC-JV-2026-00321")
    print(f"remark: {je.user_remark}")
    for a in je.accounts:
        print(f"account: {a.account}, dr: {a.debit_in_account_currency}, cr: {a.credit_in_account_currency}, party: {a.party}")
