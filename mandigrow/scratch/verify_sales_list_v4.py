import frappe
from mandigrow.mandigrow.api import get_sales_list
import json
from frappe.utils import strfmt

def run():
    org_id = "ORG-00002"
    res = get_sales_list(org_id=org_id, page_size=10)
    # Filter for the specific one in the output
    for s in res["sales"]:
        if s["id"] == "SALE-ORG00002-2026-00083":
            # Convert date to string for JSON serialization
            s["sale_date"] = str(s["sale_date"])
            s["due_date"] = str(s["due_date"])
            s["creation"] = str(s["creation"])
            print(json.dumps(s, indent=2))

if __name__ == "__main__":
    run()
