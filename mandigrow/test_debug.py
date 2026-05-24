import frappe

def run():
    sales = frappe.get_all("Mandi Sale", filters={"name": ["like", "%-00010"]}, fields=["name", "saledate", "totalamount", "discountamount"], order_by="creation desc", limit=12)
    for s in sales:
        items = frappe.get_all("Mandi Sale Item", filters={"parent": s.name}, fields=["item_id", "lot_id", "qty", "amount"])
        print(s.name, s.totalamount, s.discountamount, "Items:", items)

    # Let's also just fetch all sales from today for ORG00011
    sales = frappe.get_all("Mandi Sale", filters={"organization_id": "ORG00011"}, fields=["name", "totalamount", "discountamount"], order_by="creation desc", limit=10)
    print("\nRecent ORG00011 Sales:")
    for s in sales:
        items = frappe.get_all("Mandi Sale Item", filters={"parent": s.name}, fields=["item_id", "lot_id", "qty", "amount"])
        print(s.name, s.totalamount, s.discountamount, "Items:", items)
