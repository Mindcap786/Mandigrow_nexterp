import frappe

def execute():
    email = "mindcap786@gmail.com"
    # This patch is designed to run multiple times if needed to force-reset the admin access
    if frappe.db.exists("User", email):
        user = frappe.get_doc("User", email)
        user.enabled = 1
        user.insert_auth_method = "Password"
        user.save(ignore_permissions=True)
        
        # Force set password using native hashing
        from frappe.utils.password import update_password
        update_password(email, "admin123")
        
        if "System Manager" not in [d.role for d in user.roles]:
            user.add_roles("System Manager")
            
        print(f"CRITICAL: Super Admin {email} has been force-reset and enabled.")
