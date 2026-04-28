import frappe
from frappe.utils import flt, getdate, today
from mandigrow.logic.automation import _arrival_status, _sale_status, _is_cheque_cleared

def run():
    print("Starting repair of Arrival and Sale records...")
    
    # 1. Repair Mandi Arrival
    arrivals = frappe.get_all("Mandi Arrival", fields=[
        "name", "total_realized", "mandi_total_earnings", "advance", 
        "advance_payment_mode", "advance_cheque_date"
    ])
    
    for arr in arrivals:
        # Correct net_payable_farmer: Gross - Mandi Earnings
        # (NOT subtracting advance anymore)
        new_net_payable = flt(arr.total_realized) - flt(arr.mandi_total_earnings)
        
        mode = (arr.advance_payment_mode or "credit").lower().strip()
        is_cleared = _is_cheque_cleared(mode, arr.advance_cheque_date)
        new_status = _arrival_status(arr.advance, new_net_payable, mode, is_cleared)
        
        frappe.db.set_value("Mandi Arrival", arr.name, {
            "net_payable_farmer": new_net_payable,
            "status": new_status
        }, update_modified=False)
        
        print(f"Updated Arrival {arr.name}: Net={new_net_payable}, Status={new_status}")

    # 2. Repair Mandi Sale
    sales = frappe.get_all("Mandi Sale", fields=[
        "name", "totalamount", "amountreceived", "paymentmode", "chequedate", "duedate"
    ])
    
    for sale in sales:
        mode = (sale.paymentmode or "credit").lower().strip()
        is_cleared = _is_cheque_cleared(mode, sale.chequedate)
        new_status = _sale_status(sale.amountreceived, sale.totalamount, str(sale.duedate), mode, is_cleared)
        
        frappe.db.set_value("Mandi Sale", sale.name, {
            "status": new_status
        }, update_modified=False)
        
        print(f"Updated Sale {sale.name}: Status={new_status}")

    frappe.db.commit()
    print("Repair complete.")

if __name__ == "__main__":
    frappe.init(site="mandigrow.localhost", sites_path="/Users/shauddin/frappe-bench/sites")
    frappe.connect()
    run()
