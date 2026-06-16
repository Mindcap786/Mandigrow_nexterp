import frappe, json; def execute(): doc = frappe.get_doc("Mandi Sale", "SALE-ORG00001-2026-00203"); print(json.dumps(doc.as_dict(), default=str))
