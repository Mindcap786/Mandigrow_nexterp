import frappe
from mandigrow.mandigrow.api import get_stock_summary
import json

def test():
    frappe.flags.ignore_permissions = True
    summary = get_stock_summary()
    for item in summary:
        print(f"Item: {item.get('item_name')} ({item.get('item_id')}) -> Sec UOM: '{item.get('custom_secondary_uom')}'")
