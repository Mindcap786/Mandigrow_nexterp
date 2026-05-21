import frappe
import mandigrow.api as api
def run():
    try:
        data = api.get_sale_master_data()
        lots = data.get("lots", [])
        if lots:
            print("First 3 lots:")
            for l in lots[:3]:
                print(f"Lot: {l.get('id')}, Arrival Type: {l.get('arrival_type')}")
        else:
            print("No lots found")
    except Exception as e:
        print(f"Error: {e}")
run()
