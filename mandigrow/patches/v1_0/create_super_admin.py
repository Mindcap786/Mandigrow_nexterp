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
        
        # Set default password
        from frappe.utils.password import update_password
        update_password(email, "admin123")
        
    # Ensure role is set for existing user too
    user = frappe.get_doc("User", email)
    if "System Manager" not in [d.role for d in user.roles]:
        user.add_roles("System Manager")
