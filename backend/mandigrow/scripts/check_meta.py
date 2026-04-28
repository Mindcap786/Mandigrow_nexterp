import frappe
def execute():
    meta = frappe.get_meta("Journal Entry")
    field = meta.get_field("clearance_date")
    print(field.fieldname, field.fieldtype, field.read_only, field.hidden, field.set_only_once)
