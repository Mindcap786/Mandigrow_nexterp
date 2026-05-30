import frappe
def execute():
    frappe.init(site="mandigrow.com")
    frappe.connect()
    item_doc = frappe.get_doc("Item", "SM-passionfruit-6511")
    print("DISABLED:", item_doc.disabled)
