import frappe
from mandigrow.api import _get_user_org

def run():
    org = _get_user_org()
    locs = frappe.get_all("Mandi Storage Location", filters={"organization_id": org}, fields=["*"])
    print(f"Org: {org}")
    print(f"Locations: {locs}")

run()
