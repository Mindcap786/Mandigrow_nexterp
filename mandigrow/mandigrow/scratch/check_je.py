import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00076"
    
    entries = frappe.db.sql("""
        SELECT parent, docstatus
        FROM `tabJournal Entry Account`
        WHERE reference_name = %s
    """, (sale_name,), as_dict=True)
    
    print(f"JEs for {sale_name}:")
    for e in entries:
        print(f"JE: {e.parent}, docstatus: {e.docstatus}")
