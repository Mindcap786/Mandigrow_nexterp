import frappe
frappe.init(site='mandigrow.localhost', sites_path='/Users/shauddin/frappe-bench/sites')
frappe.connect()

print('Backpatching GL Entries...')

# 1. Backpatch Arrival JEs
arrival_jes = frappe.db.sql("""
    SELECT DISTINCT je.name, acc.reference_name
    FROM `tabJournal Entry` je
    JOIN `tabJournal Entry Account` acc ON je.name = acc.parent
    WHERE je.docstatus = 1 
      AND acc.reference_type = 'Mandi Arrival'
      AND acc.reference_name IS NOT NULL
""", as_dict=True)

count_arr = 0
for je in arrival_jes:
    frappe.db.sql("""
        UPDATE `tabGL Entry`
        SET against_voucher_type = 'Mandi Arrival', against_voucher = %s
        WHERE voucher_no = %s AND voucher_type = 'Journal Entry' AND is_cancelled = 0
    """, (je.reference_name, je.name))
    count_arr += 1

# 2. Backpatch Sale JEs
sale_jes = frappe.db.sql("""
    SELECT DISTINCT je.name, acc.reference_name
    FROM `tabJournal Entry` je
    JOIN `tabJournal Entry Account` acc ON je.name = acc.parent
    WHERE je.docstatus = 1 
      AND acc.reference_type = 'Mandi Sale'
      AND acc.reference_name IS NOT NULL
""", as_dict=True)

count_sale = 0
for je in sale_jes:
    frappe.db.sql("""
        UPDATE `tabGL Entry`
        SET against_voucher_type = 'Mandi Sale', against_voucher = %s
        WHERE voucher_no = %s AND voucher_type = 'Journal Entry' AND is_cancelled = 0
    """, (je.reference_name, je.name))
    count_sale += 1

frappe.db.commit()
print(f'Done! Backpatched {count_arr} Arrival JEs and {count_sale} Sale JEs.')
