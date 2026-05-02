import frappe

def execute():
    for dt in ['Mandi Field Config', 'Device Token']:
        if frappe.db.exists('DocType', dt):
            frappe.db.set_value('DocType', dt, 'custom', 0)
            frappe.db.set_value('DocType', dt, 'module', 'Mandigrow')
            doc = frappe.get_doc('DocType', dt)
            doc.save()
            print(f"Saved {dt}!")
    frappe.db.commit()
