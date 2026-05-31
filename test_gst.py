import frappe

frappe.init(site="mandigrow.com")
frappe.connect()

lots = frappe.get_all("Mandi Lot", filters={"purchase_gst_type": "Inclusive"}, fields=["name", "parent", "purchase_gst_type", "purchase_gst_rate", "purchase_gst_amount"], limit=1)

if lots:
    lot_id = lots[0].name
    print(f"Found lot: {lots[0]}")
    import json
    from mandigrow.api import get_purchase_bill_details
    # Mock user context if needed, but allow_guest=False might require session.
    # We can just directly call it if we mock the session or just print the dict.
    
    # Better yet, let's just inspect the lot in DB
    print(frappe.db.get_value("Mandi Lot", lot_id, "purchase_gst_type"))
else:
    print("No inclusive lots found")

frappe.destroy()
