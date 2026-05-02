import frappe
def run():
    try:
        data = frappe.db.sql("SELECT name, location_name, organization_id, is_active FROM `tabMandi Storage Location`", as_dict=True)
        print(f"Data: {data}")
    except Exception as e:
        print(f"Error: {e}")
run()
