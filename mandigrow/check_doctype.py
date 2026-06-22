import frappe
def execute():
    exists = frappe.db.exists('DocType', 'Mandi Translation Cache')
    print("Exists:", exists)
