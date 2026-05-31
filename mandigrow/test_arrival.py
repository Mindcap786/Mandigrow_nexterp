import frappe

def execute():
    # Load the latest arrival doc
    arrivals = frappe.db.get_all("Mandi Arrival", order_by="creation desc", limit=1, fields=["name"])
    if not arrivals: return {"error": "no arrivals"}
    doc = frappe.get_doc("Mandi Arrival", arrivals[0]["name"])
    
    # Manually call _recompute_summary
    doc._recompute_summary()
    
    return {
        "net_payable_farmer": doc.net_payable_farmer,
        "gst_total": doc.gst_total,
        "total_realized": doc.total_realized,
        "items": [{"gst_rate": item.purchase_gst_rate, "gst_type": item.purchase_gst_type} for item in doc.items]
    }
