import frappe
def execute():
    # Fix the module name in DB so frappe.new_doc works
    frappe.db.sql("UPDATE `tabDocType` SET module='Mandigrow' WHERE name='Mandi Translation Cache'")
    # Clear the translations
    frappe.db.sql("DELETE FROM `tabMandi Translation Cache`")
    frappe.db.commit()
    
    # Try translating
    from mandigrow.local_invoices.translator import translate_batch
    from mandigrow.local_invoices.api import translate_invoice_names
    frappe.session.user = "Administrator"
    res = translate_invoice_names(["Apple - US"], "CDE BUYESR", "te")
    print("Test 1:", res)
    res2 = translate_invoice_names(["Apple - US"], "A1 Traders", "te")
    print("Test 2:", res2)

    print("Database Translation Cache Cleared and Module Fixed")
