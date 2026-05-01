import frappe
def execute():
    try:
        fields = frappe.get_meta('Mandi Settings').fields
        for k in fields:
            print(k.fieldname, k.fieldtype)
    except Exception as e:
        print("Error:", e)
