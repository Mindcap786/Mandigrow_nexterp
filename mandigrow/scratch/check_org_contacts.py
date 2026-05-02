import frappe
def run():
    count = frappe.db.count("Mandi Contact", filters={"organization_id": "ORG-00002"})
    print(f"Contacts for ORG-00002: {count}")
    contacts = frappe.db.get_all("Mandi Contact", filters={"organization_id": "ORG-00002"}, fields=["full_name", "contact_type"])
    print(f"Sample contacts: {contacts[:5]}")
run()
