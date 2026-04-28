import frappe
def execute():
    je = frappe.get_doc("Journal Entry", "ACC-JV-2026-00140")
    print(je.name, je.cheque_no, je.cheque_date, je.clearance_date)
