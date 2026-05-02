import frappe
def run():
    options = frappe.get_meta('Journal Entry Account').get_field('reference_type').options
    print(f"Options for reference_type: {options}")
run()
