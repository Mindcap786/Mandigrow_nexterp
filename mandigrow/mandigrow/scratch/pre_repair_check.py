import frappe
from frappe.utils import today

def run():
    print("=" * 60)
    print("SURGICAL REPAIR - STEP 1: Identify exact arrivals")
    print("=" * 60)

    # The arrival with 23 GL rows / 4 JEs is ARR-ORG00002-2026-00011
    # contact_bill_no = 5 (Lychee/shauddin)
    lychee_arrival = "ARR-ORG00002-2026-00011"

    # The Avocado arrival needs to be found by Bill #11 context
    # From the screenshots: Avocado 500 box @200, Bill shown as #11 in UI
    # Let's find it by item and arrival_type
    avocado_arrivals = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "contact_bill_no", "party_id", "net_payable_farmer", "advance", "arrival_type"])
    
    print(f"\nAll SSB arrivals:")
    for a in avocado_arrivals:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": a.name})
        je_count = frappe.db.count("Journal Entry", [["user_remark", "like", f"%{a.name}%"]])
        print(f"  {a.name} | Bill#{a.contact_bill_no} | type:{a.arrival_type} | net_pay:{a.net_payable_farmer} | advance:{a.advance} | GLs:{gl_count} | JEs:{je_count}")
    
    print("\n" + "=" * 60)
    print("STEP 2: Show current JEs for lychee arrival")
    print("=" * 60)
    
    je_list = frappe.get_all("Journal Entry",
        filters=[["user_remark", "like", f"%{lychee_arrival}%"]],
        fields=["name", "docstatus", "creation", "user_remark"],
        order_by="creation asc")
    
    print(f"\nJEs for {lychee_arrival} ({len(je_list)} total):")
    for j in je_list:
        gl_rows = frappe.get_all("GL Entry", filters={"voucher_no": j.name},
            fields=["account", "debit", "credit"])
        print(f"  {j.name} | status:{j.docstatus} | created:{j.creation}")
        print(f"    remark: {j.user_remark[:70]}")
        for g in gl_rows:
            print(f"    -> {g.account} | Dr:{g.debit} | Cr:{g.credit}")
