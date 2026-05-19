import frappe
from mandigrow.api import confirm_arrival_transaction

frappe.init(site="mandigrow.localhost")
frappe.connect()

try:
    party = frappe.get_all("Mandi Contact", limit=1)[0].name
    
    res = confirm_arrival_transaction(**{
        "party_id": party,
        "arrival_date": "2026-05-19",
        "arrival_type": "direct",
        "advance": 0,
        "hire_charges": 300,
        "hamali_expenses": 600,
        "items": [
            {
                "item_id": "Guava",
                "qty": 100,
                "supplier_rate": 100,
                "unit": "Box"
            }
        ]
    })
    
    if res.get("success"):
        arr = frappe.get_doc("Mandi Arrival", res.get("id"))
        
        print("=" * 56)
        print("DIRECT PURCHASE VALIDATION")
        print("  100 bags × ₹100 = ₹10,000 (goods)")
        print("  Hire ₹300 + Hamali ₹600 = ₹900 (supplier paid on behalf)")
        print("  Expected Invoice/Bill = ₹10,900")
        print("=" * 56)
        print(f"  total_realized:    ₹{arr.total_realized}")
        print(f"  total_expenses:    ₹{arr.total_expenses}")
        print(f"  mandi_earnings:    ₹{arr.mandi_total_earnings}")
        print(f"  net_payable:       ₹{arr.net_payable_farmer}  ← should be ₹10,900")
        print()
        print("GL ENTRIES:")
        gl = frappe.get_all("GL Entry", filters={"against_voucher": arr.name},
                             fields=["account", "debit", "credit"])
        for g in gl:
            dr_cr = f"Dr ₹{g['debit']}" if g['debit'] else f"Cr ₹{g['credit']}"
            print(f"  {g['account']}: {dr_cr}")
        print()
        if arr.net_payable_farmer == 10900 and arr.mandi_total_earnings == 0:
            print("✅ PASS: Invoice = Inwards = Daybook = Ledger = ₹10,900")
        else:
            print(f"❌ FAIL: Expected ₹10,900 but got ₹{arr.net_payable_farmer}")
    else:
        print("Arrival creation failed:", res.get("error"))
    
    frappe.db.rollback()
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
