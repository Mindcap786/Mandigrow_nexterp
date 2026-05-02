import frappe
def run():
    count = frappe.db.count("Mandi Contact", filters={"contact_type": "farmer", "organization_id": "ORG-00002"})
    print(f"Farmers for ORG-00002: {count}")
run()
