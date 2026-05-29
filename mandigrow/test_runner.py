import frappe
from mandigrow.mandigrow.api import create_commodity

def run():
    frappe.session.user = "Administrator"
    try:
        res = create_commodity(**{
            "name": "TestAmla1", 
            "default_unit": "Box", 
            "purchase_price": 100, 
            "opening_stock": 100
        })
        print("Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Exception:", e)
