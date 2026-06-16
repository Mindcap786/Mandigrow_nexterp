import frappe
def run():
    try:
        frappe.delete_doc("Item", "HM-TAROROOT-2893", force=1)
        print("Deleted successfully")
    except Exception as e:
        msgs = getattr(frappe.local, 'message_log', [])
        print("Failed. Errors:", msgs)
        print("Exception:", e)
