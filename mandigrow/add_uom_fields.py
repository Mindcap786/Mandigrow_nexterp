import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    custom_fields = {
        "Item": [
            {
                "fieldname": "custom_secondary_uom",
                "label": "Secondary UOM",
                "fieldtype": "Data",
                "insert_after": "stock_uom",
                "description": "Secondary Unit of Measure (e.g. Kg)"
            },
            {
                "fieldname": "custom_uom_conversion_factor",
                "label": "UOM Conversion Factor",
                "fieldtype": "Float",
                "insert_after": "custom_secondary_uom",
                "description": "Units per primary unit (e.g. 10 for 1 Box = 10 Kg)"
            }
        ]
    }
    create_custom_fields(custom_fields)
    frappe.db.commit()
    print("Custom fields added successfully.")
