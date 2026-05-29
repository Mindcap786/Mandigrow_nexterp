import frappe

def run():
    # Fields to add to Mandi Lot
    mandi_lot_fields = [
        {"fieldname": "hsn_code", "label": "HSN Code", "fieldtype": "Data", "insert_after": "item_id"},
        {"fieldname": "gst_rate", "label": "GST Rate (%)", "fieldtype": "Float", "insert_after": "hsn_code"},
        {"fieldname": "gst_amount", "label": "GST Amount", "fieldtype": "Currency", "insert_after": "gst_rate"},
        {"fieldname": "purchase_gst_type", "label": "Purchase GST Type", "fieldtype": "Select", "options": "\nInclusive\nExclusive", "insert_after": "gst_amount"}
    ]
    
    # Fields to add to Mandi Arrival
    mandi_arrival_fields = [
        {"fieldname": "cgst_amount", "label": "CGST", "fieldtype": "Currency", "insert_after": "other_expenses"},
        {"fieldname": "sgst_amount", "label": "SGST", "fieldtype": "Currency", "insert_after": "cgst_amount"},
        {"fieldname": "igst_amount", "label": "IGST", "fieldtype": "Currency", "insert_after": "sgst_amount"},
        {"fieldname": "gst_total", "label": "GST Total", "fieldtype": "Currency", "insert_after": "igst_amount"}
    ]
    
    try:
        # Add to Mandi Lot
        lot_doc = frappe.get_doc("DocType", "Mandi Lot")
        existing_lot_fields = [f.fieldname for f in lot_doc.fields]
        for field in mandi_lot_fields:
            if field["fieldname"] not in existing_lot_fields:
                lot_doc.append("fields", field)
        lot_doc.save()
        
        # Add to Mandi Arrival
        arr_doc = frappe.get_doc("DocType", "Mandi Arrival")
        existing_arr_fields = [f.fieldname for f in arr_doc.fields]
        for field in mandi_arrival_fields:
            if field["fieldname"] not in existing_arr_fields:
                arr_doc.append("fields", field)
        arr_doc.save()
        
        frappe.db.commit()
        print("Successfully added fields")
    except Exception as e:
        print(f"Error: {e}")

