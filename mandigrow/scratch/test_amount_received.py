"""
Simulates the exact same payload that the Multi-Buyer Invoice frontend sends
to confirm_sale_transaction, and verifies amountreceived is correctly stored.
"""
import frappe
from mandigrow.mandigrow.api import confirm_sale_transaction

def run():
    # Find a valid buyer and lot
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)
    lot = frappe.get_all("Mandi Lot", filters={"current_qty": [">", 0]}, fields=["name", "item_id", "current_qty"], limit=1)
    
    if not buyer:
        print("ERROR: No buyer found")
        return
    if not lot:
        print("ERROR: No lot with stock found")
        return
    
    buyer_id = buyer[0].name
    lot_info = lot[0]
    
    print(f"Using buyer: {buyer_id}")
    print(f"Using lot: {lot_info.name} (item: {lot_info.item_id}, qty: {lot_info.current_qty})")
    
    # Simulate the EXACT payload the frontend sends via confirmSaleTransactionWithFallback
    # Frontend sends: amountReceived -> helper maps to -> p_amount_received
    test_amount = 500
    payload = {
        "p_organization_id": frappe.get_all("Mandi Organization", limit=1)[0].name,
        "p_buyer_id": buyer_id,
        "p_sale_date": "2026-04-30",
        "p_payment_mode": "cash",
        "p_total_amount": 1000,
        "p_items": [{"item_id": lot_info.item_id, "lot_id": lot_info.name, "qty": 1, "rate": 1000, "amount": 1000, "unit": "Kg"}],
        "p_market_fee": 0,
        "p_nirashrit": 0,
        "p_misc_fee": 0,
        "p_loading_charges": 0,
        "p_unloading_charges": 0,
        "p_other_expenses": 0,
        "p_amount_received": test_amount,  # THIS IS THE KEY FIELD
        "p_idempotency_key": None,
        "p_due_date": None,
        "p_bank_account_id": None,
        "p_cheque_no": None,
        "p_cheque_date": None,
        "p_cheque_status": False,
        "p_bank_name": None,
        "p_cgst_amount": 0,
        "p_sgst_amount": 0,
        "p_igst_amount": 0,
        "p_gst_total": 0,
        "p_discount_percent": 0,
        "p_discount_amount": 0,
        "p_gst_enabled": False,
    }
    
    print(f"\n--- Sending p_amount_received = {test_amount} ---")
    result = confirm_sale_transaction(**payload)
    
    print(f"\nResult: {result}")
    
    if result.get("success"):
        sale_id = result["sale_id"]
        doc = frappe.get_doc("Mandi Sale", sale_id)
        print(f"\n=== VERIFICATION ===")
        print(f"Sale ID:          {sale_id}")
        print(f"amountreceived:   {doc.amountreceived}")
        print(f"invoice_total:    {doc.invoice_total}")
        print(f"status:           {doc.status}")
        print(f"paymentmode:      {doc.paymentmode}")
        
        if doc.amountreceived == test_amount:
            print(f"\n✅ SUCCESS: amountreceived = {test_amount} (CORRECT)")
        else:
            print(f"\n❌ FAILURE: amountreceived = {doc.amountreceived}, expected {test_amount}")
        
        # Check the debug log
        debug_log = frappe.get_all("Error Log", filters={"method": "DEBUG: amountreceived capture"}, order_by="creation desc", limit=1, fields=["name"])
        if debug_log:
            log_doc = frappe.get_doc("Error Log", debug_log[0].name)
            print(f"\n--- Debug Log Content ---")
            print(log_doc.error)
        
        # Clean up - cancel and delete the test sale
        try:
            doc.cancel()
            doc.delete()
            print(f"\nCleaned up test sale {sale_id}")
        except Exception as e:
            print(f"\nNote: Could not clean up test sale: {e}")
    else:
        print(f"\n❌ API FAILED: {result.get('error')}")
