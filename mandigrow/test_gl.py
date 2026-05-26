import frappe

def execute():
    entries = frappe.db.sql("""
        SELECT gl.name, gl.posting_date, gl.debit, gl.credit, gl.party_type, gl.party, je.clearance_date
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE gl.party IN (
            SELECT name FROM `tabSupplier` WHERE name LIKE '%MD%' OR supplier_name LIKE '%MD%'
        ) OR gl.party='MD'
    """, as_dict=True)
    print("GL Entries for MD:")
    for e in entries:
        print(e)
