import frappe
def execute():
    try:
        frappe.db.sql("ALTER TABLE `tabMandi Organization` ADD COLUMN rbac_matrix LONGTEXT")
        frappe.db.commit()
        print("Column added successfully!")
    except Exception as e:
        print("Error:", e)
