import frappe
from mandigrow.mandigrow.api import update_tenant_config

def execute():
    try:
        frappe.session.user = "Administrator"
        res = update_tenant_config("ORG-00001", {"rbac_matrix": {}})
        print("Success:", res)
    except Exception as e:
        print("Exception caught:")
        import traceback
        traceback.print_exc()
