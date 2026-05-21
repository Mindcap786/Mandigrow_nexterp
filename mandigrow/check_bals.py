import frappe
def run():
    company = frappe.db.get_single_value("Global Defaults", "default_company")
    res = frappe.db.sql("""
        SELECT 
            c.name as contact_id, 
            c.full_name as contact_name, 
            (SELECT SUM(gl.debit - gl.credit)
                 FROM `tabGL Entry` gl
                 WHERE gl.is_cancelled = 0
                   AND gl.company = %(company)s
                   AND gl.party = c.name
            ) as net_balance
        FROM `tabMandi Contact` c
        WHERE c.full_name IN ('asif', 'Shaik', 'Amjad', 'karamat')
    """, {"company": company}, as_dict=True)
    for r in res:
        print(f"{r.contact_name}: {r.net_balance}")
run()
