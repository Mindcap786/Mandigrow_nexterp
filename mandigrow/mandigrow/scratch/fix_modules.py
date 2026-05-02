import frappe

def execute():
    # 1. Update tabDocType module and custom_fieldname mapping
    # Ensure all Mandigrow doctypes point to the 'Mandigrow' module
    doctypes = [
        "Mandi Organization", "App Plan", "Billing Gateway", "Mandi Contact",
        "Mandi Arrival", "Mandi Sale", "Mandi Sale Item", "Mandi Lot",
        "Mandi Settings", "Mandi Field Config", "Mandi Storage Location",
        "Site Contact Settings"
    ]
    
    for dt in doctypes:
        if frappe.db.exists("DocType", dt):
            frappe.db.set_value("DocType", dt, "module", "Mandigrow")
            print(f"Updated module for {dt} to Mandigrow")
            
    # 2. Clear caches to force reload from new paths
    frappe.clear_cache()
    print("Cleared all caches")
    
    frappe.db.commit()
