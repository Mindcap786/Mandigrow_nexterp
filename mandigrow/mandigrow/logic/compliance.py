import frappe
from frappe.utils import now_datetime, date_diff, add_days
from mandigrow.mandigrow.logic.subscription_guard import get_subscription_state, _get_current_org

def check_all_organizations_compliance():
    """
    Daily cron job to check user limit compliance for all organizations.
    Updates the compliance_status and grace_period_ends_at fields.
    """
    orgs = frappe.get_all("Mandi Organization", fields=["name", "compliance_status", "grace_period_ends_at"])
    
    for org in orgs:
        try:
            state = get_subscription_state(org.name)
            current_count = state["current_user_count"]
            max_users = state["max_users"]
            
            is_over_limit = current_count > max_users
            current_status = org.compliance_status or "Compliant"
            now = now_datetime()
            
            if is_over_limit:
                if current_status == "Compliant":
                    # Just went over limit (e.g. downgraded). Start grace period.
                    grace_days = state["grace_period_days"] or 7
                    grace_ends = add_days(now, grace_days)
                    frappe.db.set_value("Mandi Organization", org.name, {
                        "compliance_status": "Over_Limit_Grace",
                        "grace_period_ends_at": grace_ends
                    })
                elif current_status == "Over_Limit_Grace":
                    # Check if grace period expired
                    grace_ends = org.grace_period_ends_at
                    if grace_ends and now > grace_ends:
                        frappe.db.set_value("Mandi Organization", org.name, "compliance_status", "Over_Limit_Restricted")
            else:
                if current_status != "Compliant":
                    # They resolved the issue! Revert to Compliant.
                    frappe.db.set_value("Mandi Organization", org.name, {
                        "compliance_status": "Compliant",
                        "grace_period_ends_at": None
                    })
                    
        except Exception as e:
            frappe.log_error(title=f"Compliance check failed for {org.name}", message=str(e))

def check_tenant_compliance(doc, user=None, ptype=None):
    """
    Global permission hook to block write operations if the tenant is Over_Limit_Restricted.
    """
    if ptype in ("read", "export", "print", "report"):
        return True
        
    # We only care about blocking documents that belong to a company/tenant
    # Check if doc has a 'company' or 'organization_id'
    company = getattr(doc, "company", None)
    org_id = None
    
    if company:
        # Resolve org from company
        org_id = frappe.cache().hget("company_to_org", company)
        if not org_id:
            org_id = frappe.db.get_value("Mandi Organization", {"erp_company": company}, "name")
            if org_id:
                frappe.cache().hset("company_to_org", company, org_id)
    elif hasattr(doc, "organization_id"):
        org_id = doc.organization_id

    if not org_id:
        # If this is not a tenant document, allow standard permissions to handle it
        return True

    # Use redis caching for compliance status to ensure lightning fast checks
    status = frappe.cache().hget("org_compliance", org_id)
    if not status:
        status = frappe.db.get_value("Mandi Organization", org_id, "compliance_status")
        frappe.cache().hset("org_compliance", org_id, status or "Compliant")

    if status == "Over_Limit_Restricted":
        frappe.throw("Your organization is over its user limit. Your workspace is currently Read-Only. Please manage your team to restore access.")
        
    return True

def trigger_compliance_check(org_id):
    """
    Called synchronously when a user is deactivated or added to instantly update the tenant's compliance state.
    """
    if not org_id:
        return
        
    state = get_subscription_state(org_id)
    is_over_limit = state["current_user_count"] > state["max_users"]
    
    org = frappe.db.get_value("Mandi Organization", org_id, ["compliance_status", "grace_period_ends_at"], as_dict=True)
    if not org:
        return
        
    current_status = org.get("compliance_status") or "Compliant"
    
    if not is_over_limit and current_status != "Compliant":
        frappe.db.set_value("Mandi Organization", org_id, {
            "compliance_status": "Compliant",
            "grace_period_ends_at": None
        })
        frappe.cache().hset("org_compliance", org_id, "Compliant")
    elif is_over_limit and current_status == "Compliant":
        grace_days = state["grace_period_days"] or 7
        grace_ends = add_days(now_datetime(), grace_days)
        frappe.db.set_value("Mandi Organization", org_id, {
            "compliance_status": "Over_Limit_Grace",
            "grace_period_ends_at": grace_ends
        })
        frappe.cache().hset("org_compliance", org_id, "Over_Limit_Grace")
