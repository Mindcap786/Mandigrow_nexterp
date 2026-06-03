import frappe
from mandigrow.mandigrow.api import get_stock_summary
import json

def test():
    frappe.flags.ignore_permissions = True
    summary = get_stock_summary()
    for i in summary:
        if "kiwi" in str(i.get("item_name", "")).lower() or "kiwi" in str(i.get("item_id", "")).lower():
            print("KIWI ITEM DATA:")
            print(json.dumps(i, indent=2))
