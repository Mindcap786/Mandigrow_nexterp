import frappe
def run():
    cols = frappe.db.get_table_columns("GL Entry")
    print(f"GL Entry columns: {cols}")
run()
