import frappe

def run():
    # Get ALL recent error logs
    logs = frappe.get_all("Error Log", order_by="creation desc", limit=5, fields=["name", "method", "creation"])
    for log in logs:
        print(f"  {log.name} | method={log.method} | {log.creation}")
        if "DEBUG" in (log.method or ""):
            doc = frappe.get_doc("Error Log", log.name)
            print(f"    CONTENT: {doc.error[:500]}")
