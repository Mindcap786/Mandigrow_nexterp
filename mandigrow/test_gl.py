import frappe

def test():
    q = """
                SELECT gl.voucher_no, gl.debit, gl.credit, gl.against_voucher, se.voucher_type
                FROM `tabGL Entry` gl
                LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
                WHERE gl.is_cancelled = 0 AND gl.company = 'SYED MANDI'
                AND gl.party IN ('shahul')
    """
    entries = frappe.db.sql(q, as_dict=True)
    print(entries)
