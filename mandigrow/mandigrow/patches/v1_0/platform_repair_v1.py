import frappe
from frappe.utils import add_days, now_datetime

def execute():
    # 1. Update DocType modules
    doctypes = [
        "Mandi Organization", "App Plan", "Billing Gateway", "Mandi Contact",
        "Mandi Arrival", "Mandi Sale", "Mandi Sale Item", "Mandi Lot",
        "Mandi Settings", "Mandi Field Config", "Mandi Storage Location",
        "Site Contact Settings"
    ]
    for dt in doctypes:
        if frappe.db.exists("DocType", dt):
            frappe.db.set_value("DocType", dt, "module", "Mandigrow")
            
    # 2. Repair Expiry
    orgs = frappe.get_all("Mandi Organization", filters={"trial_ends_at": ("is", "not set")}, fields=["name", "creation"])
    for org in orgs:
        expiry = add_days(org.creation, 14)
        frappe.db.set_value("Mandi Organization", org.name, "trial_ends_at", expiry)

    # 3. Initialize Site Contact Settings
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
    
    frappe.db.commit()
