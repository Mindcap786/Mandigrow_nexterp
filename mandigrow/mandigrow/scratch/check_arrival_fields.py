import frappe
def run():
    meta = frappe.get_meta("Mandi Arrival")
    f = meta.get_field("storage_location")
    print(f"Field: {f.fieldname}, Type: {f.fieldtype}, Options: {f.options}")
run()
