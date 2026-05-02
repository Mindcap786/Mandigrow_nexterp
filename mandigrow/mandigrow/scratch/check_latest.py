import frappe
def run():
    sales = frappe.get_all('Mandi Sale', order_by='creation desc', limit=1, fields=['name', 'paymentmode', 'amountreceived', 'invoice_total', 'status', 'creation'])
    print("Latest Sale:")
    for s in sales:
        print(s)
        
    print("\nError Logs:")
    logs = frappe.get_all('Error Log', order_by='creation desc', limit=5, fields=['method', 'error', 'creation'])
    for log in logs:
        if 'DEBUG' in (log.method or ''):
            print(f"[{log.creation}] {log.method}: {log.error}")
