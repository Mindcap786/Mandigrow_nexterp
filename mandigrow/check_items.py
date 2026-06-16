import frappe, json; def execute():
    for item in frappe.db.get_all("Mandi Sale Item", filters={"parent": "SALE-ORG00001-2026-00203"}, fields=["item_id", "qty", "rate", "amount", "gst_rate", "gst_amount"]): print(item)
