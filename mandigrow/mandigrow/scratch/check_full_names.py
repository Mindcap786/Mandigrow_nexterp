import frappe
def run():
    contacts = frappe.db.get_all("Mandi Contact", fields=["name", "full_name", "contact_type"])
    print(f"Contacts: {contacts}")
run()
