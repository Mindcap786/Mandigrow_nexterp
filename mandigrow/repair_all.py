import frappe
from mandigrow.api import repair_single_party_settlement

def run():
    contacts = frappe.get_all("Mandi Contact", fields=["name", "organization_id"])
    print(f"Found {len(contacts)} contacts. Repairing...")
    for c in contacts:
        try:
            repair_single_party_settlement(c.name, c.organization_id)
        except Exception as e:
            print(f"Failed for {c.name}: {e}")
    frappe.db.commit()
    print("Done!")
