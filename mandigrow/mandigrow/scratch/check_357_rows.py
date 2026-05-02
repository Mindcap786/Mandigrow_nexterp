import frappe
def run():
    je_name = "ACC-JV-2026-00357"
    rows = frappe.get_all("Journal Entry Account", filters={"parent": je_name}, fields=["name", "account", "party", "party_type", "reference_type", "reference_name", "debit", "credit"])
    print(f"Rows for {je_name}:")
    for r in rows:
        print(r)
