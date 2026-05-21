import frappe
def run():
    company = frappe.db.get_single_value("Global Defaults", "default_company")
    res = frappe.db.sql("""
        SELECT 
            c.name as contact_id, 
            c.full_name as contact_name, 
            (SELECT SUM(gl.debit - gl.credit)
                 FROM `tabGL Entry` gl
                 LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                 WHERE gl.is_cancelled = 0
                   AND gl.company = %(company)s
                   AND gl.party = c.name
                   AND COALESCE(je.clearance_date, gl.posting_date) <= CURDATE()
            ) as net_balance_date,
            (SELECT SUM(gl.debit - gl.credit)
                 FROM `tabGL Entry` gl
                 WHERE gl.is_cancelled = 0
                   AND gl.company = %(company)s
                   AND gl.party = c.name
            ) as net_balance_no_date
        FROM `tabMandi Contact` c
        WHERE c.full_name IN ('asif', 'Shaik', 'karamat', 'Amjad', 'habeeb', 'raja')
    """, {"company": company}, as_dict=True)
    for r in res:
        print(f"{r.contact_name}: date_bal={r.net_balance_date}, no_date_bal={r.net_balance_no_date}")
run()
