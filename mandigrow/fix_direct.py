import frappe
from mandigrow.api import repair_arrival_financials

def execute():
    arrivals = frappe.get_all("Mandi Arrival", filters={"purchase_type": "Direct"}, pluck="name")
    print(f"Found {len(arrivals)} Direct Arrivals.")
    for a in arrivals:
        print(f"Repairing {a}...")
        try:
            doc = frappe.get_doc("Mandi Arrival", a)
            doc.save() # This triggers _recompute_summary
            repair_arrival_financials(a)
            frappe.db.commit()
        except Exception as e:
            print(f"Failed {a}: {e}")
            frappe.db.rollback()
    print("Done")
