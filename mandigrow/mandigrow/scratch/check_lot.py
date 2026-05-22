import frappe

def execute():
    try:
        arrivals = frappe.get_all("Mandi Arrival", order_by="creation desc", limit=20)
        for arr_ref in arrivals:
            arr = frappe.get_doc("Mandi Arrival", arr_ref.name)
            print(f"Arrival: {arr.name}, Type={arr.arrival_type}, Bill No={arr.contact_bill_no}")
            print(f"Arrival Totals: Realized={arr.total_realized}, Expenses={arr.total_expenses}, Earnings={arr.mandi_total_earnings}, Net Payable={arr.net_payable_farmer}")
            for item in arr.items:
                print(f"  - Lot: Qty={item.qty}, Less={item.less_units}, Rate={item.supplier_rate}, NetAmt={item.net_amount}, FarmerCharge={item.farmer_charges}")
            print("-" * 40)
    except Exception as e:
        print(f"Error: {e}")
