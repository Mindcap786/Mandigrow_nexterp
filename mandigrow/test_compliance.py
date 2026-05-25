import frappe
from mandigrow.mandigrow.logic.compliance import check_all_organizations_compliance

def run():
    print("Running compliance check...")
    check_all_organizations_compliance()
    
    orgs = frappe.get_all("Mandi Organization", fields=["name", "compliance_status", "grace_period_ends_at"])
    for org in orgs:
        print(f"Org: {org.name} | Status: {org.compliance_status} | Grace Ends: {org.grace_period_ends_at}")
    print("Done.")
