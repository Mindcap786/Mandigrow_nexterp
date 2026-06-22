import frappe
from mandigrow.local_invoices.api import translate_invoice_names

def execute():
    try:
        frappe.session.user = "Administrator"
        res = translate_invoice_names(["Apple - US", "Apple", "US"], "A1 Traders", "te")
        print("Success:", res)
    except Exception as e:
        print("Exception caught:")
        import traceback
        traceback.print_exc()
