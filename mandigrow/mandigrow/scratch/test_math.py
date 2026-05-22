import frappe

def execute():
    # Create a dummy Direct purchase arrival
    doc = frappe.new_doc("Mandi Arrival")
    doc.supplier = "abid"  
    doc.party_id = "abid"
    doc.arrival_type = "direct"
    doc.hire_charges = 300
    doc.hamali_expenses = 0
    doc.append("items", {
        "item_id": "BANANA",
        "qty": 100,
        "less_units": 10,
        "supplier_rate": 100,
        "packing_cost": 200,
        "loading_cost": 0,
        "farmer_charges": 100,
    })
    
    # Run the exact summary logic
    doc._recompute_summary()
    
    print(f"Total Realized: {doc.total_realized}")
    print(f"Total Expenses: {doc.total_expenses}")
    print(f"Mandi Total Earnings: {doc.mandi_total_earnings}")
    print(f"Net Payable Farmer: {doc.net_payable_farmer}")
