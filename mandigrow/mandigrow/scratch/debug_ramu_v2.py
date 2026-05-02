import frappe
def run():
    contact = frappe.get_all("Mandi Contact", filters={"full_name": ["like", "%ramu%"]}, fields=["name", "full_name"])
    print(f"Contact: {contact}")
    
    if contact:
        cid = contact[0].name
        arrival = frappe.get_all("Mandi Arrival", 
            filters={"party_id": cid}, 
            fields=["name", "net_payable_farmer", "total_commission", "total_expenses", "advance", "status"]
        )
        print(f"Arrivals: {arrival}")
        
        for a in arrival:
            gl = frappe.get_all("GL Entry", 
                filters={"voucher_no": a.name}, 
                fields=["account", "debit", "credit", "party"]
            )
            print(f"GL for {a.name}: {gl}")

run()
