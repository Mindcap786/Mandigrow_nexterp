import frappe

def run():
    if not frappe.db.exists("DocType", "Device Token"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Device Token",
            "module": "Mandigrow",
            "custom": 1,
            "fields": [
                {"fieldname": "user_id", "label": "User ID", "fieldtype": "Data", "reqd": 1},
                {"fieldname": "organization_id", "label": "Organization ID", "fieldtype": "Data"},
                {"fieldname": "token", "label": "Token", "fieldtype": "Data", "unique": 1, "reqd": 1},
                {"fieldname": "platform", "label": "Platform", "fieldtype": "Select", "options": "web\nios\nandroid"},
                {"fieldname": "last_seen", "label": "Last Seen", "fieldtype": "Datetime"}
            ],
            "permissions": [
                {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}
            ],
            "naming_rule": "Random",
            "autoname": "hash"
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Successfully created 'Device Token' DocType.")
    else:
        print("'Device Token' DocType already exists.")

if __name__ == "__main__":
    run()
