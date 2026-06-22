import frappe
def execute():
    module = frappe.db.get_value('DocType', 'Mandi Translation Cache', 'module')
    print("Module is:", module)
