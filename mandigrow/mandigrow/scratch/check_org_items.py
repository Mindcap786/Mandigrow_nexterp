import frappe
def run():
    items = frappe.db.get_all("Item", filters={"organization_id": "ORG-00002"}, fields=["name", "item_name"])
    print(f"Items for ORG-00002: {items}")
run()
