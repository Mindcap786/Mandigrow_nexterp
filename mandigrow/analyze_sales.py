import frappe

def analyze():
    # Check if there are any Mandi Sales where invoice_total != sum of GL debits
    sales = frappe.db.sql("""
        SELECT ms.name, ms.invoice_total, SUM(gl.debit) as gl_debit
        FROM `tabMandi Sale` ms
        JOIN `tabGL Entry` gl ON gl.voucher_no = ms.name AND gl.voucher_type = 'Mandi Sale'
        WHERE ms.docstatus = 1 AND gl.party IS NOT NULL AND gl.party != ''
        GROUP BY ms.name
        HAVING ms.invoice_total != SUM(gl.debit)
        LIMIT 5
    """, as_dict=True)
    
    print("Mandi Sales where invoice_total != GL Debit:")
    for s in sales:
        print(s)
