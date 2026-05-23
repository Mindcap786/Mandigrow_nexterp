import frappe
frappe.init(site="mandigrow.com")
frappe.connect()
try:
    from mandigrow.mandigrow.api import reset_invoice_sequence
    res = reset_invoice_sequence("abid")
    print(res)
except Exception as e:
    print(e)
