import frappe

def repair():
    """
    Direct SQL repair — bypasses Frappe's background job queue (no Redis needed).
    - Unlinks syed@gmail.com from any Employee records
    - Restores syed@gmail.com display name to 'Syed Admin'
    """
    
    # 1. Unlink syed@gmail.com from any employees (direct DB update, no triggers)
    frappe.db.sql("""
        UPDATE `tabEmployee`
        SET user_id = ''
        WHERE user_id = 'syed@gmail.com'
    """)
    
    # 2. Restore the display name of syed@gmail.com via direct update
    frappe.db.sql("""
        UPDATE `tabUser`
        SET first_name = 'Syed',
            last_name = 'Admin',
            full_name = 'Syed Admin',
            role_type = 'admin'
        WHERE name = 'syed@gmail.com'
    """)
    
    frappe.db.commit()
    
    # Verify
    result = frappe.db.sql("""
        SELECT name, full_name, role_type FROM `tabUser` WHERE name = 'syed@gmail.com'
    """, as_dict=True)
    
    emp_result = frappe.db.sql("""
        SELECT name, employee_name, user_id FROM `tabEmployee` WHERE user_id = 'syed@gmail.com'
    """, as_dict=True)
    
    print(f"User after repair: {result}")
    print(f"Employees still linked to syed@gmail.com: {emp_result}")
    print("Repair complete.")
