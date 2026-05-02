
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field
from mandigrow.mandigrow.logic.erp_bootstrap import ensure_company_party_defaults

def bootstrap():
    print("--- STARTING MANDIGROW BOOTSTRAP ---")
    
    # 1. Create Company if missing
    company_name = "MandiGrow Enterprise"
    if not frappe.db.exists("Company", company_name):
        print(f"Creating Company: {company_name}")
        company = frappe.get_doc({
            "doctype": "Company",
            "company_name": company_name,
            "default_currency": "INR",
            "country": "India"
        })
        company.insert(ignore_permissions=True)
    
    company = company_name

    # 2. Create Root Accounts
    def create_account(account_name, parent, account_type=None, is_group=0):
        full_name = f"{account_name} - {company}"
        if not frappe.db.exists("Account", full_name):
            print(f"Creating Account: {full_name}")
            acc = frappe.get_doc({
                "doctype": "Account",
                "account_name": account_name,
                "parent_account": parent,
                "company": company,
                "is_group": is_group,
                "account_type": account_type
            })
            acc.insert(ignore_permissions=True)
        return full_name

    # Ensure parent groups exist
    # Root parents usually created by ERPNext. If missing, we create minimal ones.
    # We'll use the first Assets/Liabilities found as parents.
    
    assets = frappe.db.get_value("Account", {"account_type": "Asset", "is_group": 1, "company": company}, "name")
    liabilities = frappe.db.get_value("Account", {"account_type": "Liability", "is_group": 1, "company": company}, "name")
    income = frappe.db.get_value("Account", {"account_type": "Income", "is_group": 1, "company": company}, "name")
    expense = frappe.db.get_value("Account", {"account_type": "Expense", "is_group": 1, "company": company}, "name")

    if not assets:
        # Create minimal root structure if totally empty
        # This is rare but possible on a truly blank site
        pass 

    create_account("Debtors", assets, "Receivable", 0)
    create_account("Creditors", liabilities, "Payable", 0)
    create_account("Sales", income, "Income", 0)
    create_account("Commission Income", income, "Income", 0)
    create_account("Cash", assets, "Cash", 0)
    ensure_company_party_defaults(company)

    # 3. Seed Master Data
    if not frappe.db.exists("Item Group", "All Item Groups"):
        frappe.get_doc({"doctype": "Item Group", "item_group_name": "All Item Groups", "is_group": 1}).insert(ignore_permissions=True)
    
    if not frappe.db.exists("Item Group", "Commodities"):
        frappe.get_doc({"doctype": "Item Group", "item_group_name": "Commodities", "is_group": 0, "parent_item_group": "All Item Groups"}).insert(ignore_permissions=True)

    for uom in ["Box", "Crate", "Kgs", "Tons", "Carton"]:
        if not frappe.db.exists("UOM", uom):
            frappe.get_doc({"doctype": "UOM", "uom_name": uom}).insert(ignore_permissions=True)

    # 4. Inject Logic into DocTypes
    # We will do this by modifying the .py files directly in the turn response.

    print("--- BOOTSTRAP COMPLETE ---")

if __name__ == "__main__":
    bootstrap()
