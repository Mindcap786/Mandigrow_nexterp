import frappe
from mandigrow.api import (
    get_master_data,
    get_sale_master_data,
    get_daybook,
    get_contacts_page,
    get_org_settings
)

def run_tests():
    org_id = frappe.db.get_value("Mandi Organization", {"owner": "syed"}, "name")
    if not org_id:
        org_id = frappe.db.get_all("Mandi Organization", limit=1)[0].name
    
    frappe.session.user = "Administrator" # simulate admin
    
    print("--- STARTING HEALTH CHECK ---")
    results = []

    try:
        get_master_data(org_id)
        results.append("✅ get_master_data (Arrivals) passed.")
    except Exception as e:
        results.append(f"❌ get_master_data failed: {e}")

    try:
        get_sale_master_data(org_id)
        results.append("✅ get_sale_master_data (Sales) passed.")
    except Exception as e:
        results.append(f"❌ get_sale_master_data failed: {e}")

    try:
        get_contacts_page(org_id=org_id, page=1, page_size=10)
        results.append("✅ get_contacts_page (Contacts List) passed.")
    except Exception as e:
        results.append(f"❌ get_contacts_page failed: {e}")

    try:
        get_daybook(org_id=org_id)
        results.append("✅ get_daybook (Dashboard) passed.")
    except Exception as e:
        results.append(f"❌ get_daybook failed: {e}")

    try:
        get_org_settings(org_id=org_id)
        results.append("✅ get_org_settings (Settings) passed.")
    except Exception as e:
        results.append(f"❌ get_org_settings failed: {e}")

    print("---------------------------------")
    for r in results:
        print(r)
    print("---------------------------------")

