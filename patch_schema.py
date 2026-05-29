import json

def patch_arrival():
    path = "mandigrow/mandigrow/doctype/mandi_arrival/mandi_arrival.json"
    with open(path, "r") as f:
        data = json.load(f)
    
    fields = data["fields"]
    # Check if itc_eligible exists
    if not any(f.get("fieldname") == "itc_eligible" for f in fields):
        fields.append({
            "fieldname": "itc_eligible",
            "fieldtype": "Check",
            "label": "Eligible for ITC",
            "default": "0",
            "read_only": 1
        })
    
    if not any(f.get("fieldname") == "is_rcm" for f in fields):
        fields.append({
            "fieldname": "is_rcm",
            "fieldtype": "Check",
            "label": "RCM Applicable (Aggregate)",
            "default": "0",
            "read_only": 1
        })
        
    with open(path, "w") as f:
        json.dump(data, f, indent=1)
        
def patch_lot():
    path = "mandigrow/mandigrow/doctype/mandi_lot/mandi_lot.json"
    with open(path, "r") as f:
        data = json.load(f)
    
    fields = data["fields"]
    
    if not any(f.get("fieldname") == "is_rcm" for f in fields):
        fields.append({
            "fieldname": "is_rcm",
            "fieldtype": "Check",
            "label": "RCM Applicable",
            "default": "0"
        })
        
    # Rename gst_amount to purchase_gst_amount to match mandi_arrival.py
    for f in fields:
        if f.get("fieldname") == "gst_amount":
            f["fieldname"] = "purchase_gst_amount"
            f["label"] = "Purchase GST Amount"
            
    with open(path, "w") as f:
        json.dump(data, f, indent=1)

patch_arrival()
patch_lot()
print("Schema patched.")
