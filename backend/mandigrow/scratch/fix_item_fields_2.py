import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def run():
    fields_to_add = []
    
    if not frappe.db.exists("Custom Field", {"dt": "Item", "fieldname": "local_name"}):
        fields_to_add.append({
            'fieldname': 'local_name',
            'label': 'Local Name',
            'fieldtype': 'Data',
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
