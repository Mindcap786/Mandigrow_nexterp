import frappe
def execute():
    for dt in frappe.get_all('DocType', pluck='name'):
        if 'field' in dt.lower() or 'config' in dt.lower():
            print(dt)
