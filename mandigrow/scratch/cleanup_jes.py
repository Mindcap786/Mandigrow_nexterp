import frappe
def run():
    jes = frappe.db.sql("""
        SELECT DISTINCT je.name
        FROM `tabJournal Entry` je
        JOIN `tabJournal Entry Account` jea ON je.name = jea.parent
        WHERE je.posting_date = %s
          AND je.cheque_no IS NOT NULL AND je.cheque_no != ''
          AND jea.reference_name IS NULL
    """, (frappe.utils.today(),), pluck="name")
    
    print(f"JEs needing fix: {jes}")
    
    for je_name in jes:
        remark = frappe.db.get_value("Journal Entry", je_name, "user_remark")
        import re
        match = re.search(r'(SALE-ORG\d+-\d+-\d+)', remark)
        if match:
            sale_id = match.group(1)
            print(f"Fixing {je_name} -> {sale_id}")
            frappe.db.sql("""
                UPDATE `tabJournal Entry Account`
                SET reference_type = 'Mandi Sale', reference_name = %s
                WHERE parent = %s
            """, (sale_id, je_name))
    
    frappe.db.commit()
run()
