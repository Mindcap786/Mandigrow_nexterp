import frappe
def run():
    cols = frappe.db.get_table_columns("Item")
    print(f"Item columns: {cols}")
run()
