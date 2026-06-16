import frappe
def run():
    frappe.set_user("Administrator")
    try:
        # Instead of importing directly, call whitelist method using frappe.call
        print("Calling via frappe.call...")
        res = frappe.call("mandigrow.api.delete_commodity", id="HM-DRAGONFRUIT-9719")
        print("Result:", res)
    except Exception as e:
        print("Error:", type(e), str(e))
