import frappe
def execute():
    docs = frappe.get_all("Mandi Arrival", fields=["name", "advance_cheque_no", "advance_cheque_date"], order_by="creation desc", limit=3)
    for d in docs:
        print(d)
