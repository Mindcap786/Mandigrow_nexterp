import frappe
frappe.init(site="mandigrow.localhost")
frappe.connect()

logs = frappe.get_all("Error Log", 
    filters={"message": ["like", "%POS Payload:%"]}, 
    fields=["message", "creation"], 
    order_by="creation desc", 
    limit=5
)

for l in logs:
    print(f"--- {l.creation} ---")
    print(l.message)
