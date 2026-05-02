import frappe
from mandigrow.api import confirm_sale_transaction

def run():
    print("Creating Sale via API directly to trace Receipt JE...")
    buyer = frappe.get_all("Mandi Contact", filters={"contact_type": "buyer"}, limit=1)[0].name
    lot = frappe.get_all("Mandi Lot", filters={"current_qty": [">", 0]}, fields=["name", "item_id"], limit=1)[0]
    
    payload = {
        "p_buyer_id": buyer,
        "p_payment_mode": "cash",
        "p_sale_date": "2026-04-30",
        "p_total_amount": 100,
        "p_items": [{"item_id": lot.item_id, "lot_id": lot.name, "qty": 1, "rate": 100, "amount": 100, "unit": "Kg"}],
        "p_amount_received": 100,
        "p_loading_charges": 0, "p_unloading_charges": 0, "p_other_expenses": 0,
        "p_market_fee": 0, "p_nirashrit": 0, "p_misc_fee": 0,
        "p_gst_total": 0, "p_discount_amount": 0,
    }
    
    res = confirm_sale_transaction(**payload)
    print(f"Result: {res}")
    
    if res.get("success"):
        sale_name = res["sale_id"]
        doc = frappe.get_doc("Mandi Sale", sale_name)
        print(f"\nCreated Sale: {sale_name}, paid: {doc.amountreceived}, status: {doc.status}")
        
        entries = frappe.db.sql("""
            SELECT name, account, party, debit, credit, against_voucher, against_voucher_type, voucher_no, voucher_type
            FROM `tabGL Entry`
            WHERE is_cancelled = 0 AND against_voucher = %s
        """, (sale_name,), as_dict=True)
        
        print(f"\nGL Entries for {sale_name}:")
        for e in entries:
            print(f"[{e.voucher_no}] {e.account}: Dr={e.debit}, Cr={e.credit}")
