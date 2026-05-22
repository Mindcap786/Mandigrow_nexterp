import frappe

def create_support_ticket_doctype():
    doctype_name = "Mandi Support Ticket"
    
    if frappe.db.exists("DocType", doctype_name):
        print(f"DocType {doctype_name} already exists.")
        return

    doc = frappe.get_doc({
        "doctype": "DocType",
        "name": doctype_name,
        "module": "Mandigrow",
        "custom": 1,
        "autoname": "TKT-.YYYY.-.#####",
        "fields": [
            {"fieldname": "subject", "label": "Subject", "fieldtype": "Data"},
            {"fieldname": "message", "label": "Message", "fieldtype": "Text", "reqd": 1},
            {"fieldname": "ticket_type", "label": "Ticket Type", "fieldtype": "Select", "options": "support\nfeature_request\nbilling", "default": "support"},
            {"fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "open\nin_progress\nresolved\nclosed", "default": "open"},
            {"fieldname": "organization_id", "label": "Organization", "fieldtype": "Link", "options": "Mandi Organization", "reqd": 1, "in_list_view": 1},
            {"fieldname": "user_id", "label": "User Email", "fieldtype": "Data", "in_list_view": 1},
            {"fieldname": "admin_notes", "label": "Admin Notes", "fieldtype": "Text"}
        ],
        "permissions": [
            {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
            {"role": "All", "read": 1, "write": 1, "create": 1}
        ]
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    print(f"Created DocType {doctype_name}")

create_support_ticket_doctype()
