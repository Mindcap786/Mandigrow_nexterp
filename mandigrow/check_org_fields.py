import frappe
import json
def execute():
    fields = [f.fieldname for f in frappe.get_meta('Mandi Organization').fields]
    print(json.dumps(fields, indent=2))
