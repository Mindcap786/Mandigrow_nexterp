import frappe
from mandigrow.api import get_sales_list
import json

def run():
    org_id = "ORG-00002"
    res = get_sales_list(org_id=org_id, page_size=5)
    # Filter for the specific one in the output
    for s in res["sales"]:
        if s["id"] == "SALE-ORG00002-2026-00083":
            print(json.dumps(s, indent=2))

run()
