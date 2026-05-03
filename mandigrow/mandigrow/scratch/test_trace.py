import frappe
from frappe.utils import flt
from mandigrow.api import confirm_sale_transaction

def run():
    """Test with inline logging to trace exactly when amountreceived gets reset."""
    
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)[0].name
    lot = frappe.get_all("Mandi Lot", filters={"current_qty": [">", 0]}, fields=["name", "item_id"], limit=1)[0]
    org = frappe.get_all("Mandi Organization", limit=1)[0].name
    
    # Patch frappe.get_doc to intercept
    original_get_doc = frappe.get_doc
    
    def patched_get_doc(*args, **kwargs):
        doc = original_get_doc(*args, **kwargs)
        if hasattr(doc, 'doctype') and doc.doctype == "Mandi Sale":
            print(f"  [get_doc] amountreceived = {getattr(doc, 'amountreceived', 'N/A')}")
        return doc
    
    # Instead of patching, let's just directly test the dict construction
    payload = {
        "p_buyer_id": buyer,
        "p_payment_mode": "cash",
        "p_sale_date": "2026-04-30",
        "p_total_amount": 1000,
        "p_items": [{"item_id": lot.item_id, "lot_id": lot.name, "qty": 1, "rate": 1000, "amount": 1000, "unit": "Kg"}],
        "p_amount_received": 500,
        "p_loading_charges": 0,
        "p_unloading_charges": 0,
        "p_other_expenses": 0,
        "p_market_fee": 0,
        "p_nirashrit": 0,
        "p_misc_fee": 0,
        "p_gst_total": 0,
        "p_discount_amount": 0,
    }
    
    # Simulate what confirm_sale_transaction does:
    print(f"payload.get('p_amount_received') = {payload.get('p_amount_received')}")
    print(f"type = {type(payload.get('p_amount_received'))}")
    
    computed = flt(payload.get("p_amount_received") or payload.get("amountReceived") or payload.get("amount_received") or 0)
    print(f"computed = {computed}")
    
    # Now the REAL test - call the actual function
    items_str = payload.get("p_items")
    items = items_str if isinstance(items_str, list) else []
    items_subtotal = sum(flt(i.get("qty", 0)) * flt(i.get("rate", 0)) for i in items)
    print(f"items_subtotal = {items_subtotal}")
    
    doc_dict = {
        "doctype": "Mandi Sale",
        "buyerid": buyer,
        "organization_id": org,
        "saledate": "2026-04-30",
        "paymentmode": "cash",
        "totalamount": items_subtotal,
        "amountreceived": computed,
        "items": []
    }
    print(f"\ndoc_dict['amountreceived'] = {doc_dict['amountreceived']}")
    
    doc = frappe.get_doc(doc_dict)
    print(f"doc.amountreceived BEFORE append = {doc.amountreceived}")
    
    for item in items:
        doc.append("items", {
            "item_id": item.get("item_id"),
            "lot_id": item.get("lot_id") or "",
            "qty": flt(item.get("qty", 0)),
            "rate": float(item.get("rate", 0)),
            "amount": float(item.get("amount") or 0)
        })
    
    print(f"doc.amountreceived AFTER append = {doc.amountreceived}")
    
    doc.insert(ignore_permissions=True)
    print(f"doc.amountreceived AFTER insert = {doc.amountreceived}")
    print(f"doc.status AFTER insert = {doc.status}")
    
    # Re-read from DB
    doc2 = frappe.get_doc("Mandi Sale", doc.name)
    print(f"doc.amountreceived FROM DB = {doc2.amountreceived}")
    print(f"doc.status FROM DB = {doc2.status}")
    
    # Cleanup
    frappe.delete_doc("Mandi Sale", doc.name, force=True, ignore_permissions=True)
    frappe.db.commit()
    print(f"\nCleaned up {doc.name}")
