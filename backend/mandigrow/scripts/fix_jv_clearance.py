import frappe
def execute():
    # Fix the specific JV mentioned by the user
    name = "ACC-JV-2026-00140"
    if frappe.db.exists("Journal Entry", name):
        frappe.db.set_value("Journal Entry", name, "clearance_date", "2026-04-27")
        frappe.db.commit()
        print(f"Successfully fixed {name}")
    else:
        print(f"{name} not found")
