import frappe
from mandigrow.local_invoices.api import translate_invoice_names

def run():
    frappe.session.user = "Administrator"
    try:
        res = translate_invoice_names(["Apple", "US"], "A1 Traders", "te")
        print("TEST_RESULT:", res)
    except Exception as e:
        print("TEST_ERROR:", e)
