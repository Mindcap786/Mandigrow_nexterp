import frappe
from frappe.custom.doctype.property_setter.property_setter import make_property_setter

def run():
    # Get current options
    meta = frappe.get_meta("Journal Entry Account")
    field = meta.get_field("reference_type")
    current_options = field.options
    
    new_options = current_options
    if "Mandi Sale" not in current_options:
        new_options += "\nMandi Sale"
    if "Mandi Arrival" not in current_options:
        new_options += "\nMandi Arrival"
    
    if new_options != current_options:
        make_property_setter("Journal Entry Account", "reference_type", "options", new_options, "Select")
        print("Updated reference_type options in Journal Entry Account")
    else:
        print("Options already up to date")

run()
