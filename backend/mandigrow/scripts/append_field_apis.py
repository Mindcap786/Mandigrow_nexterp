import frappe

def execute():
    code = """

# --- Field Governance APIs ---
@frappe.whitelist(allow_guest=False)
def get_all_field_configs() -> list:
    org_id = _get_user_org()
    if not org_id: return []
    return frappe.get_all("Mandi Field Config", filters={"organization_id": org_id, "user_id": ["is", "not set"]}, fields=["name as id", "module_id", "field_key", "label", "is_visible", "is_mandatory", "default_value", "display_order"], order_by="module_id asc, display_order asc")

@frappe.whitelist(allow_guest=False)
def update_field_configs(configs: list) -> dict:
    org_id = _get_user_org()
    if isinstance(configs, str):
        import json
        configs = json.loads(configs)
    
    for c in configs:
        doc = frappe.get_doc("Mandi Field Config", c.get("id"))
        if doc.organization_id == org_id:
            doc.is_visible = c.get("is_visible")
            doc.is_mandatory = c.get("is_mandatory")
            doc.default_value = c.get("default_value")
            doc.label = c.get("label")
            doc.save(ignore_permissions=True)
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def add_field_config(config: dict) -> dict:
    org_id = _get_user_org()
    if isinstance(config, str):
        import json
        config = json.loads(config)
    
    doc = frappe.get_doc({
        "doctype": "Mandi Field Config",
        "organization_id": org_id,
        "module_id": config.get("module_id"),
        "field_key": config.get("field_key"),
        "label": config.get("label"),
        "is_visible": 1,
        "is_mandatory": 0,
        "display_order": 99
    })
    doc.insert(ignore_permissions=True)
    return {"success": True, "data": {"id": doc.name, "module_id": doc.module_id, "field_key": doc.field_key, "label": doc.label, "is_visible": True, "is_mandatory": False}}

@frappe.whitelist(allow_guest=False)
def delete_field_config(id: str) -> dict:
    org_id = _get_user_org()
    doc = frappe.get_doc("Mandi Field Config", id)
    if doc.organization_id == org_id:
        frappe.delete_doc("Mandi Field Config", id, ignore_permissions=True)
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def seed_default_field_configs() -> dict:
    org_id = _get_user_org()
    # Simple seed logic for arrivals
    defaults = [
        {"module_id": "arrivals_direct", "field_key": "supplier_rate", "label": "Supplier Rate"},
        {"module_id": "arrivals_direct", "field_key": "sale_price", "label": "Sale Price"},
        {"module_id": "arrivals_farmer", "field_key": "commission_percent", "label": "Commission %"},
        {"module_id": "arrivals_supplier", "field_key": "commission_percent", "label": "Commission %"}
    ]
    for d in defaults:
        if not frappe.db.exists("Mandi Field Config", {"organization_id": org_id, "module_id": d["module_id"], "field_key": d["field_key"]}):
            doc = frappe.get_doc({
                "doctype": "Mandi Field Config",
                "organization_id": org_id,
                **d
            })
            doc.insert(ignore_permissions=True)
    return {"success": True}

# --- Storage Location APIs ---
@frappe.whitelist(allow_guest=False)
def get_storage_locations() -> list:
    org_id = _get_user_org()
    if not org_id: return []
    return frappe.get_all("Mandi Storage Location", filters={"organization_id": org_id}, fields=["name as id", "name as name", "type", "address"], order_by="creation desc")

@frappe.whitelist(allow_guest=False)
def add_storage_location(location: dict) -> dict:
    org_id = _get_user_org()
    if isinstance(location, str):
        import json
        location = json.loads(location)
    doc = frappe.get_doc({
        "doctype": "Mandi Storage Location",
        "organization_id": org_id,
        "name": location.get("name"),
        "type": location.get("type"),
        "address": location.get("address")
    })
    doc.insert(ignore_permissions=True)
    return {"success": True, "data": {"id": doc.name, "name": doc.name, "type": doc.type, "address": doc.address}}

@frappe.whitelist(allow_guest=False)
def update_storage_location(id: str, location: dict) -> dict:
    org_id = _get_user_org()
    if isinstance(location, str):
        import json
        location = json.loads(location)
    doc = frappe.get_doc("Mandi Storage Location", id)
    if doc.organization_id == org_id:
        doc.name = location.get("name")
        doc.type = location.get("type")
        doc.address = location.get("address")
        doc.save(ignore_permissions=True)
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def delete_storage_location(id: str) -> dict:
    org_id = _get_user_org()
    doc = frappe.get_doc("Mandi Storage Location", id)
    if doc.organization_id == org_id:
        frappe.delete_doc("Mandi Storage Location", id, ignore_permissions=True)
    return {"success": True}

"""
    with open('/Users/shauddin/frappe-bench/apps/mandigrow/mandigrow/api.py', 'a') as f:
        f.write(code)
    print("Appended APIs to api.py")
