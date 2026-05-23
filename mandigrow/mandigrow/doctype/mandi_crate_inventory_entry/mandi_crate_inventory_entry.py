import frappe

def before_save(doc, method):
    doc.total_value = (doc.quantity or 0) * (doc.purchase_rate or 0)
