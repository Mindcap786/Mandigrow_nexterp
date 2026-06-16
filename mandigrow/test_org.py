import frappe
from mandigrow.mandigrow.api import _get_user_org
def run():
    frappe.set_user("Administrator")
    admin_org = _get_user_org()
    print(f"Admin org: {admin_org}")
    
    item_org = frappe.db.get_value("Item", "HM-DRAGONFRUIT-9719", "organization_id")
    print(f"Item org: {item_org}")
