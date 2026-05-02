import frappe
def run():
    meta = frappe.get_meta("Mandi Arrival")
    fields = [f.fieldname for f in meta.fields]
    print(f"Mandi Arrival fields: {fields}")
run()
