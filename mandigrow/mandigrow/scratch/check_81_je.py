import frappe
def run():
    sale_name = "SALE-ORG00002-2026-00081"
    
    jes_all = frappe.db.sql("""
        SELECT name, cheque_no, cheque_date, posting_date, clearance_date, docstatus 
        FROM `tabJournal Entry` 
        WHERE user_remark LIKE %s
    """, (f"%{sale_name}%",), as_dict=True)
    
    print("\nAll JEs associated with this sale:")
    for je in jes_all:
        print(f"JE: {je.name}, cheque_no={je.cheque_no}, docstatus={je.docstatus}, cheque_date={je.cheque_date}, posting_date={je.posting_date}, clearance_date={je.clearance_date}")
        
    print("\nEvaluating condition: je.clearance_date == COALESCE(je.cheque_date, je.posting_date)")
    for je in jes_all:
        cd = je.clearance_date
        chd = je.cheque_date
        pd = je.posting_date
        coalesce = chd if chd else pd
        print(f"JE: {je.name}, {cd} == {coalesce} ? {cd == coalesce}")
