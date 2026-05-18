"""
One-time cleanup: remove stale mandi_organization from super-admin user records.
Run with: bench --site mandigrow.localhost execute cleanup_super_admin_org.cleanup
"""
import frappe

def cleanup():
    PLATFORM_ADMINS = ["Administrator", "mindcap786@gmail.com"]
    for email in PLATFORM_ADMINS:
        if frappe.db.exists("User", email):
            current = frappe.db.get_value("User", email, "mandi_organization")
            if current:
                frappe.db.set_value("User", email, "mandi_organization", None, update_modified=False)
                print(f"✅ Cleaned mandi_organization from {email} (was: {current})")
            else:
                print(f"✓ {email}: already clean")
    frappe.db.commit()
    print("Done. Super-admin accounts no longer appear in any tenant's Team Access.")
