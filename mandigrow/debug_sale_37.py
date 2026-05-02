import frappe
from mandigrow.api import _get_user_org

def debug_sale_37():
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    
    sale_name = 'SALE-ORG00002-2026-00037'
    org_id = 'ORG-00002' # Based on the sale name
    
    # Get sale details
    sale = frappe.db.sql("""
        SELECT name, buyerid,
               (IFNULL(totalamount,0) + IFNULL(loadingcharges,0) + IFNULL(unloadingcharges,0)
                + IFNULL(otherexpenses,0) + IFNULL(gsttotal,0) - IFNULL(discountamount,0)) as invoice_total
        FROM `tabMandi Sale`
        WHERE name = %s
    """, (sale_name,), as_dict=True)[0]
    
    contact = frappe.get_doc("Mandi Contact", sale.buyerid)
    party_list = [contact.name]
    if contact.customer: party_list.append(contact.customer)
    
    total = float(sale.invoice_total or 0)
    
    linked_paid = frappe.db.sql("""
        SELECT SUM(credit) FROM `tabGL Entry`
        WHERE is_cancelled = 0 AND party IN %s 
        AND against_voucher = %s AND credit > 0
    """, (tuple(party_list), sale.name))[0][0] or 0
    
    print(f"Sale: {sale_name}")
    print(f"Invoice Total: {total}")
    print(f"Party List: {party_list}")
    print(f"Linked Paid: {linked_paid}")
    
    if linked_paid >= (total - 0.01):
        print("Setting status to Paid")
        frappe.db.set_value("Mandi Sale", sale.name, {"amountreceived": total, "status": "Paid"}, update_modified=False)
        frappe.db.commit()
        print("Committed")
    else:
        print(f"Status not paid: {linked_paid} < {total}")

if __name__ == "__main__":
    debug_sale_37()
