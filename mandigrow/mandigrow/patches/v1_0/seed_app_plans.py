import frappe

def execute():
    """Seeds the initial App Plans if they don't exist."""
    plans = [
        {
            "plan_name": "starter",
            "display_name": "Starter Edition",
            "price_monthly": 1500,
            "price_yearly": 15000,
            "max_users": 2,
            "max_storage_gb": 5,
            "sort_order": 1,
            "features": '{"inventory": true, "billing": true, "reporting": "basic"}'
        },
        {
            "plan_name": "professional",
            "display_name": "Professional Edition",
            "price_monthly": 5000,
            "price_yearly": 50000,
            "max_users": 10,
            "max_storage_gb": 50,
            "sort_order": 2,
            "features": '{"inventory": true, "billing": true, "reporting": "advanced", "multi_warehouse": true}'
        },
        {
            "plan_name": "enterprise",
            "display_name": "Enterprise Edition",
            "price_monthly": 15000,
            "price_yearly": 150000,
            "max_users": 999,
            "max_storage_gb": 500,
            "sort_order": 3,
            "features": '{"inventory": true, "billing": true, "reporting": "full", "multi_warehouse": true, "custom_fields": true}'
        }
    ]
    
    for p_data in plans:
        if not frappe.db.exists("App Plan", p_data["plan_name"]):
            doc = frappe.get_doc({
                "doctype": "App Plan",
                **p_data
            })
            doc.insert(ignore_permissions=True)
            
    frappe.db.commit()
