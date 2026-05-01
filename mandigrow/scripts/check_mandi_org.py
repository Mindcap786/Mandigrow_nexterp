import frappe
def execute():
    try:
        fields = frappe.get_meta('Mandi Organization').fields
        for k in fields:
            print(k.fieldname, k.fieldtype)
    except Exception as e:
        print("Error:", e)
