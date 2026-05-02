import frappe
from frappe.utils import flt
from mandigrow.mandigrow.api import confirm_sale_transaction
import traceback

def run():
    """Test with direct prints in automation.py to trace the issue."""
    
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)[0].name
    lot = frappe.get_all("Mandi Lot", filters={"current_qty": [">", 0]}, fields=["name", "item_id"], limit=1)[0]
    
    payload = {
        "p_buyer_id": buyer,
        "p_payment_mode": "cash",
        "p_sale_date": "2026-04-30",
        "p_total_amount": 1000,
        "p_items": [{"item_id": lot.item_id, "lot_id": lot.name, "qty": 1, "rate": 1000, "amount": 1000, "unit": "Kg"}],
        "p_amount_received": 500,
        "p_loading_charges": 0, "p_unloading_charges": 0, "p_other_expenses": 0,
        "p_market_fee": 0, "p_nirashrit": 0, "p_misc_fee": 0,
        "p_gst_total": 0, "p_discount_amount": 0,
    }
    
    # Monkey-patch repair_single_party_settlement to trace ALL callers
    from mandigrow import api as mg_api
    original_repair = mg_api.repair_single_party_settlement
    
    def traced_repair(contact_id, org_id=None):
        print(f"  [repair_single_party_settlement CALLED] contact={contact_id}")
        print(f"    _posting_sale_ledger = {getattr(frappe.flags, '_posting_sale_ledger', 'NOT_SET')}")
        # Print the call stack
        for line in traceback.format_stack()[-6:-1]:
            print(f"    {line.strip()}")
        return original_repair(contact_id, org_id)
    
    mg_api.repair_single_party_settlement = traced_repair
    
    print("--- Starting transaction ---")
    result = confirm_sale_transaction(**payload)
    
    if result.get("success"):
        sale_id = result["sale_id"]
        doc = frappe.get_doc("Mandi Sale", sale_id)
        print(f"\namountreceived: {doc.amountreceived}")
        print(f"status: {doc.status}")
        if doc.amountreceived == 500:
            print("✅ SUCCESS")
        else:
            print("❌ STILL FAILING")
    else:
        print(f"❌ API FAILED: {result.get('error')}")
    
    mg_api.repair_single_party_settlement = original_repair
