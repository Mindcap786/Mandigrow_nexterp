import frappe
def execute():
    for f in frappe.get_meta('Mandi Arrival').fields:
        print(f.fieldname)
