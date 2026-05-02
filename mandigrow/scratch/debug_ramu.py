import frappe
def run():
    # Find the arrival for ramu
    arrival = frappe.get_all("Mandi Arrival", 
        filters={"party_id": ["like", "%ramu%"]}, 
        fields=["name", "net_payable_farmer", "total_commission", "total_expenses", "advance", "status"]
    )
    print(f"Arrival: {arrival}")
    
    if arrival:
        # Check GL Entries
        gl = frappe.get_all("GL Entry", 
            filters={"voucher_no": arrival[0].name}, 
            fields=["account", "debit", "credit", "party"]
        )
        print(f"GL Entries: {gl}")
        
        # Check if Cash account exists
        cash = frappe.db.get_value("Account", {"account_type": "Cash", "company": frappe.db.get_value("Mandi Arrival", arrival[0].name, "erp_company")}, "name")
        print(f"Cash Account: {cash}")

run()
