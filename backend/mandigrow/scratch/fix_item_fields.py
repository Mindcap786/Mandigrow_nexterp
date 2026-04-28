import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def run():
    # Only create if not exists
    fields_to_add = []
    
    if not frappe.db.exists("Custom Field", {"dt": "Item", "fieldname": "internal_id"}):
        fields_to_add.append({
            'fieldname': 'internal_id',
            'label': 'Internal ID',
            'fieldtype': 'Data',
            'insert_after': 'item_code'
        })
        
    if not frappe.db.exists("Custom Field", {"dt": "Item", "fieldname": "custom_attributes"}):
        fields_to_add.append({
            'fieldname': 'custom_attributes',
            'label': 'Custom Attributes',
            'fieldtype': 'JSON',
            'insert_after': 'item_name'
        })
    
    if fields_to_add:
        create_custom_fields({'Item': fields_to_add})
        frappe.db.commit()
        print(f"Created {len(fields_to_add)} custom fields")
    else:
        print("Fields already exist")

if __name__ == "__main__":
    run()
