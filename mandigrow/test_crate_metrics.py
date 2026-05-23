import frappe
from mandigrow.api import _get_crate_stock_balance

def run():
    org_id = frappe.db.get_value("Mandi Organization", {"owner": "syed"}, "name")
    if not org_id:
        org_id = frappe.db.get_all("Mandi Organization", limit=1)[0].name

    print("Current buggy metrics:")
    print(_get_crate_stock_balance(org_id))

    print("\nExecuting new proposed SQL logic...")
    inv_query = """
        SELECT crate_type, 
               SUM(quantity) as available,
               SUM(CASE WHEN quantity > 0 AND (notes IS NULL OR notes NOT LIKE '%%Returned%%') THEN quantity ELSE 0 END) as total_purchased
        FROM `tabMandi Crate Inventory Entry`
        WHERE organization_id = %s
        GROUP BY crate_type
    """
    inv_rows = frappe.db.sql(inv_query, [org_id], as_dict=True)
    print("New Inventory SQL result:", inv_rows)

