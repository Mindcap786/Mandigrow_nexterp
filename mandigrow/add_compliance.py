import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    doctype = "Mandi Organization"
    field = {
        "fieldname": "compliance_status",
        "fieldtype": "Select",
        "label": "Compliance Status",
        "options": "Compliant\nOver_Limit_Grace\nOver_Limit_Restricted",
        "default": "Compliant",
        "insert_after": "status"
    }
    
    try:
        if not frappe.db.has_column(doctype, "compliance_status"):
            create_custom_field(doctype, field)
            print("Successfully added custom field compliance_status")
        else:
            print("Field compliance_status already exists")
        frappe.db.commit()
    except Exception as e:
        print(f"Error: {e}")
