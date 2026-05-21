import frappe
def run():
    jes = frappe.get_all("Journal Entry", filters={"voucher_type": "Opening Entry"}, fields=["name", "user_remark"])
    for je in jes[:5]:
        doc = frappe.get_doc("Journal Entry", je.name)
        print(f"\n{je.name} - {je.user_remark}")
        for a in doc.accounts:
            print(f"  {a.account}: dr {a.debit_in_account_currency}, cr {a.credit_in_account_currency}")

def run2():
    doc = frappe.get_doc("Journal Entry", "ACC-JV-2026-00319")
    print(f"\n{doc.name} - {doc.user_remark}")
    for a in doc.accounts:
        print(f"  {a.account}: dr {a.debit_in_account_currency}, cr {a.credit_in_account_currency}")

run2()
