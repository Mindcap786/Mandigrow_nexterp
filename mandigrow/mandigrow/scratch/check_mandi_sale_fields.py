import frappe
def run():
    meta = frappe.get_meta("Mandi Sale")
    fields = [f.fieldname for f in meta.fields]
    print(f"Mandi Sale fields: {fields}")
run()
