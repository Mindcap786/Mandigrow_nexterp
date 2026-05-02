import frappe
def run():
    meta = frappe.get_meta("Mandi Arrival Item")
    fields = [f.fieldname for f in meta.fields]
    print(f"Mandi Arrival Item fields: {fields}")
run()
