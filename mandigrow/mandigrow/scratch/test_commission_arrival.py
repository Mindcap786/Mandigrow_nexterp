import frappe
from mandigrow.api import confirm_arrival_transaction

frappe.init(site="mandigrow.localhost")
frappe.connect()

try:
    party = frappe.get_all("Mandi Contact", limit=1)[0].name
    
    res = confirm_arrival_transaction(**{
        "party_id": party,
        "arrival_date": "2026-05-19",
        "arrival_type": "commission",
        "advance": 0,
        "hire_charges": 300,
        "hamali_expenses": 600,
        "items": [
            {
                "item_id": "Guava",
                "qty": 100,
                "supplier_rate": 100,  # farmer declared rate
                "commission_percent": 10,
                "unit": "Box"
            }
        ]
    })
    
    if res.get("success"):
        arr = frappe.get_doc("Mandi Arrival", res.get("id"))
        
        print("=" * 60)
        print("COMMISSION ARRIVAL VALIDATION")
        print("  100 bags × ₹100 = ₹10,000 (goods)")
        print("  Commission 10% = ₹1,000 (Mandi earns)")
        print("  Hire ₹300 + Hamali ₹600 = ₹900 (Mandi pays on farmer's behalf → deducted)")
        print("  Expected Net Payable to Farmer = ₹10,000 - ₹1,000 - ₹900 = ₹8,100")
        print("=" * 60)
        print(f"  total_realized:    ₹{arr.total_realized}")
        print(f"  total_commission:  ₹{arr.total_commission}")
        print(f"  total_expenses:    ₹{arr.total_expenses}")
        print(f"  mandi_earnings:    ₹{arr.mandi_total_earnings}")
        print(f"  net_payable:       ₹{arr.net_payable_farmer}  ← should be ₹8,100")
        print()
        print("GL ENTRIES:")
        gl = frappe.get_all("GL Entry", filters={"against_voucher": arr.name},
                             fields=["account", "debit", "credit"])
        total_dr = 0
        total_cr = 0
        for g in gl:
            dr_cr = f"Dr ₹{g['debit']}" if g['debit'] else f"Cr ₹{g['credit']}"
            print(f"  {g['account']}: {dr_cr}")
            total_dr += g['debit']
            total_cr += g['credit']
        print(f"  Total Dr: ₹{total_dr} | Total Cr: ₹{total_cr} ({'BALANCED ✅' if total_dr == total_cr else 'UNBALANCED ❌'})")
        print()
        if arr.net_payable_farmer == 8100 and arr.mandi_total_earnings == 1900:
            print("✅ PASS: Commission arrival — Inwards = Daybook = Ledger = ₹8,100 to farmer")
        else:
            print(f"❌ FAIL: net_payable={arr.net_payable_farmer}, mandi_earnings={arr.mandi_total_earnings}")
    else:
        print("Arrival creation failed:", res.get("error"))
    
    frappe.db.rollback()
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
