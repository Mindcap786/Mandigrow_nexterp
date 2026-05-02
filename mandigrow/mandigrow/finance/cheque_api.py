import frappe
from typing import Any
from frappe import _
from frappe.utils import flt, today
import re

def _get_user_company() -> str:
    from mandigrow.mandigrow.api import _get_user_company
    return _get_user_company()

def _get_user_org() -> str:
    from mandigrow.mandigrow.api import _get_user_org
    return _get_user_org()

def _get_ledger_summary(*args, **kwargs):
    from mandigrow.mandigrow.api import _get_ledger_summary
    return _get_ledger_summary(*args, **kwargs)

@frappe.whitelist(allow_guest=False)
def get_reconciliation_data(org_id: str = None, date_from: str = None, date_to: str = None, status_filter: str = "All") -> dict:
    """Get cheques from ALL transaction sources — Arrivals, Sales, POS, Quick Purchase."""
    org_id = org_id or _get_user_org()
    
    # Build date-range filter on cheque_date (or posting_date as fallback)
    date_conditions = ""
    date_params = []
    if date_from:
        date_conditions += " AND COALESCE(je.cheque_date, je.posting_date) >= %s"
        date_params.append(frappe.utils.getdate(date_from))
    if date_to:
        date_conditions += " AND COALESCE(je.cheque_date, je.posting_date) <= %s"
        date_params.append(frappe.utils.getdate(date_to))

    # Status condition
    status_condition = ""
    if status_filter == "Pending":
        status_condition = " AND je.clearance_date IS NULL AND je.docstatus IN (0, 1)"
    elif status_filter == "Cleared":
        # Standard Cleared: has a clearance date that is DIFFERENT from the cheque date (cleared later)
        status_condition = " AND je.clearance_date IS NOT NULL AND je.docstatus = 1 AND je.clearance_date != COALESCE(je.cheque_date, je.posting_date)"
    elif status_filter == "Instant":
        # Instant: has a clearance date that is the SAME as the cheque date (cleared immediately)
        status_condition = " AND je.clearance_date IS NOT NULL AND je.docstatus = 1 AND je.clearance_date = COALESCE(je.cheque_date, je.posting_date)"
    elif status_filter == "Cancelled":
        status_condition = " AND je.docstatus = 2"
    else:  # All — include draft + submitted + cancelled
        status_condition = " AND je.docstatus IN (0, 1, 2)"

    rows = frappe.db.sql(f"""
        SELECT
            je.name          AS voucher_no,
            je.docstatus,
            je.posting_date,
            je.cheque_no,
            je.cheque_date,
            je.clearance_date,
            je.user_remark   AS narration,
            je.total_debit,
            je.total_credit,
            MAX(CASE WHEN jea.party != '' AND jea.party IS NOT NULL THEN jea.party ELSE NULL END) AS party_id,
            MAX(CASE WHEN jea.party != '' AND jea.party IS NOT NULL THEN jea.party_type ELSE NULL END) AS party_type,
            MAX(jea.reference_type) AS against_voucher_type,
            MAX(jea.reference_name) AS against_voucher,
            COALESCE(MAX(ms.bankname), MAX(ma.advance_bank_name)) as bank_name
        FROM `tabJournal Entry` je
        JOIN `tabJournal Entry Account` jea ON je.name = jea.parent
        LEFT JOIN `tabMandi Sale` ms ON jea.reference_name = ms.name AND jea.reference_type = 'Mandi Sale'
        LEFT JOIN `tabMandi Arrival` ma ON jea.reference_name = ma.name AND jea.reference_type = 'Mandi Arrival'
        WHERE (je.cheque_no IS NOT NULL AND je.cheque_no != '')
          AND je.company = %s
          {date_conditions}
          {status_condition}
        GROUP BY je.name
        ORDER BY COALESCE(je.cheque_date, je.posting_date) DESC
    """, [_get_user_company()] + date_params, as_dict=True)

    party_ids = list({r.get("party_id") for r in rows if r.get("party_id")})
    contact_name_map = {}
    if party_ids:
        for p in frappe.get_all("Mandi Contact", filters={"name": ["in", party_ids]}, fields=["name", "full_name"]):
            contact_name_map[p.name] = p.full_name or p.name

    cheques = []
    for r in rows:
        posting_date = r.get("posting_date")
        cheque_date  = r.get("cheque_date")
        clearance_date = r.get("clearance_date")

        if posting_date and not isinstance(posting_date, str): posting_date = posting_date.isoformat()
        if cheque_date and not isinstance(cheque_date, str): cheque_date = cheque_date.isoformat()
        if clearance_date and not isinstance(clearance_date, str): clearance_date = clearance_date.isoformat()

        if r.get("docstatus") == 2: cheque_status = "Cancelled"
        elif clearance_date: cheque_status = "Cleared"
        else: cheque_status = "Pending"

        against_type = r.get("against_voucher_type") or ""
        total_debit  = flt(r.get("total_debit") or 0)
        total_credit = flt(r.get("total_credit") or 0)
        amount = max(total_debit, total_credit)
        
        if against_type in ("Mandi Arrival", "Mandi Quick Purchase"): direction = "payment"
        elif against_type in ("Mandi Sale", "Mandi POS Sale"): direction = "receipt"
        else: direction = "payment" if total_debit >= total_credit else "receipt"

        party_id = r.get("party_id") or ""
        party_name = contact_name_map.get(party_id, party_id) or "Unknown Party"

        cheques.append({
            "id":              r["voucher_no"],
            "voucher_no":      r["voucher_no"],
            "posting_date":    posting_date,
            "cheque_no":       r.get("cheque_no") or "",
            "cheque_date":     cheque_date,
            "clearance_date":  clearance_date,
            "status":          cheque_status,
            "cheque_status":   cheque_status,
            "narration":       r.get("narration") or "",
            "amount":          flt(amount, 2),
            "party":           party_name,
            "party_id":        party_id,
            "party_name":      party_name,
            "bank_name":       r.get("bank_name") or "",
            "voucher_type":    direction,
            "is_instant":      True if r.get("docstatus") == 1 and clearance_date and (str(clearance_date)[:10] == str(cheque_date)[:10] or str(clearance_date)[:10] == str(posting_date)[:10]) else False,
            "against_voucher_type": against_type,
            "against_voucher": r.get("against_voucher")
        })

    return {
        "cheques": cheques,
        "summary": {
            "total": len(cheques),
            "total_pending": len([c for c in cheques if c["status"] == "Pending"]),
            "total_cleared": len([c for c in cheques if c["status"] == "Cleared"]),
            "total_cancelled": len([c for c in cheques if c["status"] == "Cancelled"]),
            "pending_amount": sum([c["amount"] for c in cheques if c["status"] == "Pending"]),
            "cleared_amount": sum([c["amount"] for c in cheques if c["status"] == "Cleared"]),
        }
    }

@frappe.whitelist(allow_guest=False)
def mark_cheque_cleared(voucher_no: str, clearance_date: str = None) -> dict:
    """Mark a Journal Entry or Payment Entry as cleared."""
    if not voucher_no: frappe.throw("Voucher Number required")
    
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        company = _get_user_company()
        je_company = frappe.db.get_value("Journal Entry", voucher_no, "company")
        if je_company and je_company != company:
            frappe.throw(_("You do not have permission to access this voucher."), frappe.PermissionError)

    if not frappe.db.exists("Journal Entry", voucher_no):
        if frappe.db.exists("Payment Entry", voucher_no):
            clearance_date = clearance_date or today()
            frappe.db.set_value("Payment Entry", voucher_no, "clearance_date", clearance_date, update_modified=True)
            frappe.db.commit()
            return {"status": "success", "message": f"Cheque {voucher_no} cleared"}
        frappe.throw(f"Voucher {voucher_no} not found")

    clearance_date = clearance_date or today()
    doc = frappe.get_doc("Journal Entry", voucher_no)
    if doc.docstatus == 2: frappe.throw(f"Cannot clear a cancelled voucher {voucher_no}")
    
    was_draft = (doc.docstatus == 0)
    if was_draft:
        doc.flags.ignore_permissions = True
        doc.submit()
        
    doc.db_set("clearance_date", clearance_date, update_modified=True)
    
    # Update parent status
    match = re.search(r'(?:\[|\b)((?:SALE|MSL|ARR|MAR)-[A-Z0-9]+-\d{4}-\d+|(?:SALE|MSL|ARR|MAR)-\d+)', doc.user_remark or "")
    if match:
        avno = match.group(1)
        avtype = "Mandi Sale" if avno.startswith("SALE") or avno.startswith("MSL") else "Mandi Arrival"
        if frappe.db.exists(avtype, avno):
            parent_doc = frappe.get_doc(avtype, avno)
            amt = flt(parent_doc.totalamount) if avtype == "Mandi Sale" else flt(parent_doc.net_payable_farmer)
            summary = _get_ledger_summary(avtype, avno, amt, due_date=getattr(parent_doc, "duedate", None))
            frappe.db.set_value(avtype, avno, "status", summary.get("status", "pending").title())
            
    frappe.db.commit()
    return {"status": "success", "message": f"Cheque {voucher_no} cleared"}

@frappe.whitelist(allow_guest=False)
def cancel_cheque_voucher(voucher_no: str) -> dict:
    """Cancel a submitted Journal Entry that represents a cheque payment/receipt."""
    if not voucher_no: frappe.throw("Voucher Number required")
    
    doc = frappe.get_doc("Journal Entry", voucher_no)
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        company = _get_user_company()
        if doc.company != company:
            frappe.throw(_("You do not have permission to cancel this voucher."), frappe.PermissionError)

    if doc.docstatus == 0:
        doc.delete(ignore_permissions=True)
        return {"status": "success", "message": f"Draft cheque voucher {voucher_no} deleted"}

    if doc.docstatus == 2:
        return {"status": "success", "message": f"Cheque voucher {voucher_no} is already cancelled"}

    doc.flags.ignore_permissions = True
    doc.cancel()
    
    # Recalculate parent status
    match = re.search(r'(?:\[|\b)((?:SALE|MSL|ARR|MAR)-[A-Z0-9]+-\d{4}-\d+|(?:SALE|MSL|ARR|MAR)-\d+)', doc.user_remark or "")
    if match:
        avno = match.group(1)
        avtype = "Mandi Sale" if avno.startswith("SALE") or avno.startswith("MSL") else "Mandi Arrival"
        if frappe.db.exists(avtype, avno):
            parent_doc = frappe.get_doc(avtype, avno)
            amt = flt(parent_doc.totalamount) if avtype == "Mandi Sale" else flt(parent_doc.net_payable_farmer)
            summary = _get_ledger_summary(avtype, avno, amt, due_date=getattr(parent_doc, "duedate", None))
            frappe.db.set_value(avtype, avno, "status", summary.get("status", "pending").title())

    frappe.db.commit()
    return {"status": "cancelled", "voucher_no": voucher_no, "success": True}
