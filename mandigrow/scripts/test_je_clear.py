import frappe
from frappe.utils import today

def execute():
    je = frappe.get_doc({
        "doctype": "Journal Entry",
        "company": "MandiGrow Enterprise",
        "voucher_type": "Journal Entry",
        "posting_date": today(),
        "cheque_no": "TEST-123",
        "cheque_date": today(),
        "clearance_date": today(),
        "accounts": [
            {
                "account": "Creditors - ME",
                "debit_in_account_currency": 100,
                "cost_center": "Main - ME",
                "party_type": "Supplier",
                "party": "SUPP-00001"
            },
            {
                "account": "Bank Account - ME",
                "credit_in_account_currency": 100,
                "cost_center": "Main - ME",
            }
        ]
    })
    je.insert(ignore_permissions=True)
    print("Created:", je.name, je.cheque_no, je.cheque_date, je.clearance_date)
