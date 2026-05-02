import frappe
def run():
    meta = frappe.get_meta('Journal Entry Account')
    fields = [f.fieldname for f in meta.fields]
    print(f"Fields in Journal Entry Account: {fields}")
run()
