import frappe

def run():
    logs = frappe.get_all("Error Log", filters={"method": "DEBUG: amountreceived capture"}, order_by="creation desc", limit=1, fields=["name"])
    if logs:
        doc = frappe.get_doc("Error Log", logs[0].name)
        print("DEBUG LOG:")
        print(doc.error)
    else:
        print("NO DEBUG LOG FOUND")
