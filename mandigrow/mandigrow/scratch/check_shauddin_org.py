import frappe
def run():
    org_id = frappe.db.get_value("Mandi Profile", {"email": "shauddin@shauddin.com"}, "organization_id")
    print(f"shauddin organization_id: {org_id}")
run()
