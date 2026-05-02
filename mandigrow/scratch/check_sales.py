import frappe
def run():
    sales = frappe.get_all('Mandi Sale', order_by='creation desc', limit=10, fields=['name', 'paymentmode', 'amountreceived', 'invoice_total', 'status', 'creation'])
    for s in sales:
        print(s)
