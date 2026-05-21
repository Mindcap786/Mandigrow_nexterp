import frappe

def run():
    bad_je = frappe.db.sql("""
        SELECT DISTINCT je.name
        FROM `tabJournal Entry` je
        JOIN `tabJournal Entry Account` jea ON jea.parent = je.name
        JOIN `tabAccount` acc ON acc.name = jea.account
        WHERE je.voucher_type = 'Journal Entry'
          AND acc.root_type = 'Equity'
          AND je.docstatus = 1
    """, as_dict=True)

    print(f"Found {len(bad_je)} potentially bad JEs")
    fixed = 0
    for j in bad_je:
        frappe.db.sql("UPDATE `tabJournal Entry` SET voucher_type='Opening Entry' WHERE name=%s", (j.name,))
        frappe.db.sql("UPDATE `tabGL Entry` SET is_opening='Yes' WHERE voucher_no=%s AND is_cancelled=0", (j.name,))
        print(f"  FIXED: {j.name}")
        fixed += 1

    frappe.db.commit()
    print(f"Fixed {fixed} entries.")
