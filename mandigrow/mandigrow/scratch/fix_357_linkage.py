import frappe
def run():
    sale_id = "SALE-ORG00002-2026-00081"
    jes = ["ACC-JV-2026-00356", "ACC-JV-2026-00357"]
    
    for je in jes:
        frappe.db.sql("""
            UPDATE `tabJournal Entry Account`
            SET reference_type = 'Mandi Sale', reference_name = %s
            WHERE parent = %s
        """, (sale_id, je))
    
    frappe.db.commit()
    print(f"Manually tagged JEs for {sale_id}")
run()
