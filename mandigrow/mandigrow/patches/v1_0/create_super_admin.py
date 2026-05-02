import frappe

def execute():
    email = "mindcap786@gmail.com"
    if not frappe.db.exists("User", email):
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": "Mindcap",
            "enabled": 1,
            "send_welcome_email": 0,
            "role_profile_name": "System Manager"
        })
        user.insert(ignore_permissions=True)
        
    # Force set password even if user exists to ensure access
    from frappe.utils.password import update_password
    update_password(email, "admin123")
    
    # Ensure user is enabled and has correct roles
    if frappe.db.exists("User", email):
        user = frappe.get_doc("User", email)
        user.enabled = 1
        user.insert_auth_method = "Password" # Ensure password login is allowed
        user.save(ignore_permissions=True)
        
        if "System Manager" not in [d.role for d in user.roles]:
            user.add_roles("System Manager")

