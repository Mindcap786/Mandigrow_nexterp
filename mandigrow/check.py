import frappe
import json

def execute():
    items = frappe.db.sql("SELECT name, commodity_name, image FROM `tabMandi Commodity`", as_dict=True)
    with open("/Users/shauddin/frappe-bench/output.json", "w") as f:
        json.dump(items, f, indent=2, default=str)
