import frappe

def create_mandi_contact_doctype():
    if not frappe.db.exists("DocType", "Mandi Contact"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Contact",
            "custom": 0,
            "autoname": "field:full_name", # Use full_name for ID
            "fields": [
                {"fieldname": "full_name", "fieldtype": "Data", "label": "Full Name", "reqd": 1, "in_list_view": 1},
                {"fieldname": "contact_type", "fieldtype": "Select", "label": "Contact Type", "options": "farmer\nbuyer\nsupplier\nstaff", "default": "farmer", "in_list_view": 1},
                {"fieldname": "internal_id", "fieldtype": "Data", "label": "Internal ID / Code", "in_list_view": 1},
                {"fieldname": "phone", "fieldtype": "Phone", "label": "Phone", "in_list_view": 1},
                {"fieldname": "city", "fieldtype": "Data", "label": "City / Village", "in_list_view": 1},
                {"fieldname": "address", "fieldtype": "Small Text", "label": "Address"},
                {"fieldname": "sb_erpnext", "fieldtype": "Section Break", "label": "ERPNext Integration"},
                {"fieldname": "supplier", "fieldtype": "Link", "label": "Linked Supplier", "options": "Supplier", "read_only": 1},
                {"fieldname": "customer", "fieldtype": "Link", "label": "Linked Customer", "options": "Customer", "read_only": 1}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}]
        })
        doc.insert()
        print("Created/Updated Mandi Contact DocType")

def create_mandi_arrival_doctype():
    if not frappe.db.exists("DocType", "Mandi Lot"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Lot",
            "istable": 1,
            "fields": [
                {"fieldname": "item_id", "fieldtype": "Link", "label": "Item", "options": "Item", "reqd": 1},
                {"fieldname": "qty", "fieldtype": "Float", "label": "Quantity", "reqd": 1},
                {"fieldname": "unit", "fieldtype": "Link", "label": "Unit", "options": "UOM"},
                {"fieldname": "unit_weight", "fieldtype": "Float", "label": "Unit Weight"},
                {"fieldname": "supplier_rate", "fieldtype": "Currency", "label": "Supplier Rate"},
                {"fieldname": "commission_percent", "fieldtype": "Percent", "label": "Commission %"},
                {"fieldname": "less_percent", "fieldtype": "Percent", "label": "Less %"},
                {"fieldname": "less_units", "fieldtype": "Float", "label": "Less Units"},
                {"fieldname": "packing_cost", "fieldtype": "Currency", "label": "Packing Cost"},
                {"fieldname": "loading_cost", "fieldtype": "Currency", "label": "Loading Cost"},
                {"fieldname": "farmer_charges", "fieldtype": "Currency", "label": "Farmer Charges"},
                {"fieldname": "sale_price", "fieldtype": "Currency", "label": "Target Sale Price"},
                {"fieldname": "barcode", "fieldtype": "Data", "label": "Barcode"},
                {"fieldname": "lot_code", "fieldtype": "Data", "label": "Lot Code"},
                {"fieldname": "storage_location", "fieldtype": "Data", "label": "Storage Location"}
            ]
        })
        doc.insert()

    if not frappe.db.exists("DocType", "Mandi Arrival"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Arrival",
            "autoname": "format:ARR-.YYYY.-.#####",
            "fields": [
                {"fieldname": "arrival_date", "fieldtype": "Date", "label": "Entry Date", "default": "Today", "reqd": 1, "in_list_view": 1},
                {"fieldname": "party_id", "fieldtype": "Link", "label": "Contact", "options": "Mandi Contact", "reqd": 1, "in_list_view": 1},
                {"fieldname": "arrival_type", "fieldtype": "Select", "label": "Arrival Type", "options": "direct\ncommission\ncommission_supplier", "default": "direct", "in_list_view": 1},
                {"fieldname": "contact_bill_no", "fieldtype": "Int", "label": "Bill No"},
                {"fieldname": "reference_no", "fieldtype": "Data", "label": "Reference No"},
                {"fieldname": "lot_prefix", "fieldtype": "Data", "label": "Lot Prefix"},
                {"fieldname": "storage_location", "fieldtype": "Data", "label": "Storage Location"},
                {"fieldname": "vehicle_number", "fieldtype": "Data", "label": "Vehicle Number"},
                {"fieldname": "vehicle_type", "fieldtype": "Data", "label": "Vehicle Type"},
                {"fieldname": "driver_name", "fieldtype": "Data", "label": "Driver Name"},
                {"fieldname": "driver_mobile", "fieldtype": "Phone", "label": "Driver Mobile"},
                {"fieldname": "guarantor", "fieldtype": "Data", "label": "Guarantor"},
                {"fieldname": "loaders_count", "fieldtype": "Int", "label": "Loaders Count"},
                {"fieldname": "hire_charges", "fieldtype": "Currency", "label": "Hire Charges"},
                {"fieldname": "hamali_expenses", "fieldtype": "Currency", "label": "Hamali Expenses"},
                {"fieldname": "other_expenses", "fieldtype": "Currency", "label": "Other Expenses"},
                {"fieldname": "advance", "fieldtype": "Currency", "label": "Advance Amount"},
                {"fieldname": "advance_payment_mode", "fieldtype": "Select", "label": "Payment Mode", "options": "credit\ncash\nupi_bank\ncheque", "default": "credit"},
                {"fieldname": "advance_bank_account_id", "fieldtype": "Link", "label": "Bank Account", "options": "Account"},
                {"fieldname": "advance_cheque_no", "fieldtype": "Data", "label": "Cheque No"},
                {"fieldname": "advance_cheque_date", "fieldtype": "Date", "label": "Cheque Date"},
                {"fieldname": "advance_bank_name", "fieldtype": "Data", "label": "Bank Name"},
                {"fieldname": "items", "fieldtype": "Table", "label": "Arrival Items", "options": "Mandi Lot"}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}]
        })
        doc.insert()
        print("Created/Updated Mandi Arrival DocType")

def create_mandi_sale_doctype():
    if not frappe.db.exists("DocType", "Mandi Sale Item"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Sale Item",
            "istable": 1,
            "fields": [
                {"fieldname": "lot_id", "fieldtype": "Data", "label": "Lot ID"},
                {"fieldname": "item_id", "fieldtype": "Link", "label": "Item", "options": "Item"},
                {"fieldname": "qty", "fieldtype": "Float", "label": "Quantity"},
                {"fieldname": "rate", "fieldtype": "Currency", "label": "Rate"},
                {"fieldname": "amount", "fieldtype": "Currency", "label": "Amount"},
                {"fieldname": "gst_rate", "fieldtype": "Percent", "label": "GST %"},
                {"fieldname": "gst_amount", "fieldtype": "Currency", "label": "GST Amount"},
                {"fieldname": "hsn_code", "fieldtype": "Data", "label": "HSN Code"}
            ]
        })
        doc.insert()

    if not frappe.db.exists("DocType", "Mandi Sale"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Sale",
            "autoname": "format:SALE-.YYYY.-.#####",
            "fields": [
                {"fieldname": "saleDate", "fieldtype": "Date", "label": "Sale Date", "default": "Today", "reqd": 1, "in_list_view": 1},
                {"fieldname": "buyerId", "fieldtype": "Link", "label": "Buyer", "options": "Mandi Contact", "reqd": 1, "in_list_view": 1},
                {"fieldname": "paymentMode", "fieldtype": "Select", "label": "Payment Mode", "options": "credit\ncash\nupi_bank\ncheque", "default": "credit", "in_list_view": 1},
                {"fieldname": "totalAmount", "fieldtype": "Currency", "label": "Total Amount", "in_list_view": 1},
                {"fieldname": "marketFee", "fieldtype": "Currency", "label": "Market Fee"},
                {"fieldname": "nirashrit", "fieldtype": "Currency", "label": "Nirashrit"},
                {"fieldname": "miscFee", "fieldtype": "Currency", "label": "Misc Fee"},
                {"fieldname": "loadingCharges", "fieldtype": "Currency", "label": "Loading Charges"},
                {"fieldname": "unloadingCharges", "fieldtype": "Currency", "label": "Unloading Charges"},
                {"fieldname": "otherExpenses", "fieldtype": "Currency", "label": "Other Expenses"},
                {"fieldname": "discountAmount", "fieldtype": "Currency", "label": "Discount Amount"},
                {"fieldname": "gstTotal", "fieldtype": "Currency", "label": "Total GST"},
                {"fieldname": "amountReceived", "fieldtype": "Currency", "label": "Amount Received"},
                {"fieldname": "dueDate", "fieldtype": "Date", "label": "Due Date"},
                {"fieldname": "bankAccountId", "fieldtype": "Link", "label": "Bank Account", "options": "Account"},
                {"fieldname": "chequeNo", "fieldtype": "Data", "label": "Cheque No"},
                {"fieldname": "chequeDate", "fieldtype": "Date", "label": "Cheque Date"},
                {"fieldname": "bankName", "fieldtype": "Data", "label": "Bank Name"},
                {"fieldname": "vehicleNumber", "fieldtype": "Data", "label": "Vehicle Number"},
                {"fieldname": "bookNo", "fieldtype": "Data", "label": "Book No"},
                {"fieldname": "lotNo", "fieldtype": "Data", "label": "Lot No"},
                {"fieldname": "idempotencyKey", "fieldtype": "Data", "label": "Idempotency Key", "read_only": 1},
                {"fieldname": "items", "fieldtype": "Table", "label": "Sale Items", "options": "Mandi Sale Item"}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}]
        })
        doc.insert()
        print("Created/Updated Mandi Sale DocType")

def create_mandi_settings_doctype():
    if not frappe.db.exists("DocType", "Mandi Settings"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Settings",
            "issingle": 1,
            "fields": [
                {"fieldname": "market_fee_percent", "fieldtype": "Percent", "label": "Market Fee %"},
                {"fieldname": "nirashrit_percent", "fieldtype": "Percent", "label": "Nirashrit %"},
                {"fieldname": "misc_fee_percent", "fieldtype": "Percent", "label": "Misc Fee %"},
                {"fieldname": "default_credit_days", "fieldtype": "Int", "label": "Default Credit Days", "default": 15},
                {"fieldname": "state_code", "fieldtype": "Data", "label": "State Code"},
                {"fieldname": "gst_enabled", "fieldtype": "Check", "label": "GST Enabled"},
                {"fieldname": "gst_type", "fieldtype": "Select", "label": "GST Type", "options": "intra\ninter", "default": "intra"},
                {"fieldname": "cgst_percent", "fieldtype": "Percent", "label": "CGST %"},
                {"fieldname": "sgst_percent", "fieldtype": "Percent", "label": "SGST %"},
                {"fieldname": "igst_percent", "fieldtype": "Percent", "label": "IGST %"}
            ]
        })
        doc.insert()

def run():
    # Cleanup
    for dt in ["Mandi Arrival", "Mandi Lot", "Mandi Contact", "Mandi Sale", "Mandi Sale Item", "Mandi Settings"]:
        if frappe.db.exists("DocType", dt):
            frappe.delete_doc("DocType", dt)
    
    frappe.db.commit()
    
    create_mandi_contact_doctype()
    create_mandi_arrival_doctype()
    create_mandi_sale_doctype()
    create_mandi_settings_doctype()
    frappe.db.commit()
