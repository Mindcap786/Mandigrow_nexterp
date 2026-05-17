import frappe

def execute():
    # 1. Recover mindcap786@gmail.com (Default Admin)
    email = "mindcap786@gmail.com"
    if frappe.db.exists("User", email):
        user = frappe.get_doc("User", email)
        user.enabled = 1
        user.insert_auth_method = "Password"
        user.save(ignore_permissions=True)
        
        from frappe.utils.password import update_password
        update_password(email, "admin123")
        
        if "System Manager" not in [d.role for d in user.roles]:
            user.add_roles("System Manager")
            
        print(f"CRITICAL: Super Admin {email} has been force-reset and enabled.")

    # 2. Recover syed@gmail.com (Tenant Owner affected by identity override)
    syed_email = "syed@gmail.com"
    if frappe.db.exists("User", syed_email):
        syed_user = frappe.get_doc("User", syed_email)
        
        # Unlink any mistakenly linked employees
        linked_emps = frappe.get_all("Employee", filters={"user_id": syed_user.name})
        for e in linked_emps:
            emp = frappe.get_doc("Employee", e.name)
            emp.user_id = ""
            emp.save(ignore_permissions=True)
            
        # Restore name
        syed_user.first_name = "Syed"
        syed_user.last_name = "Admin"
        syed_user.role_type = "admin"
        if "System Manager" not in [d.role for d in syed_user.roles]:
            syed_user.add_roles("System Manager")
        syed_user.save(ignore_permissions=True)
        print(f"CRITICAL: Tenant Admin {syed_email} identity recovered.")
        
    frappe.db.commit()
