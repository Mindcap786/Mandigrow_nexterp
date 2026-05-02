import frappe
import sys
import os

# Add apps path to sys.path
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))

from mandigrow.logic.automation import post_arrival_ledger

def run():
    doc_name = "ARR-ORG00003-2026-00001"
    doc = frappe.get_doc("Mandi Arrival", doc_name)
    
    print(f"Reposing Ledger for {doc_name}...")
    try:
        post_arrival_ledger(doc)
        frappe.db.commit()
        print("Success! Data restored.")
    except Exception as e:
        print(f"Error during repost: {e}")
        frappe.db.rollback()

run()
