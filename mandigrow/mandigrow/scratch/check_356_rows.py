import frappe
def run():
    je_name = "ACC-JV-2026-00356"
    rows = frappe.get_all("Journal Entry Account", filters={"parent": je_name}, fields=["reference_type", "reference_name"])
    print(f"Rows for {je_name}:")
    for r in rows:
        print(r)
run()
