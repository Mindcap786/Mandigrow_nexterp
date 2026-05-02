import frappe
def run():
    meta = frappe.get_meta("Mandi Sale Item")
    fields = [f.fieldname for f in meta.fields]
    print(f"Mandi Sale Item fields: {fields}")
run()
