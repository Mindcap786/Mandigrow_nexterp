import frappe
from mandigrow.api import _get_crate_stock_balance
def run():
    org_id = frappe.db.get_value("Mandi Organization", {"owner": "syed"}, "name")
    if not org_id:
        org_id = frappe.db.get_all("Mandi Organization", limit=1)[0].name
    print("Org ID:", org_id)
    print("Current output of _get_crate_stock_balance:")
    print(_get_crate_stock_balance(org_id))
