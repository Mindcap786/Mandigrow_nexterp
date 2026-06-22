import frappe

def execute():
    try:
        val = frappe.db.get_value("Mandi Organization", "ORG-00001", "rbac_matrix")
        print("rbac_matrix value:", val)
    except Exception as e:
        print("Error fetching rbac_matrix:", e)
