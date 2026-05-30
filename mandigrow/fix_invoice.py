import frappe

def run():
    sale_id = 'SALE-ORG00001-2026-00156'
    try:
        doc = frappe.get_doc('Mandi Sale', sale_id)
        if doc.docstatus == 1:
            # We need to cancel and recreate to fix the ledgers properly, or just update the GL entries directly.
            # Updating GL entries and the document directly is faster for a simple 8 rupees fix without breaking downstream logic.
            
            # The issue is doc.gsttotal is 300, it should be 291.26.
            # doc.totalamount is 9708.74
            # total should be 10000.
            
            # 1. Update the Mandi Sale document
            frappe.db.set_value('Mandi Sale', sale_id, 'gsttotal', 291.26)
            frappe.db.set_value('Mandi Sale', sale_id, 'cgst_amount', 145.63)
            frappe.db.set_value('Mandi Sale', sale_id, 'sgst_amount', 145.63)
            
            # 2. Update the Journal Entry
            je_name = frappe.db.get_value("Journal Entry Account", {"reference_type": "Mandi Sale", "reference_name": sale_id}, "parent")
            
            if je_name:
                je = frappe.get_doc("Journal Entry", je_name)
                # It's submitted, we can cancel and re-submit with correct amounts
                je.cancel()
                
                # Update the rows.
                # Find the GST rows (150 each) and change to 145.63
                # Find the Debtor row (10008.74) and change to 10000
                total_credit = 0
                total_debit = 0
                for row in je.accounts:
                    if row.credit == 150:
                        row.credit = 145.63
                    elif row.credit == 300:
                        row.credit = 291.26
                    
                    if row.debit == 10009 or row.debit == 10008.74:
                        row.debit = 10000
                        
                    total_credit += row.credit
                    total_debit += row.debit
                
                je.total_debit = total_debit
                je.total_credit = total_credit
                je.submit()
            
            frappe.db.commit()
            print("Successfully fixed invoice " + sale_id)
        else:
            print("Invoice not found or not submitted")
    except Exception as e:
        print("Error: " + str(e))
