import frappe
import json
from mandigrow.api import _get_crate_stock_balance, report_crate_loss

def execute():
    frappe.init(site="mandigrow.com")
    frappe.connect()
    try:
        orgs = frappe.get_all("Mandi Organization", pluck="name")
        for org in orgs:
            stock = _get_crate_stock_balance(org)
            print(f"Org: {org}, Stock: {json.dumps(stock, indent=2)}")
    except Exception as e:
        print("Error:", e)
    finally:
        frappe.destroy()

if __name__ == "__main__":
    execute()
