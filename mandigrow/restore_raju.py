import frappe
from frappe import _

def restore_raju_ledger():
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    
    # Data captured from history
    jes_to_restore = [
        {"name": "ACC-JV-2026-00222", "amount": 200, "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00026"},
        {"name": "ACC-JV-2026-00227", "amount": 200, "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00029"},
        {"name": "ACC-JV-2026-00229", "amount": 50,  "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00030"},
        {"name": "ACC-JV-2026-00231", "amount": 50,  "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00031"},
        {"name": "ACC-JV-2026-00233", "amount": 201, "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00032"},
        {"name": "ACC-JV-2026-00235", "amount": 190, "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00033"},
        {"name": "ACC-JV-2026-00241", "amount": 1950, "date": "2026-04-30", "sale": "SALE-ORG00002-2026-00036"},
        # Historical credits
        {"name": "ACC-JV-2026-00203", "amount": 10000, "date": "2026-04-29", "sale": None},
        {"name": "ACC-JV-2026-00211", "amount": 1500,  "date": "2026-04-30", "sale": None},
        {"name": "ACC-JV-2026-00216", "amount": 500,   "date": "2026-04-29", "sale": None},
    ]
    
    party = "Raju (ORG-00002)"
    company = "MandiGrow Enterprise"
    receivable_account = "Debtors - MandiGrow Enterprise"
    bank_account = "Cash - MandiGrow Enterprise"
    
    for item in jes_to_restore:
        if frappe.db.exists("Journal Entry", item["name"]):
            print(f"Skip: {item['name']} already exists")
            continue
            
        print(f"Restoring {item['name']}...")
        je = frappe.new_doc("Journal Entry")
        je.name = item["name"]
        je.voucher_type = "Journal Entry"
        je.company = company
        je.posting_date = item["date"]
        je.user_remark = f"Restored: Payment for {item['sale'] or 'Standalone'} — Raju"
        
        je.append("accounts", {
            "account": receivable_account,
            "party_type": "Customer",
            "party": party,
            "credit_in_account_currency": item["amount"],
            "account_currency": "INR",
            "exchange_rate": 1
        })
        
        je.append("accounts", {
            "account": bank_account,
            "debit_in_account_currency": item["amount"],
            "account_currency": "INR",
            "exchange_rate": 1
        })
        
        je.flags.ignore_permissions = True
        je.insert()
        je.submit()
        
        if item["sale"]:
            from mandigrow.mandigrow.logic.automation import _tag_gl_entries
            _tag_gl_entries(je.name, "Mandi Sale", item["sale"])
            
        print(f"Successfully restored {je.name}")

    # Repair settlements
    from mandigrow.mandigrow.api import repair_all_settlements
    repair_all_settlements()
    frappe.db.commit()

if __name__ == "__main__":
    restore_raju_ledger()
