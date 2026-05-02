import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00081"
    
    jes_all = frappe.db.sql("""
        SELECT name, cheque_no, clearance_date 
        FROM `tabJournal Entry` 
        WHERE user_remark LIKE %s
    """, (f"%{sale_name}%",), as_dict=True)
    
    print("\nAll JEs associated with this sale:")
    for je in jes_all:
        print(f"All JE: {je.name}, cheque_no={je.cheque_no}")
