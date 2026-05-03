import frappe
from mandigrow.api import get_sales_list
import json

def run():
    org_id = "ORG-00002"
    search = "SALE-ORG00002-2026-00083"
    res = get_sales_list(org_id=org_id, search=search)
    print(json.dumps(res, indent=2))

run()
