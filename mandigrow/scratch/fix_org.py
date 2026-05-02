import frappe

def execute():
    frappe.db.set_value('DocType', 'Mandi Organization', 'custom', 0)
    frappe.db.set_value('DocType', 'Mandi Organization', 'module', 'Mandigrow')
    doc = frappe.get_doc('DocType', 'Mandi Organization')
    doc.save()
    frappe.db.commit()
    print("Saved Mandi Organization!")
