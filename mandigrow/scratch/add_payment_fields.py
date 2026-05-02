import frappe
def add_payment_settings_fields():
    fields = [
        {'fieldname': 'print_upi_qr', 'label': 'Print UPI QR', 'fieldtype': 'Check'},
        {'fieldname': 'print_bank_details', 'label': 'Print Bank Details', 'fieldtype': 'Check'},
        {'fieldname': 'qr_bank_id', 'label': 'QR Bank Account', 'fieldtype': 'Data'},
        {'fieldname': 'text_bank_id', 'label': 'Text Bank Account', 'fieldtype': 'Data'}
    ]
    
    for f in fields:
        if not frappe.db.exists('Custom Field', {'dt': 'Mandi Organization', 'fieldname': f['fieldname']}):
            df = {
                'doctype': 'Custom Field',
                'dt': 'Mandi Organization',
                'insert_after': 'brand_color',
            }
            df.update(f)
            frappe.get_doc(df).insert(ignore_permissions=True)
            print(f"Added field {f['fieldname']} to Mandi Organization")
    
    frappe.db.commit()

if __name__ == "__main__":
    add_payment_settings_fields()
