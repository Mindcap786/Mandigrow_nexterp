import frappe
def add_account_description():
    if not frappe.db.exists('Custom Field', {'dt': 'Account', 'fieldname': 'description'}):
        frappe.get_doc({
            'doctype': 'Custom Field',
            'dt': 'Account',
            'fieldname': 'description',
            'label': 'Description',
            'fieldtype': 'Small Text',
            'insert_after': 'account_number'
        }).insert(ignore_permissions=True)
        frappe.db.commit()
        print("Custom field 'description' added to Account")
    else:
        print("Custom field 'description' already exists on Account")

if __name__ == "__main__":
    add_account_description()
