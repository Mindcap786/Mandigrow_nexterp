import frappe

def update_invoice_totals():
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    
    sales = frappe.get_all("Mandi Sale")
    for s in sales:
        doc = frappe.get_doc("Mandi Sale", s.name)
        doc.recalculate_totals()
        doc.db_set("invoice_total", doc.invoice_total, update_modified=False)
    
    frappe.db.commit()
    print(f"Updated {len(sales)} sales.")

if __name__ == "__main__":
    update_invoice_totals()
