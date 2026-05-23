import frappe
import json
from mandigrow.api import confirm_sale_transaction

def run():
    org_id = frappe.db.get_value("Mandi Organization", {"owner": "syed"}, "name")
    if not org_id:
        org_id = frappe.db.get_all("Mandi Organization", limit=1)[0].name

    frappe.session.user = "Administrator" # simulate admin

    item_id = frappe.db.get_value("Item", {}, "name")
    buyer_id = frappe.db.get_value("Mandi Contact", {"contact_type": "buyer"}, "name")

    payload = {
        "items": [{"item_id": item_id, "qty": 1, "rate": 100, "lot_id": ""}],
        "buyer_id": buyer_id,
        "payment_mode": "cash",
        "amount_received": 4300,
        "total_amount": 4300,
        "crate_items": [{"crate_type": "Plastic crat", "qty": 60, "rate": 70}]
    }

    try:
        print("Testing POS Sale Confirmation...")
        res = confirm_sale_transaction(
            items=json.dumps(payload["items"]),
            buyer_id=buyer_id,
            payment_mode="cash",
            amount_received=4300,
            total_amount=4300,
            crate_items=json.dumps(payload["crate_items"]),
            organization_id=org_id
        )
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

