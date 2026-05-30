import frappe
def execute():
    items = frappe.db.sql("SELECT name, disabled, item_name, item_code FROM tabItem WHERE disabled = 1", as_dict=1)
    for i in items:
        print(i)
