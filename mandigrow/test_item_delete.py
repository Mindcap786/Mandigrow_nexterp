import frappe
def run():
    frappe.set_user("Administrator")
    # Create an item
    item = frappe.get_doc({
        "doctype": "Item",
        "item_code": "TEST-DEL-1",
        "item_group": "Products",
        "stock_uom": "Kg"
    }).insert(ignore_permissions=True)
    
    # Try deleting it
    try:
        frappe.delete_doc("Item", "TEST-DEL-1", force=1)
        print("Deleted perfectly")
    except Exception as e:
        print("Error type:", type(e))
        msgs = []
        for m in getattr(frappe.local, 'message_log', []):
            if isinstance(m, str):
                import json
                msgs.append(json.loads(m).get("message"))
            else:
                msgs.append(m.get("message"))
        print("Error:", msgs)
