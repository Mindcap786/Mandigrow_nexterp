import frappe
from mandigrow.api import repair_arrival_financials

def execute():
    try:
        arrivals = frappe.get_all("Mandi Arrival", filters={"arrival_type": "direct"})
        for arr in arrivals:
            print(f"Repairing {arr.name}")
            repair_arrival_financials(arr.name)
        frappe.db.commit()
        print("Done")
    except Exception as e:
        print(f"Error: {e}")
