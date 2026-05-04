import frappe
frappe.init(site="mandigrow.localhost")
frappe.connect()

items = frappe.get_all("Item", filters={"item_code": "S-MangokesarA1"}, fields=["name", "custom_attributes"], ignore_permissions=True)
for item in items:
    attrs = item.get("custom_attributes")
    print("attrs type:", type(attrs))
    print("attrs:", attrs)
    if attrs:
        parsed = frappe.parse_json(attrs)
        print("parsed:", parsed)
        print("variety:", parsed.get("Variety"))
