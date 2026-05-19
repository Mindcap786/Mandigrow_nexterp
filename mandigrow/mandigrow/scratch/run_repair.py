import frappe
from mandigrow.mandigrow.logic.automation import post_arrival_ledger

frappe.init(site="mandigrow.localhost")
frappe.connect()

try:
    arrivals = frappe.get_all("Mandi Arrival", filters={"docstatus": 1, "arrival_type": "direct"}, fields=["name"])
    count = 0
    for arr in arrivals:
        doc = frappe.get_doc("Mandi Arrival", arr.name)
        doc._recompute_summary()
        frappe.db.set_value("Mandi Arrival", doc.name, {
            "total_realized": doc.total_realized,
            "total_expenses": doc.total_expenses,
            "mandi_total_earnings": doc.mandi_total_earnings,
            "net_payable_farmer": doc.net_payable_farmer
        }, update_modified=False)
        gl_entries = frappe.get_all("GL Entry", filters={"against_voucher": doc.name, "against_voucher_type": "Mandi Arrival"}, fields=["name"])
        if gl_entries:
            for gle in gl_entries:
                frappe.db.delete("GL Entry", gle.name)
            post_arrival_ledger(doc)
            count += 1
    frappe.db.commit()
    print({"status": "success", "reposted_count": count})
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
