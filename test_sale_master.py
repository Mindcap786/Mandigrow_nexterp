import frappe

def run():
    from mandigrow.api import get_sale_master_data
    print(get_sale_master_data("ORG-00001").get("items", [])[:5])
