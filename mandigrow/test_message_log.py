import frappe
import json
def run():
    try:
        frappe.throw("Simple message", frappe.LinkExistsError)
    except Exception as e:
        msgs = []
        for m in getattr(frappe.local, 'message_log', []):
            try:
                if isinstance(m, str):
                    msgs.append(json.loads(m).get("message"))
                else:
                    msgs.append(m.get("message"))
            except Exception as ex:
                print("Error parsing:", ex)
        print("Parsed msgs:", msgs)
