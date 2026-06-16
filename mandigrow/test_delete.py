import frappe
def run():
    target_id = "HM-DRAGONFRUIT-9719"
    try:
        frappe.delete_doc("Item", target_id, force=1)
        print("Success")
    except Exception as e:
        print(f"Exception Type: {type(e)}")
        print(f"Exception String: {str(e)}")
        import json
        if getattr(frappe.local, 'message_log', None):
            msgs = [json.loads(m).get("message") for m in frappe.local.message_log]
            print(f"Message Log: {msgs}")
        else:
            print("No message log")
