import frappe
from frappe.utils import flt
frappe.init(site='mandigrow.localhost', sites_path='/Users/shauddin/frappe-bench/sites')
frappe.connect()

print("Backpatching GL Entries via User Remark matching...")

# 1. Match Arrivals
arrivals = frappe.get_all('Mandi Arrival', filters={'docstatus': 1}, fields=['name', 'contact_bill_no'])
count_arr = 0
for arr in arrivals:
    bill_ref = f"Bill #{arr.contact_bill_no}" if arr.contact_bill_no else f"Arrival {arr.name}"
    
    # Goods JE remark starts with "Purchase Bill" or "Goods received"
    # Advance JE remark starts with "Advance paid"
    jes = frappe.get_all('Journal Entry', filters=[
        ['user_remark', 'like', f'%{arr.contact_bill_no}%'],
        ['docstatus', '=', 1]
    ], fields=['name', 'user_remark'])
    
    for je in jes:
        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET against_voucher_type = 'Mandi Arrival', against_voucher = %s
            WHERE voucher_no = %s AND voucher_type = 'Journal Entry' AND is_cancelled = 0
        """, (arr.name, je.name))
        count_arr += 1

# 2. Match Sales
sales = frappe.get_all('Mandi Sale', filters={'docstatus': 1}, fields=['name'])
count_sale = 0
for sale in sales:
    # Sale JE remarks usually contain the doc name
    jes = frappe.get_all('Journal Entry', filters=[
        ['user_remark', 'like', f'%{sale.name}%'],
        ['docstatus', '=', 1]
    ], fields=['name'])
    
    for je in jes:
        frappe.db.sql("""
            UPDATE `tabGL Entry`
            SET against_voucher_type = 'Mandi Sale', against_voucher = %s
            WHERE voucher_no = %s AND voucher_type = 'Journal Entry' AND is_cancelled = 0
        """, (sale.name, je.name))
        count_sale += 1

frappe.db.commit()
print(f"Done! Backpatched {count_arr} Arrival JEs and {count_sale} Sale JEs.")
