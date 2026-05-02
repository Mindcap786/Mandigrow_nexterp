import frappe
def run():
    types = frappe.db.sql("SELECT DISTINCT contact_type FROM `tabMandi Contact`", as_dict=True)
    print(f"Contact types: {types}")
run()
