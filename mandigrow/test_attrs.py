import frappe

def execute():
    items = frappe.get_all("Item", filters={"item_code": "S-MangokesarA1"}, fields=["name", "custom_attributes"], ignore_permissions=True)
    for item in items:
        attrs = item.get("custom_attributes")
        print("Raw attrs type:", type(attrs))
        print("Raw attrs:", attrs)
        if attrs:
            parsed = frappe.parse_json(attrs)
            print("Parsed attrs type:", type(parsed))
            print("Parsed attrs:", parsed)
            print("Variety:", parsed.get("Variety"))
            
    return "Done"
