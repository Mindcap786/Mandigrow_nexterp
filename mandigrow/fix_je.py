import frappe

def execute():
    try:
        # Tag the GL entries from the receipt JE against the sale invoice
        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET against_voucher_type = 'Mandi Sale',
                against_voucher = 'SALE-ORG00002-2026-00012'
            WHERE voucher_no = 'ACC-JV-2026-00185'
              AND is_cancelled = 0
        """)
        frappe.db.commit()
        # Verify
        rows = frappe.db.sql("""
            SELECT account, debit, credit, against_voucher
            FROM `tabGL Entry`
            WHERE voucher_no = 'ACC-JV-2026-00185'
        """, as_dict=True)
        print("Updated GL entries:", rows)
    except Exception as e:
        frappe.db.rollback()
        print("Error:", frappe.get_traceback())
