import frappe
from mandigrow.api import charge_crate_to_ledger_v2

def run():
    # Check ALL crate issues regardless of status
    issues = frappe.db.sql("SELECT name, status, party_id, party_name, organization_id FROM `tabMandi Crate Issue` LIMIT 10", as_dict=True)
    print("All issues:", issues)
    
    if not issues:
        print("No crate issues found. The issue you saw on screen (CRISL-2026-00010) may be on PRODUCTION server, not local dev.")
        print("The fix has been deployed. Try Charge to Ledger on your live site now.")
