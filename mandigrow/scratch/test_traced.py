import frappe
from frappe.utils import flt
from mandigrow.api import confirm_sale_transaction

def run():
    """Test with monkey-patched on_journal_submit to see if guard works."""
    
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)[0].name
    lot = frappe.get_all("Mandi Lot", filters={"current_qty": [">", 0]}, fields=["name", "item_id"], limit=1)[0]
    org = frappe.get_all("Mandi Organization", limit=1)[0].name
    
    # Monkey-patch on_journal_submit to trace
    from mandigrow.logic import automation
    original_on_journal_submit = automation.on_journal_submit
    
    def traced_on_journal_submit(doc, method=None):
        flag = getattr(frappe.flags, '_posting_sale_ledger', 'NOT_SET')
        print(f"  [on_journal_submit] flag={flag}, JE={doc.name}")
        return original_on_journal_submit(doc, method)
    
    automation.on_journal_submit = traced_on_journal_submit
    
    # Also trace repair_single_party_settlement
    from mandigrow import api as mg_api
    original_repair = mg_api.repair_single_party_settlement
    
    def traced_repair(contact_id, org_id=None):
        print(f"  [repair_single_party_settlement] contact={contact_id}")
        return original_repair(contact_id, org_id)
    
    mg_api.repair_single_party_settlement = traced_repair
    
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
    
    print("--- Starting transaction ---")
    result = confirm_sale_transaction(**payload)
    print(f"--- Result: {result.get('success')} ---")
    
    if result.get("success"):
        sale_id = result["sale_id"]
        doc = frappe.get_doc("Mandi Sale", sale_id)
        print(f"\namountreceived: {doc.amountreceived}")
        print(f"status: {doc.status}")
        
        if doc.amountreceived == 500:
            print("✅ SUCCESS")
        else:
            print("❌ STILL FAILING")
    
    # Restore
    automation.on_journal_submit = original_on_journal_submit
    mg_api.repair_single_party_settlement = original_repair
