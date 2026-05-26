import frappe
def execute():
    contacts = frappe.db.get_all("Mandi Contact", fields=["name", "supplier", "customer", "full_name"])
    print("Contacts:", contacts)
    for c in contacts:
        if "MD" in str(c):
            print("Found MD:", c)
