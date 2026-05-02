import frappe
def run():
    org = frappe.db.get_value("User", "shauddin@shauddin.com", "mandi_organization")
    print(f"User shauddin@shauddin.com mandi_organization: {org}")
run()
