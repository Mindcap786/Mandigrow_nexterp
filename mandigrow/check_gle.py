import frappe
def run():
    res = frappe.db.sql("""
        SELECT voucher_type, voucher_no
        FROM `tabGL Entry`
        LIMIT 5
    """, as_dict=True)
    for r in res:
        print(r)
run()
