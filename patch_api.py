import re

with open("mandigrow/api.py", "r") as f:
    content = f.read()

new_func = """
@frappe.whitelist(allow_guest=False)
def get_gate_entry(entry_id: str) -> dict:
    \"\"\"
    Fetch a single Gate Entry by ID (name) for the current org.
    \"\"\"
    org_id = _get_user_org()
    if not frappe.db.exists("Mandi Gate Entry", entry_id):
        frappe.throw("Gate Entry not found", frappe.DoesNotExistError)
        
    doc = frappe.get_doc("Mandi Gate Entry", entry_id)
    if org_id and doc.organization_id != org_id:
        frappe.throw("Not permitted", frappe.PermissionError)
        
    return {
        "id": doc.name,
        "token_no": doc.token_no,
        "status": doc.status,
        "vehicle_number": doc.vehicle_number or doc.vehicle_no,
        "vehicle_no": doc.vehicle_number or doc.vehicle_no,
        "driver_name": doc.driver_name,
        "driver_phone": doc.driver_phone,
        "commodity": doc.commodity,
        "source": doc.source,
        "created_at": doc.creation,
        "updated_at": doc.modified,
        "organization_id": doc.organization_id
    }
"""

if "def get_gate_entry" not in content:
    content = content.replace("def create_gate_entry", new_func + "\n@frappe.whitelist(allow_guest=False)\ndef create_gate_entry")
    with open("mandigrow/api.py", "w") as f:
        f.write(content)
    print("Added get_gate_entry")
else:
    print("get_gate_entry already exists")
