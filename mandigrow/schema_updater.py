import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def update_schemas():
    print("Updating Item Schema...")
    item_fields = [
        {"fieldname": "sale_gst_rate", "label": "Sale GST Rate (%)", "fieldtype": "Percent", "insert_after": "gst_rate"},
        {"fieldname": "sale_gst_type", "label": "Sale GST Type", "fieldtype": "Select", "options": "Exclusive\nInclusive", "default": "Exclusive", "insert_after": "sale_gst_rate"},
        {"fieldname": "purchase_gst_rate", "label": "Purchase GST Rate (%)", "fieldtype": "Percent", "insert_after": "sale_gst_type"},
        {"fieldname": "purchase_gst_type", "label": "Purchase GST Type", "fieldtype": "Select", "options": "Exclusive\nInclusive", "default": "Exclusive", "insert_after": "purchase_gst_rate"}
    ]
    for df in item_fields:
        if not frappe.db.exists("Custom Field", f"Item-{df['fieldname']}"):
            create_custom_field("Item", df)
            print(f"Created Item-{df['fieldname']}")

    print("Updating Mandi Lot Schema...")
    lot_fields = [
        {"fieldname": "purchase_gst_rate", "label": "Purchase GST Rate (%)", "fieldtype": "Percent", "insert_after": "supplier_rate"},
        {"fieldname": "purchase_gst_amount", "label": "Purchase GST Amount", "fieldtype": "Currency", "insert_after": "purchase_gst_rate"},
        {"fieldname": "purchase_gst_type", "label": "Purchase GST Type", "fieldtype": "Select", "options": "Exclusive\nInclusive", "insert_after": "purchase_gst_amount"}
    ]
    for df in lot_fields:
        if not frappe.db.exists("Custom Field", f"Mandi Lot-{df['fieldname']}"):
            create_custom_field("Mandi Lot", df)
            print(f"Created Mandi Lot-{df['fieldname']}")
            
    print("Updating Mandi Arrival Schema...")
    arrival_fields = [
        {"fieldname": "purchase_gst_total", "label": "Purchase GST Total", "fieldtype": "Currency", "insert_after": "total_expenses"}
    ]
    for df in arrival_fields:
        if not frappe.db.exists("Custom Field", f"Mandi Arrival-{df['fieldname']}"):
            create_custom_field("Mandi Arrival", df)
            print(f"Created Mandi Arrival-{df['fieldname']}")
    
    print("Schema updates complete.")
