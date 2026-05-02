import frappe
def run():
    profiles = frappe.db.get_all("Mandi Profile", fields=["email", "organization_id"])
    print(f"Profiles: {profiles}")
run()
