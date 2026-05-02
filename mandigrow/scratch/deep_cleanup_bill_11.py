import frappe
import sys
import os

# Add apps path to sys.path
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))

from mandigrow.logic.automation import post_arrival_ledger

def run():
    doc_name = "ARR-ORG00002-2026-00011"
    
    # 1. Identify all JEs linked to this specific arrival
    # We search by user_remark because it's consistently tagged
    jes = frappe.get_all("Journal Entry", 
        filters={"user_remark": ["like", f"%Bill #11%"]}, 
        fields=["name"]
    )
    
    je_names = [j.name for j in jes]
    print(f"Purging corrupted JEs: {je_names}")
    
    if je_names:
        # Delete GL Entries first (the links that block deletion)
        frappe.db.sql(f"DELETE FROM `tabGL Entry` WHERE voucher_no IN %s", (tuple(je_names),))
        
        # Delete the Journal Entry records themselves
        frappe.db.sql(f"DELETE FROM `tabJournal Entry` WHERE name IN %s", (tuple(je_names),))
        frappe.db.sql(f"DELETE FROM `tabJournal Entry Account` WHERE parent IN %s", (tuple(je_names),))
        
        frappe.db.commit()
        print("Scrubbing complete.")

    # 2. Re-generate the correct ledger entries
    doc = frappe.get_doc("Mandi Arrival", doc_name)
    print(f"Reposing Ledger for {doc_name}...")
    try:
        post_arrival_ledger(doc)
        frappe.db.commit()
        print("Success! Ledger is now clean and accurate.")
    except Exception as e:
        print(f"Error during final repost: {e}")
        frappe.db.rollback()

run()
