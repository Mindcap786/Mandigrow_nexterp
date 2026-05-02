import frappe
import sys
import os

# Add apps path to sys.path
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))

from mandigrow.mandigrow.logic.automation import post_arrival_ledger

def run():
    doc_name = "ARR-ORG00002-2026-00011"
    doc = frappe.get_doc("Mandi Arrival", doc_name)
    
    # 1. Find all Journal Entries for this arrival
    jes = frappe.get_all("Journal Entry", 
        filters={"user_remark": ["like", f"%Bill #11%"]}, 
        fields=["name", "docstatus"]
    )
    
    print(f"Found corrupted JEs: {[j.name for j in jes]}")
    
    # 2. Cancel and Delete them
    for j in jes:
        try:
            je_doc = frappe.get_doc("Journal Entry", j.name)
            if je_doc.docstatus == 1:
                je_doc.cancel()
            je_doc.delete()
            print(f"Deleted {j.name}")
        except Exception as e:
            print(f"Could not delete {j.name}: {e}")

    # 3. Re-post using the fixed logic
    print(f"Reposing Ledger for {doc_name}...")
    try:
        post_arrival_ledger(doc)
        frappe.db.commit()
        print("Success! Data cleaned and restored.")
    except Exception as e:
        print(f"Error during repost: {e}")
        frappe.db.rollback()

run()
