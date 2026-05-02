import frappe

def create_admin():
    email = "mindcap786@gmail.com"
    if not frappe.db.exists("User", email):
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": "Mindcap",
            "enabled": 1,
            "send_welcome_email": 0
        })
        user.insert(ignore_permissions=True)
        print(f"User {email} created.")
    
    # Set password
    from frappe.utils.password import update_password
    update_password(email, "admin123")
    print(f"Password set for {email}.")

if __name__ == "__main__":
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    create_admin()
    frappe.db.commit()
