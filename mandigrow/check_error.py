import frappe
def run():
    logs = frappe.get_all('Error Log', fields=['name', 'method', 'error', 'creation'], order_by='creation desc', limit=5)
    for log in logs:
        print(f"[{log.creation}] {log.method}: {log.error}")
