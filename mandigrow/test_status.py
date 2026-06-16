import frappe
def run():
    print(frappe.db.sql("SELECT status, count(*) FROM `tabMandi Contact` GROUP BY status", as_dict=True))
