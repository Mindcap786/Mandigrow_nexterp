import frappe

def patch_api():
    file_path = "/Users/shauddin/frappe-bench/apps/mandigrow/mandigrow/api.py"
    with open(file_path, "r") as f:
        content = f.read()

    new_func = """
@frappe.whitelist(allow_guest=False)
def create_comprehensive_sale_adjustment(p_organization_id, p_sale_item_id, p_new_qty, p_new_rate, p_reason):
    \"\"\"Adjust a sale item, recalculate totals, and update the ledger atomically.\"\"\"
    try:
        from frappe.utils import flt
        
        sale_item = frappe.get_doc("Mandi Sale Item", p_sale_item_id)
        if not sale_item:
            frappe.throw("Sale Item not found")
            
        sale = frappe.get_doc("Mandi Sale", sale_item.parent)
        if sale.organization_id != p_organization_id:
            frappe.throw("Organization mismatch")

        old_qty = sale_item.qty
        old_rate = sale_item.rate
        new_qty = flt(p_new_qty)
        new_rate = flt(p_new_rate)
        
        if old_qty == new_qty and old_rate == new_rate:
            return {"success": True, "message": "No changes needed."}

        # Cancel existing JEs linked to this Sale (deletes their GL Entries)
        linked_jes = frappe.db.sql(\"\"\"
            SELECT DISTINCT parent 
            FROM `tabJournal Entry Account` 
            WHERE against_voucher_type = 'Mandi Sale' AND against_voucher = %s
        \"\"\", (sale.name,))
        
        for je_row in linked_jes:
            je_name = je_row[0]
            je = frappe.get_doc("Journal Entry", je_name)
            if je.docstatus == 1:
                je.cancel()

        # Update the item
        sale_item.db_set("qty", new_qty)
        sale_item.db_set("rate", new_rate)
        sale_item.db_set("amount", new_qty * new_rate)
        
        # Reload sale to incorporate item updates
        sale.reload()
        
        # Recalculate parent totals
        sale.recalculate_totals()
        sale.db_set("totalamount", sale.totalamount)
        sale.db_set("invoice_total", sale.invoice_total)
        sale.db_set("status", sale.status)

        # Log adjustment in remarks (since child table doesn't exist)
        item_code = sale_item.item_id or "Item"
        log_msg = f"[Adjustment]: {item_code} | Qty {old_qty} -> {new_qty} | Rate {old_rate} -> {new_rate} | Reason: {p_reason}"
        current_remark = sale.get("user_remark") or ""
        sale.db_set("user_remark", (current_remark + "\\n" + log_msg).strip())

        # Re-post Ledger (this will generate new JEs for the updated amount)
        from mandigrow.mandigrow.logic.automation import post_sale_ledger
        frappe.flags._posting_sale_ledger = False # Reset idempotency flag just in case
        post_sale_ledger(sale)

        # Regenerate Day Book if needed
        from mandigrow.mandigrow.tasks import rebuild_daybook_entries
        rebuild_daybook_entries(p_organization_id, sale.saledate, sale.saledate)
        
        frappe.db.commit()
        return {"success": True, "message": "Adjustment applied and ledger updated."}
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "create_comprehensive_sale_adjustment Failed")
        return {"success": False, "error": str(e)}
"""
    if "def create_comprehensive_sale_adjustment(" not in content:
        with open(file_path, "a") as f:
            f.write(new_func)
            print("Successfully added create_comprehensive_sale_adjustment to api.py")
    else:
        print("create_comprehensive_sale_adjustment already exists")

patch_api()
