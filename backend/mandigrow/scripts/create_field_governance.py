import frappe

def execute():
    if not frappe.db.exists("DocType", "Mandi Field Config"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Mandi Field Config",
            "module": "MandiGrow",
            "custom": 1,
            "naming_rule": "Random",
            "fields": [
                {"fieldname": "organization_id", "label": "Organization", "fieldtype": "Link", "options": "Mandi Organization", "reqd": 1},
                {"fieldname": "module_id", "label": "Module ID", "fieldtype": "Data", "reqd": 1},
                {"fieldname": "field_key", "label": "Field Key", "fieldtype": "Data", "reqd": 1},
                {"fieldname": "label", "label": "Label", "fieldtype": "Data", "reqd": 1},
                {"fieldname": "is_visible", "label": "Is Visible", "fieldtype": "Check", "default": "1"},
                {"fieldname": "is_mandatory", "label": "Is Mandatory", "fieldtype": "Check", "default": "0"},
                {"fieldname": "default_value", "label": "Default Value", "fieldtype": "Data"},
                {"fieldname": "display_order", "label": "Display Order", "fieldtype": "Int", "default": "0"},
                {"fieldname": "user_id", "label": "User ID", "fieldtype": "Data"}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}]
        })
        doc.insert(ignore_permissions=True)
        print("Created Mandi Field Config DocType")
    else:
        print("Mandi Field Config already exists")

    if not frappe.db.exists("DocType", "Mandi Storage Location"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Mandi Storage Location",
            "module": "MandiGrow",
            "custom": 1,
            "naming_rule": "Random",
            "fields": [
                {"fieldname": "organization_id", "label": "Organization", "fieldtype": "Link", "options": "Mandi Organization", "reqd": 1},
                {"fieldname": "name", "label": "Name", "fieldtype": "Data", "reqd": 1},
                {"fieldname": "type", "label": "Type", "fieldtype": "Select", "options": "warehouse\ncold_storage\nyard\nshop", "default": "warehouse"},
                {"fieldname": "address", "label": "Address", "fieldtype": "Data"}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}]
        })
        doc.insert(ignore_permissions=True)
        print("Created Mandi Storage Location DocType")
    else:
        print("Mandi Storage Location already exists")
