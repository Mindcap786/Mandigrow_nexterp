import frappe
from frappe.utils import add_days, now_datetime

def execute():
    # 1. Repair Tenant Expiry
    orgs = frappe.get_all("Mandi Organization", filters={"trial_ends_at": ("is", "not set")}, fields=["name", "creation"])
    for org in orgs:
        # Default to 14 days from creation
        expiry = add_days(org.creation, 14)
        frappe.db.set_value("Mandi Organization", org.name, "trial_ends_at", expiry)
        print(f"Repaired expiry for {org.name}: {expiry}")
    
    # 2. Initialize Site Contact Settings if empty
    settings = frappe.get_doc("Site Contact Settings")
    if not settings.company_name:
        settings.update({
            "company_name": "MINDT Private Limited",
            "tagline": "India's #1 Mandi ERP for fruits & vegetable traders",
            "phone": "+91 82609 21301",
            "whatsapp": "+91 82609 21301",
            "email_support": "support@mandigrow.com",
            "email_sales": "sales@mandigrow.com",
            "email_legal": "legal@mandigrow.com",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "support_hours": "Mon–Sat, 9:00 AM – 8:00 PM IST"
        })
        settings.save(ignore_permissions=True)
        print("Initialized Site Contact Settings with defaults")
    
    frappe.db.commit()
