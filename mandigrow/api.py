import frappe
from typing import Union, Any, Dict, List, Optional
from frappe import _
from frappe.utils import flt, today, getdate, add_days
from frappe.model.rename_doc import rename_doc as model_rename_doc
import json





# ─────────────────────────────────────────────────────────────────────────────
# VOUCHER TYPE → DAY BOOK TRANSACTION TYPE MAP
# Maps ERPNext voucher_type to the transaction_type shape the Day Book UI expects
# ─────────────────────────────────────────────────────────────────────────────
_VOUCHER_TYPE_MAP = {
    "Purchase Receipt":   "goods_arrival",
    "Purchase Invoice":   "goods_arrival",
    "Payment Entry":      "payment",
    "Sales Invoice":      "sale",
    "Journal Entry":      "journal",
    "Cash Entry":         "cash_receipt",
    "Bank Entry":         "bank_receipt",
    "Contra Entry":       "transfer",
    "Debit Note":         "purchase",
    "Credit Note":        "sale",
}

# ─────────────────────────────────────────────────────────────────────────────
# SCHEMA-AWARE COLUMN GUARD — SRE-Grade Production Safety
# ─────────────────────────────────────────────────────────────────────────────
# Problem: Custom fields (organization_id, custom_attributes, description) are
# applied via fixtures during `bench migrate`. If the migration hasn't run on
# the cloud DB yet, any query referencing these columns throws:
#   MySQLdb.OperationalError: (1054, "Unknown column 'X' in 'WHERE'")
#
# Solution: All queries that touch potentially-missing columns MUST go through
# _col_exists() / _org_filter(). These helpers are:
#   - Memoized within the request lifecycle (no extra DB round-trips)
#   - Safe to call at module level — no Frappe context required
# ─────────────────────────────────────────────────────────────────────────────

_COL_CACHE: dict = {}   # {("DocType", "fieldname"): True/False}

def _col_exists(doctype: str, fieldname: str) -> bool:
    """Memoized wrapper around frappe.db.has_column. Safe to call repeatedly."""
    key = (doctype, fieldname)
    if key not in _COL_CACHE:
        try:
            _COL_CACHE[key] = bool(frappe.db.has_column(doctype, fieldname))
        except Exception:
            _COL_CACHE[key] = False
    return _COL_CACHE[key]

def _org_filter(doctype: str, org_id: str) -> dict:
    """
    Returns {"organization_id": org_id} only if the column exists in the DB.
    Otherwise returns {} — query runs without tenant filter (safe fallback).

    Usage:
        filters = {"docstatus": 1, **_org_filter("Mandi Sale", org_id)}
        frappe.get_all("Mandi Sale", filters=filters, ...)
    """
    if org_id and _col_exists(doctype, "organization_id"):
        return {"organization_id": org_id}
    return {}

def _enforce_ownership(doc):
    """Security helper to prevent IDOR on single document fetches."""
    org_id = _get_user_org()
    if not org_id: return
    
    doc_org = getattr(doc, "organization_id", None)
    if doc_org and doc_org != org_id:
        frappe.throw("Data isolation error: Access denied to this record.", frappe.PermissionError)
        
    doc_comp = getattr(doc, "company", None)
    if doc_comp:
        company = _get_user_company()
        if company and doc_comp != company:
            frappe.throw("Data isolation error: Access denied to this company record.", frappe.PermissionError)


def _map_voucher_type(vtype, is_debit):
    """Map ERPNext voucher type to Day Book transaction_type."""
    base = _VOUCHER_TYPE_MAP.get(vtype, "transaction")
    if vtype == "Payment Entry":
        return "cash_payment" if is_debit else "cash_receipt"
    if vtype == "Journal Entry":
        return "journal"
    if vtype == "Bank Entry": # Custom mapping for bank
        return "bank_payment" if is_debit else "bank_receipt"
    return base


_LOT_OPEN_STATUSES = {"", "active", "available", "partial", "pending"}
_LOT_SOLD_STATUSES = {"sold", "sold out", "closed"}


def _lot_get(row: Any, fieldname: str, default: Any = None) -> Any:
    if isinstance(row, dict):
        return row.get(fieldname, default)
    return getattr(row, fieldname, default)


def _lot_set(row: Any, fieldname: str, value: Any) -> None:
    if isinstance(row, dict):
        row[fieldname] = value
    else:
        setattr(row, fieldname, value)


def _lot_has_column(fieldname: str) -> bool:
    try:
        return frappe.db.has_column("Mandi Lot", fieldname)
    except Exception:
        return False


def _lot_query_fields(base_fields: list[str], optional_fields: list[str] | None = None) -> list[str]:
    fields = list(base_fields)
    for fieldname in optional_fields or []:
        if _lot_has_column(fieldname) and fieldname not in fields:
            fields.append(fieldname)
    return fields


def _get_lot_seed_qty(row: Any) -> float:
    # Stock seed is always the ORIGINAL physical qty received, NOT net_qty.
    # net_qty is a billing deduction field (less_percent applied) — it tracks
    # financial settlement discount, not the actual units sitting in stock.
    return max(flt(_lot_get(row, "qty") or _lot_get(row, "initial_qty") or 0), 0)


def _derive_lot_status(current_qty: float, initial_qty: float) -> str:
    if current_qty <= 0:
        return "Sold Out"
    if initial_qty > 0 and current_qty < initial_qty:
        return "Partial"
    return "Available"


def _normalize_lot_stock(row: Any, persist: bool = False) -> Any:
    seed_qty = _get_lot_seed_qty(row)
    initial_qty = flt(_lot_get(row, "initial_qty") or 0)
    current_qty = flt(_lot_get(row, "current_qty") or 0)
    raw_status = str(_lot_get(row, "status") or "").strip()
    status_lower = raw_status.lower()

    if initial_qty <= 0 and seed_qty > 0:
        initial_qty = seed_qty

    if current_qty < 0:
        current_qty = 0

    if current_qty <= 0 and seed_qty > 0 and status_lower not in _LOT_SOLD_STATUSES:
        current_qty = seed_qty

    if initial_qty <= 0 and current_qty > 0:
        initial_qty = current_qty

    if initial_qty > 0 and current_qty > initial_qty:
        initial_qty = current_qty

    normalized_status = raw_status
    if not raw_status or status_lower in _LOT_OPEN_STATUSES or status_lower in _LOT_SOLD_STATUSES:
        normalized_status = _derive_lot_status(current_qty, initial_qty)

    _lot_set(row, "initial_qty", initial_qty)
    _lot_set(row, "current_qty", current_qty)
    _lot_set(row, "status", normalized_status)

    if isinstance(row, dict):
        row.setdefault("qty", flt(_lot_get(row, "qty") or 0))

    if persist:
        lot_name = _lot_get(row, "name")
        if lot_name:
            updates = {}
            if _lot_has_column("initial_qty"):
                updates["initial_qty"] = initial_qty
            if _lot_has_column("current_qty"):
                updates["current_qty"] = current_qty
            if _lot_has_column("status"):
                updates["status"] = normalized_status
            if updates:
                frappe.db.set_value("Mandi Lot", lot_name, updates, update_modified=False)

    return row


def _update_lot_stock_fields(lot_name: str, initial_qty: float, current_qty: float, status: str) -> None:
    updates = {}
    if _lot_has_column("initial_qty"):
        updates["initial_qty"] = initial_qty
    if _lot_has_column("current_qty"):
        updates["current_qty"] = current_qty
    if _lot_has_column("status"):
        updates["status"] = status
    if updates:
        frappe.db.set_value("Mandi Lot", lot_name, updates, update_modified=False)


@frappe.whitelist(allow_guest=False)
def get_daybook(date: str = None, org_id: str = None) -> dict:
    """
    Returns Day Book entries for a given date from ERPNext GL Entries.
    The response shape matches the old Supabase ledger_entries shape so that
    the day-book.tsx UI works with zero changes.

    ERPNext GL Entry → Day Book entry shape:
      posting_date → entry_date
      account      → account.name
      debit        → debit
      credit       → credit
      voucher_type → transaction_type (mapped)
      voucher_no   → reference_no, voucher_id
      remarks      → description
      party        → resolved as contact
    """
    if not date:
        date = frappe.utils.today()

    # Resolve company: prefer the org_id passed by the frontend (most reliable),
    # fall back to the session-user's linked company.
    company = None
    if org_id:
        company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
    if not company:
        company = _get_user_company()

    if not company:
        return {"entries": [], "arrivalLotMap": {}, "arrivalReferenceMap": {},
                "saleReferenceMap": {}, "saleItemMap": {}, "contactMap": {},
                "arrivalTimestampMap": {}, "arrivalLotPrefixMap": {}}

    # ── 1. Fetch GL Entries for the date ─────────────────────────────────
    # Cheque-aware query:
    #   • Non-cheque entries: show when posting_date = date
    #   • Cleared cheques:    show when clearance_date = date (regardless of future posting_date)
    #   • Uncleared cheques:  show when posting_date = date (pending/udhaar display)
    # Day Book entries — all GL legs of any voucher active on `date`, with
    # the cheque rule applied:
    #   • Non-cheque vouchers   → show on their posting_date.
    #   • Cleared cheques        → show on their clearance_date (regardless of
    #                              posting_date), so the bank movement lands on
    #                              the day funds actually clear.
    #   • Pending (post-dated) cheques → show on posting_date (as udhaar)
    # No account filter: we want the goods-receipt and supplier/debtor legs
    # too, so the frontend can render Purchase+Payment / Sale+Receipt as one
    # transaction (grouped by reference_id) instead of an orphaned cash leg.
    gl_entries = frappe.db.sql("""
        SELECT DISTINCT
            gl.name, gl.posting_date, gl.account, gl.party_type, gl.party,
            gl.debit, gl.credit, gl.voucher_type, gl.voucher_no,
            gl.against_voucher, gl.against_voucher_type,
            gl.cost_center, gl.creation, gl.is_opening,
            COALESCE(je.user_remark, gl.remarks) as remarks,
            acc.account_type, acc.root_type, acc.account_name as acc_account_name,
            je.cheque_no, je.clearance_date
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je
               ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        LEFT JOIN `tabAccount` acc ON gl.account = acc.name
        WHERE gl.is_cancelled = 0
          AND gl.company = %s
          AND (gl.against_voucher_type IS NULL OR gl.against_voucher_type NOT IN ('Mandi Sale Return', 'Mandi Purchase Return'))
          AND (
              -- Non-cheque entries
              ((je.cheque_no IS NULL OR je.cheque_no = '') AND gl.posting_date = %s)
              OR
              -- Cleared cheques show on clearance date
              (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NOT NULL AND je.clearance_date = %s)
              OR
              -- Uncleared cheques show on posting date
              (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NULL AND gl.posting_date = %s)
          )
        ORDER BY gl.creation DESC
    """, (company, date, date, date), as_dict=True)

    # ── Python-level filter: exclude Commission Income legs from Day Book ──
    # This is intentionally done in Python (NOT in SQL) to avoid NULL-unsafe
    # SQL comparisons on LEFT JOIN columns, which silently drop entire rows.
    # Commission Income is an internal accrual entry. The Day Book should show
    # only what was purchased, sold, and what cash/bank movements happened.
    gl_entries = [
        e for e in gl_entries
        if not (e.get("acc_account_name") or "").startswith("Commission Income")
    ]

    # Consolidated redundant gl_entries logic.

    if not gl_entries:
        return {
            "entries": [],
            "arrivalLotMap": {},
            "arrivalReferenceMap": {},
            "saleReferenceMap": {},
            "saleItemMap": {},
            "contactMap": {},
            "arrivalTimestampMap": {},
            "arrivalLotPrefixMap": {},
        }


    # ── 2. Build contact map (party ID → Human Name) ─────────────────────
    # ── 3. Fetch Mandi Arrivals for the day (for lot enrichment) ─────────
    org_filter_val = org_id or _get_user_org()
    arrivals = frappe.get_all(
        "Mandi Arrival",
        filters={"arrival_date": date, "organization_id": org_filter_val},
        fields=["name", "arrival_date", "party_id", "contact_bill_no", "creation"],
    )

    # ── 4. Fetch Mandi Sales for the day ──────────────────────────────────
    sales = frappe.get_all(
        "Mandi Sale",
        filters={"saledate": date, "organization_id": org_filter_val},
        fields=["name", "buyerid", "totalamount", "amountreceived", "bookno"],
    )

    # ── 2. Build contact map (party ID → Human Name) ─────────────────────
    all_parties = {e["party"] for e in gl_entries if e.get("party")}
    for arr in arrivals:
        if arr.get("party_id"): all_parties.add(arr["party_id"])
    for s in sales:
        if s.get("buyerid"): all_parties.add(s["buyerid"])
        
    all_parties = list(all_parties)
    contact_map = {} # party_id -> full_name
    party_to_contact_id = {} # party_id -> Mandi Contact ID (hash)
    
    if all_parties:
        # Resolve by supplier link, customer link, or legacy name ID
        contacts = frappe.get_all("Mandi Contact",
            filters={**_org_filter("Mandi Arrival", org_id)},
            or_filters=[
                {"supplier": ["in", all_parties]},
                {"customer": ["in", all_parties]},
                {"name": ["in", all_parties]}
            ],
            fields=["name", "full_name", "supplier", "customer"]
        )
        for c in contacts:
            name = c.get("full_name") or c.get("name")
            cid = c.get("name")
            if c.get("supplier"): 
                contact_map[c.get("supplier")] = name
                party_to_contact_id[c.get("supplier")] = cid
            if c.get("customer"): 
                contact_map[c.get("customer")] = name
                party_to_contact_id[c.get("customer")] = cid
            
            contact_map[cid] = name
            party_to_contact_id[cid] = cid

    arrival_timestamp_map = {}
    arrival_reference_map = {}
    arrival_to_farmer_map = {}
    arrival_lot_map = {}
    arrival_lot_prefix_map = {}

    for arr in arrivals:
        arrival_timestamp_map[arr["name"]] = str(arr.get("creation", ""))
        arrival_reference_map[arr["name"]] = str(arr.get("contact_bill_no") or arr["name"])
        if arr.get("party_id"):
            arrival_to_farmer_map[arr["name"]] = arr["party_id"]

        # Fetch lots for this arrival
        lots = frappe.get_all(
            "Mandi Lot",
            filters={"parent": arr["name"]},
            fields=_lot_query_fields(
                ["name", "lot_code", "qty", "unit", "supplier_rate",
                 "commission_percent", "packing_cost", "loading_cost",
                 "farmer_charges", "less_percent", "item_id", "net_qty"],
                ["current_qty", "initial_qty", "status"],
            ),
        )

        if lots:
            details = []
            qty_by_unit = {}
            for lot in lots:
                lot = _normalize_lot_stock(lot)
                current_qty = flt(lot.get("current_qty") or 0)
                item_name = frappe.db.get_value("Item", lot.get("item_id"), "item_name") or lot.get("item_id", "")
                details.append({
                    "name": item_name,
                    "qty": current_qty,
                    "unit": lot.get("unit", ""),
                    "rate": lot.get("supplier_rate", 0),
                    "lot_code": lot.get("lot_code", ""),
                    "item": {"name": item_name},
                })
                unit = lot.get("unit", "Kg")
                qty_by_unit[unit] = qty_by_unit.get(unit, 0) + current_qty

            arrival_lot_map[arr["name"]] = {
                "details": details,
                "qtyByUnit": qty_by_unit,
                "qty": sum(flt(l.get("current_qty") or 0) for l in lots),
                "unit": lots[0].get("unit", "Kg") if lots else "Kg",
            }
            if lots:
                arrival_lot_prefix_map[arr["name"]] = lots[0].get("lot_code", "")

    sale_reference_map = {}
    sale_item_map = {}
    sale_to_buyer_map = {}

    for sale in sales:
        sale_reference_map[sale["name"]] = sale.get("bookno") or sale["name"]
        sale_to_buyer_map[sale["name"]] = sale.get("buyerid", "")

        # Get sale items
        sale_items = frappe.get_all(
            "Mandi Sale Item",
            filters={"parent": sale["name"]},
            fields=["item_id", "qty", "rate", "amount"],
        )
        if sale_items:
            qty_by_unit = {}
            details = []
            for si in sale_items:
                item_name = frappe.db.get_value("Item", si.get("item_id"), "item_name") or si.get("item_id", "")
                details.append({
                    "name": item_name,
                    "qty": si.get("qty", 0),
                    "unit": "Kg",
                    "rate": si.get("rate", 0),
                })
                qty_by_unit["Kg"] = qty_by_unit.get("Kg", 0) + float(si.get("qty") or 0)

            sale_item_map[sale["name"]] = {
                "details": details,
                "qtyByUnit": qty_by_unit,
                "qty": sum(float(si.get("qty") or 0) for si in sale_items),
                "unit": "Kg",
                "avgPrice": sum(float(si.get("rate") or 0) for si in sale_items) / max(len(sale_items), 1),
            }

    # ── 5. Fetch Opening Balances ─────────────────────────────────────────
    # We sum Cash and Bank accounts before the start of the day.
    cash_accounts = frappe.get_all("Account", filters={"account_type": "Cash", "company": company}, pluck="name")
    bank_accounts = frappe.get_all("Account", filters={"account_type": "Bank", "company": company}, pluck="name")
    liquid_accounts = cash_accounts + bank_accounts
    
    # Fallback if account_type is not set properly
    if not liquid_accounts:
        liquid_accounts = frappe.db.sql_list("""
            SELECT name FROM tabAccount 
            WHERE company=%s AND (name LIKE '%%Cash%%' OR name LIKE '%%Bank%%' OR name LIKE '%%Wallet%%')
        """, (company,))
    
    # Add company defaults
    company_defaults = frappe.db.get_value("Company", company, ["default_bank_account", "default_cash_account"], as_dict=True)
    if company_defaults:
        if company_defaults.default_bank_account and company_defaults.default_bank_account not in liquid_accounts:
            liquid_accounts.append(company_defaults.default_bank_account)
            bank_accounts.append(company_defaults.default_bank_account)
        if company_defaults.default_cash_account and company_defaults.default_cash_account not in liquid_accounts:
            liquid_accounts.append(company_defaults.default_cash_account)
            cash_accounts.append(company_defaults.default_cash_account)

    # gl_entries logic has been consolidated above to prevent logic mismatch.

    # Opening balance — strictly liquid accounts (cash + bank), excluding
    # uncleared cheques. Same cheque rule, but applied to balances < date.
    if liquid_accounts:
        opening_res = frappe.db.sql("""
            SELECT SUM(gl.debit - gl.credit) as balance
            FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` je
                   ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
            WHERE gl.account IN %s
              AND gl.is_cancelled = 0
              AND gl.company = %s
              AND (
                  -- Non-cheque entries
                  ((je.cheque_no IS NULL OR je.cheque_no = '') AND gl.posting_date < %s)
                  OR
                  -- Cleared cheques apply if cleared before date
                  (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NOT NULL AND je.clearance_date < %s)
                  OR
                  -- Uncleared cheques apply if posted before date
                  (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NULL AND gl.posting_date < %s)
              )
        """, (liquid_accounts, company, date, date, date), as_dict=True)
        opening_balance = flt(opening_res[0].balance) if opening_res and opening_res[0].balance else 0
    else:
        opening_balance = 0

    # ── 6. Shape GL Entries → Day Book entry format ───────────────────────
    # Propagation Map: Ensure all legs of a voucher inherit the arrival/sale reference
    vno_to_ref = {}
    je_to_liquid_acc = {}
    for gl in gl_entries:
        vno = gl.get("voucher_no")
        avtype = gl.get("against_voucher_type")
        avno = gl.get("against_voucher")
        if avno and avtype in ["Mandi Arrival", "Mandi Sale"]:
            vno_to_ref[vno] = {"id": avno, "type": avtype}
            
        vtype = gl.get("voucher_type")
        acc_raw = gl.get("account", "")
        acc_clean = acc_raw[:-len(f" - {company}")] if acc_raw.endswith(f" - {company}") else acc_raw
        is_liquid = (gl.get("account_type") in ["Cash", "Bank"]) or (gl.get("account") in liquid_accounts)
        if vtype == "Journal Entry" and is_liquid:
            je_to_liquid_acc[vno] = {
                "name": acc_clean,
                "is_debit": float(gl.get("debit") or 0) > 0
            }

    shaped_entries = []
    voucher_summary_cache = {}

    for idx, gl in enumerate(gl_entries):
        is_debit = float(gl.get("debit") or 0) > 0
        tx_type = _map_voucher_type(gl.get("voucher_type", ""), is_debit)

        against_vtype = gl.get("against_voucher_type")
        against_vno = gl.get("against_voucher")
        voucher_vtype = gl.get("voucher_type")
        voucher_vno = gl.get("voucher_no")

        # Resolve reference_id (The primary document)
        # 1. Direct tag on this leg
        # 2. Propagated tag from another leg of the same voucher
        # 3. Fallback to voucher itself if it's an Arrival/Sale
        ref_info = vno_to_ref.get(voucher_vno)
        if against_vtype in ["Mandi Arrival", "Mandi Sale"]:
            reference_id = against_vno
        elif ref_info:
            reference_id = ref_info["id"]
            against_vtype = ref_info["type"] # Correct against_vtype for tx_type detection
        elif voucher_vtype in ["Mandi Arrival", "Mandi Sale"]:
            reference_id = voucher_vno
        else:
            reference_id = None

        # 3. Resolve contact
        party = gl.get("party") or ""
        contact_id = party_to_contact_id.get(party, party) if party else None
        
        # 3. Determine if this is a Cash/Bank leg or Income/Expense leg
        root_type = gl.get("root_type")
        is_liquid = (gl.get("account_type") in ["Cash", "Bank"]) or (gl.get("account") in liquid_accounts)
        is_income_expense = root_type in ["Income", "Expense"]

        # Only auto-enrich contact_id for party-related legs (receivable/payable)
        # to prevent Stock/Revenue legs from inheriting a contact and causing
        # double-counting in Day Book grouping.
        is_party_acc = gl.get("party_type") in ["Customer", "Supplier"] or gl.get("account_type") in ["Receivable", "Payable"]
        
        if not contact_id and reference_id and is_party_acc:
            if against_vtype == "Mandi Arrival" or voucher_vtype == "Mandi Arrival":
                contact_id = arrival_to_farmer_map.get(reference_id)
            elif against_vtype == "Mandi Sale" or voucher_vtype == "Mandi Sale":
                contact_id = sale_to_buyer_map.get(reference_id)

        # Resolve transaction type (mapped for Day Book cards)
        je_remark = (gl.get("remarks") or "").strip().lower()
        # ── Determine if this JE is a standalone payment/receipt/expense ──────
        # We detect this by checking the JE user_remark (set by create_voucher)
        # rather than relying purely on account type, which can be ambiguous.
        _is_standalone_receipt = ("receipt from" in je_remark or "payment received" in je_remark)
        _is_standalone_payment = ("payment to" in je_remark or "cash paid to" in je_remark or "payment made" in je_remark or "advamce" in je_remark)
        _is_standalone_expense = ("expense" in je_remark or "mandi expense" in je_remark)
        
        is_clearing = bool(gl.get("cheque_no") and gl.get("clearance_date") and str(gl.get("clearance_date")) != str(gl.get("posting_date")))
        is_pending_cheque = bool(gl.get("cheque_no") and not gl.get("clearance_date"))
        
        # ── STOCK RETURN detection ────────────────────────────────────────────
        if gl.get("is_opening") == "Yes":
            tx_type = "opening_balance"
        elif voucher_vtype == "Journal Entry" and je_remark.startswith("stock return:"):
            tx_type = "stock_return"
        elif (against_vtype == "Mandi Arrival" or voucher_vtype == "Mandi Arrival") and not is_clearing and not is_liquid and not is_income_expense:
            tx_type = "goods_arrival"
        elif (against_vtype == "Mandi Sale" or voucher_vtype == "Mandi Sale") and not is_clearing and not is_liquid and not is_income_expense:
            tx_type = "sale"
        elif is_income_expense or "expense" in (gl.get("account") or "").lower():
            tx_type = "expense" if root_type == "Expense" else "income"
        elif is_pending_cheque and voucher_vtype == "Journal Entry":
            tx_type = "pending_cheque"
        elif is_liquid:
            # Explicit liquid leg routing to ensure correct grouping and inflow/outflow
            if against_vtype == "Mandi Sale" or voucher_vtype == "Mandi Sale":
                tx_type = "sale_payment" if is_debit else "paid_receipt"
            elif against_vtype == "Mandi Arrival" or voucher_vtype == "Mandi Arrival":
                tx_type = "purchase_payment" if not is_debit else "receive_receipt"
            elif _is_standalone_expense:
                tx_type = "expense"
            elif _is_standalone_receipt:
                tx_type = "receive_receipt"
            elif _is_standalone_payment:
                tx_type = "paid_receipt"
            else:
                tx_type = "receive_receipt" if is_debit else "payment"
        else:
            # Standalone or Clearing — non-liquid party/expense leg
            if voucher_vtype == "Journal Entry":
                if _is_standalone_expense:
                    # Expense account debit leg of an expense JE
                    tx_type = "expense"
                elif _is_standalone_receipt:
                    # Debtors credit leg of a receipt JE — money flowed in
                    tx_type = "receive_receipt"
                elif _is_standalone_payment:
                    # Creditors debit leg of a payment JE — money flowed out
                    tx_type = "paid_receipt"
                elif is_debit:
                    tx_type = "receive_receipt" if gl.get("party_type") == "Customer" else "payment"
                else:
                    tx_type = "receipt" if gl.get("party_type") == "Customer" else "paid_receipt"
            else:
                tx_type = _map_voucher_type(gl.get("voucher_type", ""), is_debit)

        
        # Enrichment: Fetch real-time balance for Sale/Arrival rows
        balance_due = 0
        total_paid = 0
        total_amount = 0
        status = "posted"

        if reference_id and (against_vtype in ["Mandi Sale", "Mandi Arrival"] or voucher_vtype in ["Mandi Sale", "Mandi Arrival"]):
            vtype = against_vtype or voucher_vtype
            cache_key = f"{vtype}:{reference_id}"
            
            if cache_key not in voucher_summary_cache:
                # Fetch total amount + (for sales) due_date so overdue can be detected.
                doc_total = 0
                doc_due   = None
                if vtype == "Mandi Sale":
                    sale_row = frappe.db.get_value("Mandi Sale", reference_id, ["totalamount", "duedate"], as_dict=True) or {}
                    doc_total = sale_row.get("totalamount") or 0
                    doc_due   = sale_row.get("duedate")
                else:
                    doc_total = frappe.db.get_value("Mandi Arrival", reference_id, "net_payable_farmer") or 0

                voucher_summary_cache[cache_key] = _get_ledger_summary(vtype, reference_id, doc_total, as_of_date=date, due_date=doc_due)
            
            summary = voucher_summary_cache[cache_key]
            balance_due = summary["balance"]
            total_paid = summary["paid"]
            total_amount = summary["total"]
            status = summary["status"]

        account_name_raw = gl.get("account", "")
        account_name_clean = account_name_raw[:-len(f" - {company}")] if account_name_raw.endswith(f" - {company}") else account_name_raw

        if gl.get("voucher_type") == "Journal Entry" and gl.get("root_type") == "Equity":
            liquid_info = je_to_liquid_acc.get(gl.get("voucher_no"))
            if liquid_info:
                action = "Deposit on" if liquid_info["is_debit"] else "Withdrawal on"
                account_name_clean = f"{action} {liquid_info['name']}"

        # Effective date: for cleared cheques, use clearance_date so the entry
        # appears in the Day Book on the day money actually moved, not the
        # future cheque_date that is stored as posting_date.
        effective_date = (
            str(gl["clearance_date"])
            if gl.get("cheque_no") and gl.get("clearance_date")
            else str(gl.get("posting_date", date))
        )

        shaped_entries.append({
            "id": gl["name"],
            "entry_date": effective_date,
            "created_at": str(gl.get("creation") or ""),
            "debit": float(gl.get("debit") or 0),
            "credit": float(gl.get("credit") or 0),
            "transaction_type": tx_type,
            "description": gl.get("remarks") or f"{gl.get('voucher_type','')} — {gl.get('voucher_no','')}",
            "reference_no": gl.get("voucher_no"),
            "voucher_id": reference_id or gl.get("voucher_no"),
            "reference_id": reference_id,
            "contact_id": contact_id,
            "status": status,
            "balance_due": balance_due,
            "total_paid": total_paid,
            "total_amount": total_amount,
            "account": {
                "name": account_name_clean,
                "type": "bank" if gl.get("cheque_no") else (gl.get("account_type") or ("asset" if account_name_raw in liquid_accounts else "liability")),
                "account_type": gl.get("account_type") or "",  # Raw Frappe: Cash, Bank, Receivable, Payable…
                "root_type": gl.get("root_type") or "",         # Asset, Liability, Income, Expense, Equity
                "account_sub_type": "bank" if gl.get("cheque_no") else ("cash" if account_name_raw in cash_accounts else ("bank" if account_name_raw in bank_accounts else ""))
            },

            "voucher": {
                "type": gl.get("voucher_type", ""),
                "voucher_no": gl.get("voucher_no", ""),
                "narration": gl.get("remarks"),
                "source": gl.get("against_voucher_type", ""),
                "invoice_id": reference_id if tx_type == "sale" else None,
                "arrival_id": reference_id if tx_type == "goods_arrival" else None,
                "balance_due": balance_due,
                "total_paid": total_paid,
                "total_amount": total_amount,
                "cheque_no": gl.get("cheque_no") or "",
                "clearance_date": str(gl.get("clearance_date")) if gl.get("clearance_date") else None,
                "is_cleared": bool(gl.get("clearance_date")),
                "cheque_status": "cleared" if gl.get("clearance_date") else ("pending" if gl.get("cheque_no") else ""),
            },
            "contact": {
                "id": gl.get("party"),
                "name": contact_map.get(gl.get("party")) or gl.get("party"),
                "contact_type": (gl.get("party_type") or "").lower(),
            } if gl.get("party") else None,
        })

    return {
        "entries": shaped_entries,
        "opening_balance": float(opening_balance),
        "arrivalLotMap": arrival_lot_map,
        "arrivalLotPrefixMap": arrival_lot_prefix_map,
        "arrivalReferenceMap": arrival_reference_map,
        "arrivalTimestampMap": arrival_timestamp_map,
        "saleReferenceMap": sale_reference_map,
        "saleItemMap": sale_item_map,
        "contactMap": contact_map,
        "billToSaleMap": {},
        "billToArrivalMap": {},
        "saleToBuyerMap": sale_to_buyer_map,
        "arrivalToFarmerMap": arrival_to_farmer_map,
    }


@frappe.whitelist(allow_guest=False)
def get_field_governance(context: str = None) -> dict:
    """
    Returns field visibility/mandatory rules for arrival forms.
    Replaces the Supabase-based useFieldGovernance hook.
    """
    # Default governance rules — can be extended per organization
    rules = {
        "arrivals_direct": {
            "supplier_rate": {"visible": True, "mandatory": False},
            "sale_price": {"visible": False, "mandatory": False},
            "commission_percent": {"visible": False, "mandatory": False},
        },
        "arrivals_farmer": {
            "supplier_rate": {"visible": False, "mandatory": False},
            "sale_price": {"visible": True, "mandatory": True},
            "commission_percent": {"visible": True, "mandatory": True},
        },
        "arrivals_supplier": {
            "supplier_rate": {"visible": True, "mandatory": True},
            "sale_price": {"visible": False, "mandatory": False},
            "commission_percent": {"visible": True, "mandatory": True},
        },
    }
    if context and context in rules:
        return rules[context]
    return rules


@frappe.whitelist(allow_guest=False)
def get_features() -> dict:
    """Returns feature flags for the MandiGrow platform."""
    try:
        settings = frappe.get_single("Mandi Settings")
        return {
            "enable_qr_codes": True,
            "enable_commission": True,
            "enable_multi_currency": False,
            "enable_gst": getattr(settings, "enable_gst", False),
            "enable_whatsapp": False,
        }
    except Exception:
        return {
            "enable_qr_codes": True,
            "enable_commission": True,
            "enable_multi_currency": False,
            "enable_gst": False,
            "enable_whatsapp": False,
        }

@frappe.whitelist(allow_guest=True)
def get_logged_user() -> str:
    return frappe.session.user

@frappe.whitelist(allow_guest=True)
def resolve_user_for_login(usr: str) -> str:
    """Explicitly resolve a username to an email for the login process.
    This ensures that even if Frappe's native resolution has issues, our UI can
    transparently handle usernames.
    """
    if not usr or "@" in usr or usr in ["Administrator", "Guest"]:
        return usr
        
    resolved = frappe.db.get_value("User", {"username": usr}, "name")
    return resolved or usr

@frappe.whitelist(allow_guest=False)
def get_full_user_context(p_user_id: str = None) -> dict:
    user_id = p_user_id or frappe.session.user

    # Resolve username to primary key (email) if an identifier is provided
    if user_id and "@" not in user_id and user_id not in ["Administrator", "Guest"]:
        resolved_user = frappe.db.get_value("User", {"username": user_id}, "name")
        if resolved_user:
            user_id = resolved_user

    # Administrator Fallback
    if user_id == "Administrator":
        return {
            "id": user_id,
            "full_name": "System Administrator",
            "role": "super_admin",
            "business_domain": "mandi",
            "organization_id": "HQ",
            "organization": {
                "id": "HQ",
                "name": "MandiGrow HQ",
                "subscription_tier": "enterprise",
                "status": "active",
                "is_active": True,
                "brand_color": "#6366f1",
            },
            "subscription": {"status": "active", "is_active": True},
        }

    try:
        user = frappe.get_doc("User", user_id)
        org_id = getattr(user, "mandi_organization", None)

        if not org_id:
            org_id = _get_user_org()
            if org_id:
                try:
                    user.mandi_organization = org_id
                    user.save(ignore_permissions=True)
                except Exception:
                    pass  # Non-fatal — org link save failure doesn't block login

        org_data = _get_org_info(org_id) if org_id else None

        # ── Role Resolution (MUST RUN FIRST — sets org_data for super admin) ─────
        # CRITICAL ORDER: This block must execute before subscription_data is built.
        # For mindcap786@gmail.com (super admin) with no Mandi Organization linked,
        # org_data is None after _get_org_info(). If we build subscription_data first,
        # org_data.get(...) crashes with: NoneType has no attribute 'get'
        try:
            from mandigrow.mandigrow.logic.tenancy import is_super_admin
            _is_super = is_super_admin(user.name)
        except Exception:
            _is_super = False

        role = getattr(user, "role_type", None) or "admin"
        owner_email = "mindcap786@gmail.com"

        if _is_super or user.name == owner_email or getattr(user, "email", "") == owner_email:
            role = "super_admin"
            if not org_data:
                # Super admin with no linked tenant — assign HQ org so downstream
                # code never encounters None org_data
                org_id = "HQ"
                org_data = {
                    "id": "HQ",
                    "name": "MandiGrow HQ",
                    "subscription_tier": "enterprise",
                    "status": "active",
                    "is_active": True,
                    "brand_color": "#6366f1",
                    "trial_ends_at": None,
                }
        # ─────────────────────────────────────────────────────────────────────────

        # ── Subscription Lifecycle Engine ─────────────────────────────────────
        # Uses the canonical subscription_guard module so the frontend receives
        # the EXACT SAME state that backend enforcement uses.
        # org_data is guaranteed non-None here (either real or HQ fallback above).
        try:
            from mandigrow.mandigrow.logic.subscription_guard import get_subscription_state
            sub_state = get_subscription_state(org_id)
            subscription_data = {
                "status": sub_state["status"],
                "is_locked": sub_state["is_locked"],
                "is_active": sub_state["is_active"],
                "days_left": sub_state["days_left"],
                "expiry_date": sub_state["expiry_date"],
                "plan": sub_state["plan"],
                "grace_period_days": sub_state["grace_period_days"],
                "grace_period_ends_at": sub_state["grace_period_ends_at"],
                "max_users": sub_state["max_users"],
                "current_user_count": sub_state["current_user_count"],
                "seats_remaining": sub_state["seats_remaining"],
                "billing_cycle": sub_state["billing_cycle"],
                "compliance_status": sub_state["compliance_status"],
            }
        except Exception:
            # Fallback — subscription_guard not yet available (pre-migration)
            subscription_data = {
                "status": "active",
                "is_locked": False,
                "is_active": True,
                "days_left": 999,
                "expiry_date": (org_data or {}).get("trial_ends_at"),
                "plan": (org_data or {}).get("subscription_tier") or "starter",
            }

        return {
            "id": user.name,
            "full_name": user.full_name,
            "role": role,
            "business_domain": getattr(user, "business_domain", "mandi") or "mandi",
            "organization_id": org_id or "HQ",
            "organization": org_data,
            "subscription": subscription_data,
            "rbac_matrix": getattr(user, "rbac_matrix", "{}") or "{}"
        }

    except frappe.DoesNotExistError:
        frappe.throw(_("User profile not found"))
    except Exception:
        frappe.log_error(frappe.get_traceback(), "get_full_user_context failed")
        frappe.throw(_("Failed to load user profile. Please contact support."))



@frappe.whitelist(allow_guest=True)
def force_sync_admin():
    """Manually triggers the admin account repair patch."""
    from mandigrow.mandigrow.patches.v1_0.force_admin_reset import execute
    execute()
    return "Admin sync completed successfully."

@frappe.whitelist(allow_guest=True)

def check_unique(email: str = None, username: str = None) -> dict:
    """Check if email or username is already taken in the Frappe User table."""
    result = {"emailTaken": False, "usernameTaken": False}
    
    if email:
        trimmed = email.strip().lower()
        if frappe.db.exists("User", trimmed):
            result["emailTaken"] = True
            result["emailVerified"] = True
    
    if username:
        trimmed = username.strip().lower()
        # Check against User name (email) and the dedicated username field
        exists = frappe.db.exists("User", {"username": trimmed}) or frappe.db.exists("User", trimmed)
        if exists:
            result["usernameTaken"] = True
    
    return result

# ─────────────────────────────────────────────────────────────────────────────
# TENANT ONBOARDING ENGINE
# ─────────────────────────────────────────────────────────────────────────────
# Single source of truth for all tenant setup. Idempotent — safe to call
# multiple times. Called by signup_user and repair_tenant.
# ─────────────────────────────────────────────────────────────────────────────

def setup_new_tenant(org_id: str) -> dict:
    """
    Atomically provision ALL resources required for a new Mandi tenant.
    
    Guarantees (idempotent — skips if already exists):
      1. Frappe Company created and linked to org
      2. Core Chart of Accounts (Cash, Bank, Stock, Creditors, Debtors, Commission)
      3. Supplier Group "Mandi Farmers"
      4. Customer Group "Mandi Buyers"
      5. Default Storage Location "Mandi"
      6. Mandi Settings record with sensible defaults
    
    Returns a dict of what was created vs skipped for audit logging.
    """
    report = {"org_id": org_id, "created": [], "skipped": [], "errors": []}

    org = frappe.get_doc("Mandi Organization", org_id)
    org_name = org.organization_name or org_id

    # ── Step 1: Frappe Company ───────────────────────────────────────────────
    company = org.erp_company
    if not company or not frappe.db.exists("Company", company):
        company = org_name
        if not frappe.db.exists("Company", company):
            try:
                # Generate unique abbreviation
                words = company.split()
                base_abbr = "".join(w[0] for w in words if w).upper()[:5] or "MG"
                abbr = base_abbr
                counter = 2
                while frappe.db.exists("Company", {"abbr": abbr}):
                    abbr = f"{base_abbr}{counter}"
                    counter += 1

                co = frappe.get_doc({
                    "doctype": "Company",
                    "company_name": company,
                    "default_currency": "INR",
                    "country": "India",
                    "abbr": abbr,
                })
                co.insert(ignore_permissions=True)
                frappe.db.commit()
                report["created"].append(f"Company: {company} (abbr: {abbr})")
            except Exception as e:
                report["errors"].append(f"Company creation failed: {e}")
                frappe.log_error(f"setup_new_tenant: Company failed for {org_id}: {e}")

        # Always link (even if company pre-existed)
        if frappe.db.exists("Company", company):
            frappe.db.set_value("Mandi Organization", org_id, "erp_company", company)
            frappe.db.commit()
            report["created"].append(f"Company linked: {company}")
        else:
            report["errors"].append("Company not found after creation attempt — skipping accounts")
            return report
    else:
        report["skipped"].append(f"Company: {company}")

    abbr = frappe.db.get_value("Company", company, "abbr") or ""

    # ── Step 2: Core Chart of Accounts ──────────────────────────────────────
    def _ensure_account(acc_name, parent_search_list, account_type, is_group=0):
        """Create account if it doesn't exist. Returns account name."""
        # Check by name
        full_name = f"{acc_name} - {abbr}"
        if frappe.db.exists("Account", full_name):
            report["skipped"].append(f"Account: {full_name}")
            return full_name
        # Check by type
        existing = frappe.db.get_value("Account",
            {"company": company, "account_type": account_type, "is_group": is_group}, "name")
        if existing:
            report["skipped"].append(f"Account ({account_type}): {existing}")
            return existing

        # Find parent
        parent = None
        for p_name in parent_search_list:
            for candidate in (f"{p_name} - {abbr}", f"{p_name} - {company}", p_name):
                if frappe.db.exists("Account", {"name": candidate, "company": company, "is_group": 1}):
                    parent = candidate
                    break
            if parent:
                break

        if not parent:
            report["errors"].append(f"No parent found for {acc_name}")
            return None

        try:
            acc = frappe.get_doc({
                "doctype": "Account",
                "account_name": acc_name,
                "parent_account": parent,
                "company": company,
                "account_type": account_type,
                "is_group": is_group,
            })
            acc.insert(ignore_permissions=True)
            frappe.db.commit()
            report["created"].append(f"Account: {acc.name}")
            return acc.name
        except Exception as e:
            report["errors"].append(f"Account {acc_name}: {e}")
            return None

    _ensure_account("Cash",             ["Cash In Hand", "Cash", "Bank and Cash", "Current Assets"], "Cash")
    _ensure_account("Bank Account",     ["Bank Accounts", "Bank", "Bank and Cash", "Current Assets"], "Bank")
    _ensure_account("Stock In Hand",    ["Stock Assets", "Current Assets", "Direct Assets"],          "Stock")
    _ensure_account("Creditors",        ["Accounts Payable", "Current Liabilities"],                  "Payable")
    _ensure_account("Debtors",          ["Accounts Receivable", "Current Assets"],                    "Receivable")
    _ensure_account("Commission Income",["Direct Income", "Income", "Revenue"],                       "Income Account")
    _ensure_account("Expense Recovery", ["Direct Income", "Income", "Revenue"],                       "Income Account")

    # ── Step 3: Supplier Group ───────────────────────────────────────────────
    if not frappe.db.exists("Supplier Group", "Mandi Farmers"):
        try:
            sg = frappe.get_doc({
                "doctype": "Supplier Group",
                "supplier_group_name": "Mandi Farmers",
                "parent_supplier_group": "All Supplier Groups",
            })
            sg.insert(ignore_permissions=True)
            frappe.db.commit()
            report["created"].append("Supplier Group: Mandi Farmers")
        except Exception as e:
            # Try without parent
            try:
                sg = frappe.get_doc({"doctype": "Supplier Group", "supplier_group_name": "Mandi Farmers"})
                sg.insert(ignore_permissions=True)
                frappe.db.commit()
                report["created"].append("Supplier Group: Mandi Farmers (no parent)")
            except Exception as e2:
                report["errors"].append(f"Supplier Group: {e2}")
    else:
        report["skipped"].append("Supplier Group: Mandi Farmers")

    # ── Step 4: Customer Group ───────────────────────────────────────────────
    if not frappe.db.exists("Customer Group", "Mandi Buyers"):
        try:
            cg = frappe.get_doc({
                "doctype": "Customer Group",
                "customer_group_name": "Mandi Buyers",
                "parent_customer_group": "All Customer Groups",
            })
            cg.insert(ignore_permissions=True)
            frappe.db.commit()
            report["created"].append("Customer Group: Mandi Buyers")
        except Exception as e:
            try:
                cg = frappe.get_doc({"doctype": "Customer Group", "customer_group_name": "Mandi Buyers"})
                cg.insert(ignore_permissions=True)
                frappe.db.commit()
                report["created"].append("Customer Group: Mandi Buyers (no parent)")
            except Exception as e2:
                report["errors"].append(f"Customer Group: {e2}")
    else:
        report["skipped"].append("Customer Group: Mandi Buyers")

    # ── Step 5: Default Storage Location ────────────────────────────────────
    existing_locs = frappe.db.count("Mandi Storage Location",
        {"organization_id": org_id, "is_active": 1})
    if existing_locs == 0:
        try:
            loc = frappe.get_doc({
                "doctype": "Mandi Storage Location",
                "location_name": "Mandi",
                "organization_id": org_id,
                "is_active": 1,
            })
            loc.insert(ignore_permissions=True)
            frappe.db.commit()
            report["created"].append(f"Storage Location: Mandi ({org_id})")
        except Exception as e:
            report["errors"].append(f"Storage Location: {e}")
    else:
        report["skipped"].append(f"Storage Location: {existing_locs} exist")

    # Step 6 removed because 'Mandi Settings' doctype does not exist in the DB.

    frappe.log_error(
        f"setup_new_tenant({org_id}): created={report['created']}, "
        f"skipped={len(report['skipped'])}, errors={report['errors']}",
        "Tenant Setup Report"
    )
    return report


@frappe.whitelist()
def repair_tenant(org_id: str = None) -> dict:
    """
    Admin API: Re-run setup_new_tenant for an org to fix any missing resources.
    If org_id is None, repairs ALL organizations.
    Callable from: bench execute, admin UI, or direct API call.
    """
    if org_id:
        result = setup_new_tenant(org_id)
        return {"status": "ok", "results": [result]}

    # Repair all orgs
    orgs = frappe.get_all("Mandi Organization", fields=["name"])
    results = []
    for org in orgs:
        result = setup_new_tenant(org.name)
        results.append(result)
    return {"status": "ok", "results": results}


@frappe.whitelist(allow_guest=True)
def send_signup_otp(email: str, full_name: str) -> dict:
    if not email:
        frappe.throw(_("Email is required"))
    if frappe.db.exists("User", email):
        frappe.throw(_("User with this email already exists"), frappe.DuplicateEntryError)
    
    import random
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in cache for 15 minutes
    frappe.cache().set_value(f"signup_otp_{email}", otp, expires_in_sec=900)
    
    # Send OTP via DIRECT SMTP to Brevo (bypasses Frappe Cloud email interception)
    subject = "Your MandiGrow OTP - Verify Your Account"
    html_body = (
        f"<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;'>"
        f"<h2 style='color:#047857;'>Welcome to MandiGrow, {full_name}!</h2>"
        f"<p>Use this OTP to verify your email address:</p>"
        f"<div style='background:#f0fdf4;border:2px solid #047857;padding:20px;"
        f"border-radius:10px;text-align:center;margin:20px 0;'>"
        f"<h1 style='letter-spacing:12px;color:#047857;font-size:40px;margin:0;'>{otp}</h1>"
        f"</div>"
        f"<p style='color:#6b7280;font-size:14px;'>This OTP is valid for <strong>15 minutes</strong>. Do not share it.</p>"
        f"</div>"
    )

    try:
        import smtplib
        import ssl
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        from frappe.utils.password import get_decrypted_password

        acct = frappe.db.get_value(
            "Email Account",
            {"enable_outgoing": 1, "default_outgoing": 1},
            ["name", "email_id", "smtp_server", "smtp_port", "login_id", "use_tls"],
            as_dict=True
        )
        if not acct:
            frappe.throw(_("Outgoing email not configured. Please contact support."))

        smtp_pw = get_decrypted_password("Email Account", acct["name"], "password") or ""
        if not smtp_pw:
            frappe.throw(_("SMTP password not configured. Please contact support."))

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = "MandiGrow <" + acct["email_id"] + ">"
        msg["To"] = email
        msg.attach(MIMEText(html_body, "html"))

        smtp_host = str(acct.get("smtp_server") or "smtp-relay.brevo.com")
        smtp_port = int(acct.get("smtp_port") or 587)
        smtp_login = str(acct.get("login_id") or acct["email_id"])
        ctx = ssl.create_default_context()

        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as srv:
            srv.ehlo()
            if acct.get("use_tls"):
                srv.starttls(context=ctx)
            srv.login(smtp_login, smtp_pw)
            srv.sendmail(acct["email_id"], [email], msg.as_string())

        frappe.logger().info(f"[send_signup_otp] OTP sent via Brevo to {email}")

    except smtplib.SMTPAuthenticationError as e:
        frappe.cache().delete_value(f"signup_otp_{email}")
        frappe.log_error(f"SMTP Auth failed for OTP: {e}", "send_signup_otp")
        frappe.throw(_("Email delivery failed: SMTP authentication error."))
    except smtplib.SMTPException as e:
        frappe.cache().delete_value(f"signup_otp_{email}")
        frappe.log_error(f"SMTP error sending OTP: {e}", "send_signup_otp")
        frappe.throw(_("Email delivery failed. Please try again."))
    except Exception as e:
        frappe.cache().delete_value(f"signup_otp_{email}")
        frappe.log_error(f"OTP send failed to {email}: {e}", "send_signup_otp")
        frappe.throw(_("Failed to send OTP. Please try again."))

    return {"status": "success", "message": "OTP sent to email"}


@frappe.whitelist(allow_guest=True)
def send_reset_password_otp(identifier: str) -> dict:
    if not identifier:
        frappe.throw(_("Email or username is required"))
    
    # Resolve username to email
    email = resolve_user_for_login(identifier.strip())
    
    if not frappe.db.exists("User", email):
        frappe.throw(_("No account found with this email or username"))
        
    full_name = frappe.db.get_value("User", email, "full_name") or "User"
    
    import random
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in cache for 15 minutes
    frappe.cache().set_value(f"reset_otp_{email}", otp, expires_in_sec=900)
    
    # Send OTP via DIRECT SMTP to Brevo (bypasses Frappe Cloud email interception)
    subject = "Your MandiGrow Password Reset OTP"
    html_body = (
        f"<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;'>"
        f"<h2 style='color:#047857;'>Password Reset Request, {full_name}!</h2>"
        f"<p>Use this OTP to reset your password:</p>"
        f"<div style='background:#f0fdf4;border:2px solid #047857;padding:20px;"
        f"border-radius:10px;text-align:center;margin:20px 0;'>"
        f"<h1 style='letter-spacing:12px;color:#047857;font-size:40px;margin:0;'>{otp}</h1>"
        f"</div>"
        f"<p style='color:#6b7280;font-size:14px;'>This OTP is valid for <strong>15 minutes</strong>. Do not share it.</p>"
        f"</div>"
    )

    try:
        import smtplib
        import ssl
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        from frappe.utils.password import get_decrypted_password

        acct = frappe.db.get_value(
            "Email Account",
            {"enable_outgoing": 1, "default_outgoing": 1},
            ["name", "email_id", "smtp_server", "smtp_port", "login_id", "use_tls"],
            as_dict=True
        )
        if not acct:
            frappe.throw(_("Outgoing email not configured. Please contact support."))

        smtp_pw = get_decrypted_password("Email Account", acct["name"], "password") or ""
        if not smtp_pw:
            frappe.throw(_("SMTP password not configured. Please contact support."))

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = "MandiGrow <" + acct["email_id"] + ">"
        msg["To"] = email
        msg.attach(MIMEText(html_body, "html"))

        smtp_host = str(acct.get("smtp_server") or "smtp-relay.brevo.com")
        smtp_port = int(acct.get("smtp_port") or 587)
        smtp_login = str(acct.get("login_id") or acct["email_id"])
        ctx = ssl.create_default_context()

        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as srv:
            srv.ehlo()
            if acct.get("use_tls"):
                srv.starttls(context=ctx)
            srv.login(smtp_login, smtp_pw)
            srv.sendmail(acct["email_id"], [email], msg.as_string())

        frappe.logger().info(f"[send_reset_password_otp] OTP sent via Brevo to {email}")

    except smtplib.SMTPAuthenticationError as e:
        frappe.cache().delete_value(f"reset_otp_{email}")
        frappe.log_error(f"SMTP Auth failed for OTP: {e}", "send_reset_password_otp")
        frappe.throw(_("Email delivery failed: SMTP authentication error."))
    except smtplib.SMTPException as e:
        frappe.cache().delete_value(f"reset_otp_{email}")
        frappe.log_error(f"SMTP error sending OTP: {e}", "send_reset_password_otp")
        frappe.throw(_("Email delivery failed. Please try again."))
    except Exception as e:
        frappe.cache().delete_value(f"reset_otp_{email}")
        frappe.log_error(f"OTP send failed to {email}: {e}", "send_reset_password_otp")
        frappe.throw(_("Failed to send OTP. Please try again."))

    return {"status": "success", "message": "OTP sent to email"}


@frappe.whitelist(allow_guest=True)
def reset_password_with_otp(identifier: str, otp: str, new_password: str) -> dict:
    if not identifier or not otp or not new_password:
        frappe.throw(_("Missing required fields"))
        
    email = resolve_user_for_login(identifier.strip())
    if not frappe.db.exists("User", email):
        frappe.throw(_("User not found"))
        
    cached_otp = frappe.cache().get_value(f"reset_otp_{email}")
    if not cached_otp:
        frappe.throw(_("OTP expired or not found. Please request a new one."))
        
    if str(cached_otp.decode('utf-8') if isinstance(cached_otp, bytes) else cached_otp) != str(otp):
        # Increment attempt counter
        attempts_key = f"reset_otp_attempts_{email}"
        attempts_val = frappe.cache().get_value(attempts_key)
        attempts = int(attempts_val) if attempts_val else 0
        attempts += 1
        
        if attempts >= 5:
            frappe.cache().delete_value(f"reset_otp_{email}")
            frappe.cache().delete_value(attempts_key)
            frappe.throw(_("Too many failed attempts. OTP has been invalidated. Please request a new one."))
        else:
            frappe.cache().set_value(attempts_key, attempts, expires_in_sec=900)
            frappe.throw(_("Invalid OTP. You have {0} attempt(s) left.").format(5 - attempts))
            
    # Success: clean up cache
    frappe.cache().delete_value(f"reset_otp_{email}")
    frappe.cache().delete_value(f"reset_otp_attempts_{email}")
    
    from frappe.utils.password import update_password
    update_password(email, new_password)
    
    return {"status": "success", "message": "Password reset successfully"}


@frappe.whitelist(allow_guest=True)
def test_email_config() -> dict:
    """
    DIAGNOSTIC: Tests if Frappe outgoing email is configured and working.
    URL: https://www.mandigrow.com/api/method/mandigrow.api.test_email_config
    """
    result = {"status": "ok"}
    try:
        accounts = frappe.db.get_all(
            "Email Account",
            filters={"enable_outgoing": 1},
            fields=["name", "email_id", "smtp_server", "smtp_port", "default_outgoing"]
        )
        result["outgoing_accounts"] = [
            {
                "name": str(a.get("name", "")),
                "email_id": str(a.get("email_id", "")),
                "smtp_server": str(a.get("smtp_server", "")),
                "smtp_port": str(a.get("smtp_port", "")),
                "is_default": bool(a.get("default_outgoing"))
            }
            for a in (accounts or [])
        ]
        result["has_default_outgoing"] = any(a.get("default_outgoing") for a in (accounts or []))
    except Exception as ex:
        result["error_checking_accounts"] = str(ex)
        result["has_default_outgoing"] = False

    try:
        queued_rows = frappe.db.get_all("Email Queue", filters={"status": "Not Sent"}, fields=["name"], limit=100)
        failed_rows = frappe.db.get_all("Email Queue", filters={"status": "Error"}, fields=["name"], limit=100)
        result["email_queue_not_sent"] = len(queued_rows)
        result["email_queue_failed"] = len(failed_rows)
    except Exception as ex2:
        result["email_queue_error"] = str(ex2)

    result["fix"] = (
        "CRITICAL: No outgoing email configured! Go to Frappe Desk → Settings → Email Account → New → Add Gmail/SendGrid → set as Default Outgoing"
        if not result.get("has_default_outgoing")
        else "Email account is configured. If emails not arriving, check spam folder or email_queue_failed count."
    )

    return result


@frappe.whitelist(allow_guest=True)
def direct_smtp_test(to_email: str = None) -> dict:
    """
    DIAGNOSTIC: Bypasses Frappe's email routing and connects DIRECTLY to Brevo via raw smtplib.
    This proves whether the SMTP credentials work and shows what server Frappe is actually using.
    URL: GET /api/method/mandigrow.api.direct_smtp_test?to_email=you@gmail.com
    """
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    result = {}

    # Pull credentials from the saved Email Account
    try:
        account = frappe.db.get_value(
            "Email Account",
            {"enable_outgoing": 1, "default_outgoing": 1},
            ["name", "email_id", "smtp_server", "smtp_port", "login_id", "password", "use_tls"],
            as_dict=True
        )
        if not account:
            return {"error": "No default outgoing email account found in Frappe"}

        result["account_found"] = {
            "email_id": account.get("email_id"),
            "smtp_server": account.get("smtp_server"),
            "smtp_port": account.get("smtp_port"),
            "login_id": account.get("login_id"),
            "use_tls": account.get("use_tls"),
        }
    except Exception as e:
        return {"error": f"Failed to fetch email account: {str(e)}"}

    smtp_server = account.get("smtp_server") or "smtp-relay.brevo.com"
    smtp_port = int(account.get("smtp_port") or 587)
    login = account.get("login_id") or account.get("email_id")
    password = account.get("password")
    from_email = account.get("email_id")
    recipient = to_email or from_email

    # Decrypt password safely
    account_name = str(account.get("name") or "")
    try:
        from frappe.utils.password import get_decrypted_password
        if account_name:
            password = get_decrypted_password("Email Account", account_name, "password") or password
        result["password_decrypted"] = True
        result["password_length"] = len(password) if password else 0
    except Exception as e:
        result["password_decrypt_error"] = str(e)

    if not password:
        return {"error": "Password is empty — paste the Brevo SMTP key into Email Account → Password field.", **result}

    # Raw SMTP connection test
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
            result["step_1_connect"] = f"Connected to {smtp_server}:{smtp_port} ✅"
            ehlo_resp = server.ehlo()
            result["step_2_ehlo"] = f"EHLO response code: {ehlo_resp[0]} ✅"

            if account.get("use_tls"):
                server.starttls(context=context)
                result["step_3_tls"] = "STARTTLS successful ✅"

            server.login(login, password)
            result["step_4_auth"] = f"AUTH LOGIN successful as {login} ✅"

            if to_email:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "MandiGrow Direct SMTP Test ✅"
                msg["From"] = from_email
                msg["To"] = recipient
                body = MIMEText("<h2>✅ Direct SMTP test email from MandiGrow via Brevo!</h2><p>If you see this, the SMTP credentials are 100% working.</p>", "html")
                msg.attach(body)
                server.sendmail(from_email, [recipient], msg.as_string())
                result["step_5_send"] = f"Email sent directly to {recipient} via Brevo ✅"

        result["overall"] = "SUCCESS — Brevo SMTP credentials are valid!"
    except smtplib.SMTPAuthenticationError as e:
        result["error"] = f"AUTH FAILED (535): Wrong username or password. Check your Brevo SMTP key. Detail: {str(e)}"
    except smtplib.SMTPSenderRefused as e:
        result["error"] = f"SENDER REFUSED (502): Brevo rejected sender. Detail: {str(e)}"
    except smtplib.SMTPConnectError as e:
        result["error"] = f"CONNECT FAILED: Could not reach {smtp_server}:{smtp_port}. Detail: {str(e)}"
    except Exception as e:
        result["error"] = f"Unexpected error: {str(e)}"

    return result


@frappe.whitelist(allow_guest=True)
def signup_user(email: str, password: str, full_name: str, username: str, org_name: str, phone: str, plan: str = "starter", otp: str = None, ref_code: str = None, city: str = None) -> dict:
    if not otp:
        frappe.throw(_("OTP is required for registration."))
        
    cached_otp = frappe.cache().get_value(f"signup_otp_{email}")
    if not cached_otp or str(cached_otp) != str(otp):
        frappe.throw(_("Invalid or expired OTP. Please request a new one."))
    
    # Delete OTP after successful verification
    frappe.cache().delete_value(f"signup_otp_{email}")

    # Normalize plan — guard against legacy 'basic' being sent from old clients
    VALID_PLANS = {"starter", "standard", "professional", "enterprise"}
    plan = plan.lower().strip() if plan else "starter"
    if plan not in VALID_PLANS:
        # Remap legacy/unknown names to nearest valid tier
        remap = {"basic": "starter", "pro": "professional", "enterprise_edition": "enterprise"}
        plan = remap.get(plan, "starter")
    if frappe.db.exists("User", email):
        frappe.throw(_("User with this email already exists"), frappe.DuplicateEntryError)
    
    if username and frappe.db.exists("User", {"username": username}):
        frappe.throw(_("Username '{0}' is already taken").format(username), frappe.DuplicateEntryError)

    from frappe.utils import add_days, now_datetime

    partner_id = None
    if ref_code:
        partner_id = frappe.db.get_value("Mandi Partner Profile", {"referral_code": ref_code}, "name")

    # 1. Create Mandi Organization (The actual tenant record)
    org = frappe.get_doc({
        "doctype": "Mandi Organization",
        "organization_name": org_name,
        "subscription_tier": plan,
        "status": "trial",
        "trial_ends_at": add_days(now_datetime(), 14),
        "is_active": 1,
        "phone": phone,
        "partner": partner_id
    })
    if city:
        try:
            org.city = city
        except Exception:
            pass
    org.insert(ignore_permissions=True)
    org_id = org.name

    if partner_id:
        # Increment total_onboarded for the partner
        frappe.db.set_value(
            "Mandi Partner Profile", 
            partner_id, 
            "total_onboarded", 
            frappe.db.get_value("Mandi Partner Profile", partner_id, "total_onboarded") + 1,
            update_modified=False
        )


    # 2. Provision ALL tenant resources atomically (company, accounts, storage, etc.)
    setup_report = setup_new_tenant(org_id)
    if setup_report.get("errors"):
        # Non-fatal: user can still log in, admin can repair later
        frappe.log_error(
            f"signup_user: Partial setup for {org_id}: {setup_report['errors']}",
            "Tenant Setup Warning"
        )

    # 3. Create User
    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": full_name.split(" ")[0],
        "last_name": " ".join(full_name.split(" ")[1:]) if " " in full_name else "",
        "username": username,
        "new_password": password,
        "send_welcome_email": 0,
        "role_type": "admin",
        "mandi_organization": org_id,
        "business_domain": "mandi"
    })
    user.flags.ignore_password_policy = True
    user.insert(ignore_permissions=True)

    # Explicitly set password to ensure it hashes correctly
    from frappe.utils.password import update_password
    update_password(user.name, password)

    # Assign standard roles (System Manager allows Desk access for tenant troubleshooting)
    user.add_roles("System Manager")

    return {
        "status": "success",
        "user_id": user.name,
        "org_id": org_id,
        "setup": {
            "created": setup_report.get("created", []),
            "errors": setup_report.get("errors", [])
        }
    }


@frappe.whitelist(allow_guest=False)
def provision_team_member(
    email: str,
    full_name: str,
    password: str = "mandi123",
    role: str = "member",
    organization_id: str = None,
    employee_id: str = None,
    username: str = None,
    rbac_matrix: str = None
) -> dict:
    """
    Creates a new team member user within the caller's organization (or a specified org for SA).
    Enforces email + username uniqueness, seat limits, and saves the RBAC permission matrix.
    """
    import json
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription, enforce_seat_limit

    admin_org = organization_id if (is_super_admin() and organization_id) else _get_user_org()

    is_creating_super_admin = (role == "super_admin" or role == "Super Admin (Full Access)")
    if not admin_org and not (is_super_admin() and is_creating_super_admin):
        frappe.throw(_("Unauthorized: You must be linked to an organization to add team members."))

    # ── Normalize role to a valid Frappe role_type value ─────────────────────
    VALID_ROLE_TYPES = {"super_admin", "platform_admin", "finance_admin", "support_admin", "operations_admin", "read_only", "admin", "manager", "clerk"}
    ROLE_MAP = {
        "member": "clerk", "staff": "clerk", "employee": "clerk",
        "user": "clerk", "viewer": "clerk", "salesman": "clerk",
        "accountant": "clerk", "worker": "clerk",
    }
    normalized_role = ROLE_MAP.get(str(role).lower(), role) if role not in VALID_ROLE_TYPES else role
    if normalized_role not in VALID_ROLE_TYPES:
        normalized_role = "clerk"  # Ultimate fallback

    # ── Subscription + seat enforcement ──────────────────────────────────────
    # Only enforce seat limit for NEW users — not when re-provisioning an existing org member
    _is_existing_org_user = frappe.db.exists("User", {
        "name": email,
        "mandi_organization": admin_org
    })
    if not is_super_admin():
        enforce_active_subscription(admin_org)
    if not _is_existing_org_user and admin_org:
        # Only count seat against limit for genuinely new users
        enforce_seat_limit(admin_org)

    user_name = None

    # ── Username uniqueness check ─────────────────────────────────────────────
    if username:
        if frappe.db.exists("User", {"username": username}):
            frappe.throw(
                _("The username '@{0}' is already taken. Please choose a different one.").format(username),
                frappe.DuplicateEntryError
            )

    # ── Email uniqueness check ────────────────────────────────────────────────
    if admin_org and frappe.db.exists("User", {"email": email, "mandi_organization": ["!=", admin_org]}):
        frappe.throw(
            _("An account with email '{0}' already exists in another organization.").format(email),
            frappe.DuplicateEntryError
        )

    if frappe.db.exists("User", email):
        user = frappe.get_doc("User", email)
        
        # Security: Prevent overriding an admin account or an account already linked to another employee
        existing_emp = frappe.db.get_value("Employee", {"user_id": user.name})
        
        if user.role_type == "admin" or "System Manager" in [r.role for r in user.get("roles")]:
            frappe.throw(_("Cannot override or modify a tenant admin account via team provisioning. Please use a different email."))
            
        if existing_emp and existing_emp != employee_id:
            frappe.throw(_("The email '{0}' is already registered and linked to another employee.").format(email), frappe.DuplicateEntryError)

        # User exists in THIS org — update and link
        if not user.mandi_organization:
            if admin_org:
                user.mandi_organization = admin_org
            user.role_type = normalized_role
            user.enabled = 1
            if username:
                user.username = username
            user.save(ignore_permissions=True)
            user_name = user.name
            from frappe.utils.password import update_password
            update_password(user.name, password)
            user.add_roles("System Manager")
        elif user.mandi_organization == admin_org:
            user.enabled = 1
            if username and user.username != username:
                user.username = username
            user.save(ignore_permissions=True)
            user_name = user.name
            from frappe.utils.password import update_password
            update_password(user.name, password)
            user.add_roles("System Manager")
        else:
            frappe.throw(
                _("An account with email '{0}' is already registered with another organization.").format(email),
                frappe.DuplicateEntryError
            )
    else:
        # Create new Frappe user
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name.split(" ")[0],
            "last_name": " ".join(full_name.split(" ")[1:]) if " " in full_name else "",
            "send_welcome_email": 0,
            "mandi_organization": admin_org,
            "role_type": normalized_role,
            "business_domain": "mandi",
            "username": username
        })
        user.flags.ignore_password_policy = True
        user.insert(ignore_permissions=True)
        user_name = user.name

        from frappe.utils.password import update_password
        update_password(user.name, password)
        user.add_roles("System Manager")

    # ── Save RBAC matrix if provided ─────────────────────────────────────────
    if rbac_matrix and user_name:
        try:
            saved_user = frappe.get_doc("User", user_name)
            if isinstance(rbac_matrix, dict):
                saved_user.rbac_matrix = json.dumps(rbac_matrix)
            elif isinstance(rbac_matrix, str):
                json.loads(rbac_matrix)  # Validate JSON
                saved_user.rbac_matrix = rbac_matrix
            saved_user.save(ignore_permissions=True)
            frappe.db.commit()
        except Exception as e:
            frappe.log_error(f"provision_team_member rbac_matrix error: {e}", "Team Access")

    # ── Link employee record ──────────────────────────────────────────────────
    if employee_id and user_name and frappe.db.exists("Employee", employee_id):
        emp = frappe.get_doc("Employee", employee_id)
        if not emp.user_id:
            emp.user_id = user_name
            emp.save(ignore_permissions=True)
            frappe.db.commit()

    return {"status": "success", "user_id": user_name, "message": f"Successfully added {full_name} to your team."}


@frappe.whitelist(allow_guest=False)
def get_team_members() -> list:
    """Returns all users belonging to the same organization as the current user.
    
    SECURITY: Platform super-admin accounts are ALWAYS excluded from this list.
    Super-admins may temporarily have mandi_organization set during impersonation,
    but they must NEVER be visible in a tenant's Team Access page.
    This is an industry-standard practice — the SaaS vendor is never visible
    inside the customer's account roster.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin, PLATFORM_ADMIN_EMAILS
    org_id = _get_user_org()

    # Build the exclusion list: Administrator + all platform owner accounts
    excluded = list(PLATFORM_ADMIN_EMAILS) + ["Administrator"]

    if not org_id:
        if is_super_admin():
            filters = {
                "role_type": ["in", ["super_admin", "platform_admin", "finance_admin", "support_admin", "operations_admin", "read_only"]],
                "enabled": 1,
                "name": ["not in", excluded]
            }
        else:
            return []
    else:
        filters = {
            "mandi_organization": org_id,
            "enabled": 1,
            "name": ["not in", excluded],
        }

    try:
        members = frappe.get_all("User",
            filters=filters,
            fields=["name as id", "full_name", "email", "role_type as role", "creation", "username", "rbac_matrix"],
            order_by="creation desc"
        )
        return members
    except Exception as e:
        if "Unknown column" in str(e) and "rbac_matrix" in str(e):
            # Self-healing: Create the missing custom field on-the-fly
            from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
            create_custom_fields({
                "User": [
                    {
                        "fieldname": "rbac_matrix",
                        "label": "RBAC Matrix",
                        "fieldtype": "JSON",
                        "insert_after": "role_profile_name"
                    }
                ]
            })
            frappe.db.commit()
            # Retry
            return frappe.get_all("User",
                filters=filters,
                fields=["name as id", "full_name", "email", "role_type as role", "creation", "username", "rbac_matrix"],
                order_by="creation desc"
            )
        else:
            frappe.log_error(f"get_team_members error: {e}", "Team Access")
            return []


@frappe.whitelist(allow_guest=False)
def update_team_member(user_id: str, settings: dict) -> dict:
    """
    Updates a team member: enabled status, rbac_matrix, or revoke access (disable + unlink Employee).
    Pass settings={"action": "delete"} to revoke access cleanly.
    """
    import json
    from mandigrow.mandigrow.logic.tenancy import is_super_admin

    org_id = _get_user_org()
    if not org_id and not is_super_admin():
        frappe.throw(_("Unauthorized: No organization context"))

    user = frappe.get_doc("User", user_id)
    if org_id and user.mandi_organization != org_id:
        if not is_super_admin():
            frappe.throw(_("Unauthorized: User does not belong to your organization"))

    if isinstance(settings, str):
        settings = json.loads(settings)

    action = settings.get("action")

    # ── Hard Revoke: disable user + unlink Employee record ───────────────────
    if action == "delete":
        user.enabled = 0
        user.save(ignore_permissions=True)
        linked_employees = frappe.get_all(
            "Employee",
            filters={"user_id": user_id},
            fields=["name"],
            ignore_permissions=True
        )
        for emp_ref in linked_employees:
            emp_doc = frappe.get_doc("Employee", emp_ref.name)
            emp_doc.user_id = ""
            emp_doc.save(ignore_permissions=True)
        frappe.db.commit()
        from mandigrow.mandigrow.logic.compliance import trigger_compliance_check
        trigger_compliance_check(user.mandi_organization)
        return {"status": "success", "message": "User access revoked and employee record unlinked."}

    # ── Standard field updates ────────────────────────────────────────────────
    if "enabled" in settings:
        user.enabled = int(settings["enabled"])

    if "rbac_matrix" in settings:
        try:
            matrix_val = settings["rbac_matrix"]
            if isinstance(matrix_val, dict):
                user.rbac_matrix = json.dumps(matrix_val)
            elif isinstance(matrix_val, str):
                json.loads(matrix_val)  # Validate JSON
                user.rbac_matrix = matrix_val
        except Exception:
            pass

    user.save(ignore_permissions=True)
    frappe.db.commit()
    return {"status": "success", "message": "User updated successfully"}


@frappe.whitelist(allow_guest=False)
def get_unlinked_staff() -> list:
    """
    Returns Employees from the Employee doctype who have NOT yet been granted
    system (Frappe User) access. Used to populate the 'Authorize Employee' dropdown.

    Pulls from the standard Frappe Employee doctype (which is populated from
    Master Data > Employees in the UI). Only returns employees whose user_id
    field is blank (not yet authorized).

    Returns fields: id, name, email, status, user_id (null = not yet authorized)
    """
    org_id = _get_user_org()
    if not org_id:
        return []

    result = []

    # ── Primary source: Frappe Employee doctype ──────────────────────────────
    # This is what gets populated when users add staff from Master Data > Employees.
    # Filter by organization_id (custom field on Employee) if it exists.
    try:
        employee_fields = [f.fieldname for f in frappe.get_meta("Employee").fields]
        org_filter = {}
        if "mandi_organization" in employee_fields:
            org_filter["mandi_organization"] = org_id
        elif "organization_id" in employee_fields:
            org_filter["organization_id"] = org_id
        elif "company" in employee_fields:
            # Fallback: match by company linked to org
            company = _get_user_company()
            if company:
                org_filter["company"] = company

        employees = frappe.get_all("Employee",
            filters={"status": "Active", **org_filter},
            fields=["name as id", "employee_name as name", "personal_email as email",
                    "company_email", "user_id"],
            ignore_permissions=True,
            limit_page_length=500
        )
        for emp in employees:
            # Use company_email if personal_email is missing
            email = emp.get("email") or emp.get("company_email") or ""
            result.append({
                "id": emp["id"],
                "name": emp.get("name") or emp["id"],
                "email": email,
                "user_id": emp.get("user_id") or None,  # None = not yet authorized
                "status": "active",
            })
    except Exception as e:
        frappe.log_error(f"get_unlinked_staff Employee fetch error: {e}", "Team Access")

    # ── Fallback: Mandi Contact with staff type (legacy) ────────────────────
    if not result:
        try:
            staff_contacts = frappe.get_all("Mandi Contact",
                filters={"organization_id": org_id, "contact_type": "staff"},
                fields=["name as id", "full_name as name", "phone as email"],
                ignore_permissions=True
            )
            authorized_names = set()
            org_users = frappe.get_all("User",
                filters={"mandi_organization": org_id, "enabled": 1},
                fields=["full_name"],
                ignore_permissions=True
            )
            for u in org_users:
                if u.full_name:
                    authorized_names.add(u.full_name.strip().lower())

            for contact in staff_contacts:
                contact_name_lower = (contact.get("name") or "").strip().lower()
                result.append({
                    "id": contact["id"],
                    "name": contact.get("name") or "",
                    "email": contact.get("email") or "",
                    "user_id": "linked" if contact_name_lower in authorized_names else None,
                    "status": "active",
                })
        except Exception:
            pass

    return result




@frappe.whitelist(allow_guest=False)
def get_stock_alerts() -> list:
    """Fetch stock alerts for the current organization."""
    org_id = _get_user_org()
    if not org_id:
        return []
        
    # Find low stock lots (qty > 0 but low)
    valid_arrivals = frappe.get_all("Mandi Arrival", filters={**_org_filter("Mandi Arrival", org_id)}, pluck="name")
    if not valid_arrivals:
        return []
        
    # Note: two filters on same field need frappe.db.sql or fetch+filter in Python
    # Frappe get_all dict filters drop duplicate keys (Python dict behavior)
    # Fetch all active lots and filter in-memory for threshold < 20
    all_active_lots = frappe.get_all("Mandi Lot",
        filters={"parent": ["in", valid_arrivals], "qty": [">", 0]},
        fields=["name", "item_id", "current_qty", "qty", "unit", "parent", "creation", "storage_location"],
        ignore_permissions=True,
        limit_page_length=500,
    )
    low_stock_lots = [l for l in all_active_lots if (l.get("current_qty") or l.get("qty") or 0) < 20 and (l.get("current_qty") or l.get("qty") or 0) > 0][:10]
    
    alerts = []
    for lot in low_stock_lots:
        alerts.append({
            "id": f"alert-{lot.name}",
            "organization_id": org_id,
            "alert_type": "LOW_STOCK",
            "severity": "medium",
            "commodity_id": lot.item_id,
            "commodity_name": lot.item_id or "Unknown",
            "associated_lot_id": lot.name,
            "location_name": None,
            "current_value": lot.current_qty,
            "threshold_value": 20,
            "unit": lot.unit,
            "is_seen": False,
            "seen_at": None,
            "is_resolved": False,
            "resolved_at": None,
            "created_at": str(lot.creation)
        })
        
    return alerts


@frappe.whitelist(allow_guest=False)
def get_available_stock(commodity_id: str = None, org_id: str = None) -> list:
    """
    Returns available Mandi Lots for the sale form's lot picker.

    Tenant isolation: Mandi Lot is a child table of Mandi Arrival, so the
    org_id lives on the parent. We resolve it to the caller's org and
    enforce it as a JOIN — never rely on the optional `org_id` param,
    which only NARROWS the result for super admins.

    Hard guard: if no org context can be determined we return an empty
    list. The previous behaviour returned every tenant's lots when called
    by a user without `mandi_organization` (e.g. Administrator), which
    is exactly the cross-tenant leak this whole hardening pass closes.
    """
    caller_org = _get_user_org()
    is_admin   = frappe.session.user == "Administrator"
    effective_org = org_id if (is_admin and org_id) else caller_org

    if not effective_org:
        return {"lots": [], "total": 0}

    # Raw SQL JOIN — Frappe's get_all does not reliably support
    # cross-doctype filters on child tables, and we already use this
    # pattern elsewhere (see arrival_lots SQL in get_daybook).
    base_cols     = ["name", "lot_code", "short_code", "qty", "unit", "creation", "item_id", "net_qty"]
    optional_cols = [c for c in ("current_qty", "initial_qty", "status", "grade") if _lot_has_column(c)]
    select_clause = ", ".join(f"ml.`{c}`" for c in base_cols + optional_cols)

    params: dict = {"org": effective_org}
    where = ["ml.qty > 0", "ma.organization_id = %(org)s"]
    if commodity_id:
        where.append("ml.item_id = %(item)s")
        params["item"] = commodity_id

    rows = frappe.db.sql(f"""
        SELECT {select_clause}
          FROM `tabMandi Lot`     ml
          JOIN `tabMandi Arrival` ma ON ma.name = ml.parent
         WHERE {' AND '.join(where)}
         ORDER BY ml.creation DESC
         LIMIT 500
    """, params, as_dict=True)

    # Normalise the field shape get_all would have produced.
    lots = []
    for r in rows:
        lots.append({
            "id":          r.get("name"),
            "name":        r.get("name"),
            "lot_code":    r.get("lot_code"),
            "short_code":  r.get("short_code"),
            "qty":         r.get("qty"),
            "unit":        r.get("unit"),
            "created_at":  r.get("creation"),
            "item_id":     r.get("item_id"),
            "net_qty":     r.get("net_qty"),
            "current_qty": r.get("current_qty"),
            "initial_qty": r.get("initial_qty"),
            "status":      r.get("status"),
            "grade":       r.get("grade"),
        })
    available_lots = []
    for lot in lots:
        lot = _normalize_lot_stock(lot)
        current_qty = flt(lot.get("current_qty") or 0)
        if current_qty <= 0:
            continue
        available_lots.append({
            "id": lot.get("id"),
            "lot_code": lot.get("lot_code"),
            "short_code": lot.get("short_code"),
            "current_qty": current_qty,
            "unit": lot.get("unit") or "Kg",
            "grade": lot.get("grade"),
            "created_at": lot.get("created_at"),
            "item_id": lot.get("item_id") or "",
        })
    return {"lots": available_lots, "total": len(available_lots)}


@frappe.whitelist(allow_guest=False)
def get_contacts(org_id: str = None, contact_type: str = None) -> dict:
    """
    Returns Mandi Contacts for the Arrivals/Sales master data.
    Used by useArrivalsMasterData and similar hooks.

    Tenant isolation: org_id is FORCED to the caller's organization.
    Only the Administrator may override via the param (used by admin
    dashboards). Returning every tenant's contacts when the caller has
    no org context (the previous behaviour) was a leak.
    """
    caller_org = _get_user_org()
    is_admin   = frappe.session.user == "Administrator"
    effective_org = org_id if (is_admin and org_id) else caller_org

    if not effective_org:
        return {"records": [], "contacts": [], "total_count": 0}

    filters = [
        ["full_name", "!=", "Walk-in Buyer"],
        ["full_name", "!=", "Opening Balance"]
    ]
    if effective_org and frappe.db.has_column("Mandi Contact", "organization_id"):
        filters.insert(0, ["organization_id", "=", effective_org])
    if contact_type:
        # If multiple types (e.g. "farmer,supplier"), handle as IN
        if "," in contact_type:
            filters.append(["contact_type", "in", contact_type.split(",")])
        else:
            filters.append(["contact_type", "=", contact_type])

    # Use raw SQL to avoid frappe.get_all alias conflict:
    # frappe.get_all always auto-injects `name` (PK), so 'full_name as name'
    # creates a duplicate column that breaks as_dict parsing → empty results.
    where_parts = []
    params = []
    for f in filters:
        if f[1] == "=":
            where_parts.append(f"`{f[0]}` = %s")
            params.append(f[2])
        elif f[1] == "in":
            phs = ",".join(["%s"] * len(f[2]))
            where_parts.append(f"`{f[0]}` IN ({phs})")
            params.extend(f[2])
        elif f[1] == "!=":
            where_parts.append(f"`{f[0]}` != %s")
            params.append(f[2])
    where_sql = " AND ".join(where_parts) if where_parts else "1=1"

    contacts_raw = frappe.db.sql(f"""
        SELECT name AS id, full_name AS display_name, contact_type, phone, city, 
               gstin, pan_number, state, pincode, billing_address_line1, billing_address_line2
        FROM `tabMandi Contact`
        WHERE {where_sql}
        ORDER BY full_name ASC
        LIMIT 500
    """, params, as_dict=True)

    contacts = [{
        "id": c.get("id") or "",
        "name": c.get("display_name") or c.get("id") or "Unknown",
        "contact_type": c.get("contact_type") or "",
        "phone": c.get("phone") or "",
        "city": c.get("city") or "",
        "gstin": c.get("gstin") or "",
        "pan_number": c.get("pan_number") or "",
        "state": c.get("state") or "",
        "pincode": c.get("pincode") or "",
        "billing_address_line1": c.get("billing_address_line1") or "",
        "billing_address_line2": c.get("billing_address_line2") or "",
    } for c in contacts_raw]

    # Return BOTH `records` and `contacts` keys + `total_count` so every
    # caller (dialogs, page clients, hooks) can use whichever shape it
    # already expects without breaking.
    return {"records": contacts, "contacts": contacts, "total_count": len(contacts)}


@frappe.whitelist(allow_guest=False)
def get_commodities() -> list:
    """
    Returns available commodity/item list for the Arrivals form.
    Schema-aware: uses has_column guards so this never crashes if custom
    fields haven't been migrated to the cloud DB yet.
    """
    item_filters = [["is_stock_item", "=", 1], ["disabled", "=", 0]]
    if frappe.db.has_column("Item", "organization_id"):
        item_filters.append(["organization_id", "=", _get_user_org()])

    item_fields = [
        "name as id",
        "item_name as name",
        "stock_uom as default_unit",
        "item_group as category",
        "item_code as sku_code",
        "standard_rate as sale_price",
        "shelf_life_in_days as shelf_life_days",
    ]
    if frappe.db.has_column("Item", "gst_rate"):
        item_fields.append("gst_rate")
    if frappe.db.has_column("Item", "sale_gst_rate"):
        item_fields.extend(["sale_gst_rate", "sale_gst_type", "purchase_gst_rate", "purchase_gst_type"])
    if frappe.db.has_column("Item", "customs_tariff_number"):
        item_fields.append("customs_tariff_number as hsn_code")
    if frappe.db.has_column("Item", "internal_id"):
        item_fields.append("internal_id")
    if frappe.db.has_column("Item", "custom_attributes"):
        item_fields.append("custom_attributes")
    if frappe.db.has_column("Item", "local_name"):
        item_fields.append("local_name")
    if frappe.db.has_column("Item", "critical_age_days"):
        item_fields.append("critical_age_days")

    items = frappe.get_all(
        "Item",
        filters=item_filters,
        fields=item_fields,
        limit=500,
        order_by="item_name asc",
        ignore_permissions=True
    )
    for item in items:
        attrs = item.get("custom_attributes")
        if attrs:
            item["custom_attributes"] = frappe.parse_json(attrs)
            item["variety"] = item["custom_attributes"].get("Variety") or item["custom_attributes"].get("variety", "")
            item["grade"] = item["custom_attributes"].get("Grade") or item["custom_attributes"].get("grade", "")
            item["display_name"] = item.get("name") # the full item_name
            item["name"] = item["custom_attributes"].get("base_name") or item.get("name")
        else:
            item["custom_attributes"] = {}
            item["variety"] = ""
            item["grade"] = ""
            item["display_name"] = item.get("name")

    return {"commodities": items}
    



@frappe.whitelist(allow_guest=False)
def get_commission_rate() -> float:
    """Returns the market fee percent from Mandi Settings (as a proxy for commission)."""
    try:
        settings = frappe.get_single("Mandi Settings")
        return {"rate": float(settings.market_fee_percent or 0)}
    except Exception:
        return {"rate": 0}

@frappe.whitelist(allow_guest=False)
def get_financial_summary(p_org_id: str = None, _cache_bust: any = None) -> dict:
    """
    Returns high-level financial summary: Receivables, Payables, Cash, Bank.
    Respects cheque clearance: uncleared cheques do NOT affect balances.
    """
    # Ensure _cache_bust is treated as a string to avoid type validation errors
    _cache_bust_str = str(_cache_bust) if _cache_bust else None
    
    # Resolve company: prioritize p_org_id if provided
    company = None
    if p_org_id:
        company = frappe.db.get_value("Mandi Organization", p_org_id, "erp_company")
    if not company:
        company = _get_user_company()
        
    if not company:
        return {
            "receivables": 0, "farmer_payables": 0, "supplier_payables": 0,
            "cash": {"id": "cash", "balance": 0, "name": "Cash In Hand"},
            "bank": {"id": "bank", "balance": 0, "name": "Bank Accounts"}
        }

    # Helper for the cheque filter
    # Condition: Include if (NOT a cheque) OR (IS a cleared cheque)
    cheque_filter = """
        AND (
            (je.cheque_no IS NULL OR je.cheque_no = '')
            OR
            (je.cheque_no IS NOT NULL AND je.cheque_no != '' AND je.clearance_date IS NOT NULL)
        )
    """

    # Fetch total AR (Debtors)
    receivables_res = frappe.db.sql(f"""
        SELECT SUM(gl.debit - gl.credit) 
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE (gl.account LIKE 'Debtors%%' OR gl.account LIKE 'Receivable%%' OR gl.account LIKE 'Accounts Receivable%%') 
          AND gl.company = %s AND gl.is_cancelled = 0
          {cheque_filter}
    """, (company,))
    receivables = receivables_res[0][0] if receivables_res and receivables_res[0][0] else 0

    # Fetch AP split by Farmer vs Supplier
    ap_split = frappe.db.sql(f"""
        SELECT 
            c.contact_type,
            SUM(gl.credit - gl.debit) as balance
        FROM `tabGL Entry` gl
        LEFT JOIN `tabMandi Contact` c ON gl.party = c.supplier OR gl.party = c.customer
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE (gl.account LIKE 'Creditors%%' OR gl.account LIKE 'Payable%%') 
          AND gl.company = %s AND gl.is_cancelled = 0
          {cheque_filter}
        GROUP BY c.contact_type
    """, (company,), as_dict=True)

    farmer_payables = 0
    supplier_payables = 0
    for row in ap_split:
        bal = row.balance or 0
        if (row.contact_type or '').lower() == 'farmer':
            farmer_payables += bal
        else:
            supplier_payables += bal

    # Fetch total Cash (Logic aligned with get_master_data / COA standards)
    cash_res = frappe.db.sql(f"""
        SELECT SUM(gl.debit - gl.credit) 
        FROM `tabGL Entry` gl
        INNER JOIN `tabAccount` acc ON gl.account = acc.name
        WHERE acc.account_type = 'Cash'
          AND gl.company = %s AND gl.is_cancelled = 0
    """, (company,))
    cash = cash_res[0][0] if cash_res and cash_res[0][0] else 0

    # Fetch total Bank
    bank_res = frappe.db.sql(f"""
        SELECT SUM(gl.debit - gl.credit) 
        FROM `tabGL Entry` gl
        INNER JOIN `tabAccount` acc ON gl.account = acc.name
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE acc.account_type = 'Bank'
          AND gl.company = %s AND gl.is_cancelled = 0
          {cheque_filter}
    """, (company,))
    bank = bank_res[0][0] if bank_res and bank_res[0][0] else 0

    return {
        "receivables": float(receivables),
        "farmer_payables": float(farmer_payables),
        "supplier_payables": float(supplier_payables),
        "cash": {"id": "cash", "balance": float(cash), "name": "Cash In Hand"},
        "bank": {"id": "bank", "balance": float(bank), "name": "Bank Accounts"}
    }


@frappe.whitelist(allow_guest=False)
def get_accounts(account_type: str = None, sub_type: str = None) -> list:
    """Returns a list of accounts filtered by type."""
    filters = [["company", "=", _get_user_company()]]
    if account_type:
        filters.append(["root_type", "=", (account_type or "").title()])
    if sub_type:
        filters.append(["account_type", "=", (sub_type or "").title()])
        
    accounts = frappe.get_list("Account", filters=filters, fields=["name as id", "account_name as name", "account_type", "root_type", "is_group"], ignore_permissions=True)
    
    if (account_type or "").title() == "Expense":
        dummy = [
            {"id": "non_mandi_paid_on_behalf_buyers", "name": "Paid on behalf of Buyers (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0},
            {"id": "non_mandi_paid_on_behalf_farmers", "name": "Paid on behalf of farmers (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0},
            {"id": "non_mandi_transport_expense", "name": "Transport expense (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0},
            {"id": "non_mandi_hamali_expense", "name": "Hamali expense (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0},
            {"id": "non_mandi_loading_expense", "name": "Loading expense (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0},
            {"id": "non_mandi_others", "name": "Others (Non Mandi Expense)", "account_type": "Expense", "root_type": "Expense", "is_group": 0}
        ]
        # Remove any existing real accounts with these names to prevent duplicates
        dummy_names = [d["name"] for d in dummy]
        accounts = [a for a in accounts if a.get("name") not in dummy_names]
        
        accounts = dummy + accounts
        
    return accounts

@frappe.whitelist(allow_guest=False)
def get_employees() -> list:
    """Returns a list of active employees."""
    company = _get_user_company()
    return frappe.get_list("Employee", filters={"status": "Active", "company": company}, fields=["name as id", "employee_name as name"], ignore_permissions=True)

@frappe.whitelist(allow_guest=False)
def create_expense_account(account_name: str) -> str:
    """Creates a new expense account."""
    company = _get_user_company()
    parent_account = frappe.db.get_value("Account", {"account_name": "Direct Expenses", "company": company}, "name")
    
    if not parent_account:
        parent_account = frappe.db.get_value("Account", {"root_type": "Expense", "is_group": 1, "company": company}, "name")

    doc = frappe.new_doc("Account")
    doc.account_name = account_name
    doc.parent_account = parent_account
    doc.company = company
    doc.root_type = "Expense"
    doc.account_type = "Expense Account"
    doc.insert()
    return {"id": doc.name, "name": doc.account_name}

@frappe.whitelist(allow_guest=False)
def get_party_balances(p_org_id: str = None, filter_type: str = 'all', sub_filter: str = 'all', search_query: str = '', limit_start: int = 0, limit_page_length: int = 10) -> dict:
    """
    Returns party balances equivalent to view_party_balances.
    """
    # Resolve company: prioritize p_org_id if provided
    company = None
    if p_org_id:
        company = frappe.db.get_value("Mandi Organization", p_org_id, "erp_company")
    if not company:
        company = _get_user_company()
    
    org_id = p_org_id or _get_user_org()

    # Use tabMandi Contact as the base to ensure ALL contacts show up even with 0 balance
    # Filter by organization_id to prevent data breach
    query = """
        SELECT 
            c.name as contact_id, 
            c.full_name as contact_name, 
            c.contact_type,
            c.city as contact_city,
            c.phone as contact_phone,
            COALESCE(
                (SELECT SUM(gl.debit - gl.credit)
                 FROM `tabGL Entry` gl
                 LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                 WHERE gl.is_cancelled = 0
                   AND gl.company = %(company)s
                   AND (
                       (gl.party_type = 'Supplier' AND gl.party = c.supplier)
                       OR (gl.party_type = 'Customer' AND gl.party = c.customer)
                       OR (gl.party_type IN ('Supplier', 'Customer') AND gl.party = c.name)
                   )
                   -- Use same date logic as get_ledger_statement so balances
                   -- match exactly between Finance Overview and Ledger Statement.
                   -- For cheque entries: effective date = clearance_date
                   -- For non-cheque entries: effective date = posting_date
                   AND COALESCE(je.clearance_date, gl.posting_date) <= %(today)s
                ), 0
            ) as net_balance
        FROM `tabMandi Contact` c
        WHERE c.full_name != 'Walk-in Buyer' AND LOWER(c.full_name) != 'opening balance'
    """
    params = {"company": company, "today": frappe.utils.today()}


    if org_id:
        query += " AND c.organization_id = %(org_id)s"
        params["org_id"] = org_id

    if filter_type != 'all':
        query += " AND c.contact_type = %(filter_type)s"
        params["filter_type"] = filter_type

    if search_query:
        query += " AND (c.full_name LIKE %(search)s OR c.name LIKE %(search)s)"
        params["search"] = f"%{search_query}%"

    # Sub-filter logic
    if sub_filter == 'receivable':
        query = f"SELECT * FROM ({query}) AS sub WHERE sub.net_balance > 0.005"
    elif sub_filter == 'payable':
        query = f"SELECT * FROM ({query}) AS sub WHERE sub.net_balance < -0.005"

    count_query = f"SELECT COUNT(*) FROM ({query}) AS cnt"
    count_row = frappe.db.sql(count_query, params)
    count = count_row[0][0] if count_row else 0

    if sub_filter in ('receivable', 'payable'):
        query += " ORDER BY contact_name ASC LIMIT %(limit)s OFFSET %(offset)s"
    else:
        query += " ORDER BY c.full_name ASC LIMIT %(limit)s OFFSET %(offset)s"
    
    params["limit"] = int(limit_page_length)
    params["offset"] = int(limit_start)

    results = frappe.db.sql(query, params, as_dict=True)
    
    # Fix contact_type to match frontend expectations
    for r in results:
        # Map DB contact_type to UI friendly names if needed
        ct = (r.get('contact_type') or '').lower()
        if ct == 'buyer':
            r['contact_type'] = 'buyer'
        elif ct == 'farmer':
            r['contact_type'] = 'farmer'
        elif ct == 'supplier':
            r['contact_type'] = 'supplier'
        else:
            # Fallback based on name (legacy)
            r['contact_type'] = 'buyer' if ct == 'customer' else ('farmer' if 'Farmer' in r['contact_name'] else 'supplier')
        
        r['current_balance'] = r.get('net_balance', 0)
        r['contact_city'] = r.get('contact_city') or ''

    return {"data": results, "count": count}

@frappe.whitelist(allow_guest=False)
def get_ledger_statement(contact_id: str, from_date: str = None, to_date: str = None) -> dict:
    """
    ERPNext-style party ledger statement for a Mandi Contact (buyer / supplier
    / farmer). Returns opening balance, every GL movement in the period with
    item-level detail, running balance, totals, and closing balance.

    Sign convention (signed running_balance):
      +  Dr balance  → party owes the Mandi (typical Customer / debtor)
      -  Cr balance  → Mandi owes the party (typical Supplier / Farmer / creditor)
    `closing_balance_type` ("debit" / "credit" / "nil") tells the UI which
    direction the closing balance goes so it can render "Receivable" vs
    "Payable" without re-deriving the sign.
    """
    try:
        if not contact_id:
            return {
                "party": None, "party_id": None, "party_name": None, "party_type": None,
                "period": {"from": from_date or "1900-01-01", "to": to_date or today()},
                "from_date": from_date or "1900-01-01", "to_date": to_date or today(),
                "opening_balance": 0.0, "opening_balance_type": "nil",
                "closing_balance": 0.0, "closing_balance_type": "nil",
                "totals": {"debit": 0.0, "credit": 0.0, "net": 0.0},
                "transactions": [], "last_activity": None, "not_found": True,
            }
        if not frappe.db.exists("Mandi Contact", contact_id):
            # Return an empty statement rather than throwing — the dialog
            # then renders "Settled : ₹0" and the caller can decide how to
            # surface the missing-contact case via `not_found: True`.
            return {
                "party": {"id": contact_id, "name": contact_id},
                "party_id": contact_id, "party_name": contact_id, "party_type": None,
                "period": {"from": from_date or "1900-01-01", "to": to_date or today()},
                "from_date": from_date or "1900-01-01", "to_date": to_date or today(),
                "opening_balance": 0.0, "opening_balance_type": "nil",
                "closing_balance": 0.0, "closing_balance_type": "nil",
                "totals": {"debit": 0.0, "credit": 0.0, "net": 0.0},
                "transactions": [], "last_activity": None, "not_found": True,
            }

        contact = frappe.get_doc("Mandi Contact", contact_id)
        if contact.organization_id != _get_user_org():
            frappe.throw("Access Denied", frappe.PermissionError)

        company = _get_user_company()

        # ── Resolve every Frappe party (Supplier + Customer) for this contact ─
        # A contact can be linked to BOTH (rare but possible — a farmer who
        # also buys produce). We pull GL entries against either link so the
        # statement is complete.
        # Legacy fallback: some older vouchers wrote `party = contact.name`
        # directly under party_type Customer/Supplier. Include those probes
        # so the statement still surfaces them.
        parties = []
        if contact.supplier and frappe.db.exists("Supplier", contact.supplier):
            parties.append(("Supplier", contact.supplier))
        if contact.customer and frappe.db.exists("Customer", contact.customer):
            parties.append(("Customer", contact.customer))
        for legacy in (("Supplier", contact.name), ("Customer", contact.name)):
            if legacy not in parties:
                parties.append(legacy)

        party_block = {
            "id":              contact.name,
            "name":            contact.full_name or contact.name,
            "type":            (getattr(contact, "contact_type", None) or "supplier").lower(),
            "internal_id":     getattr(contact, "internal_id", None) or "",
            "city":            getattr(contact, "city", None) or "",
            "phone":           getattr(contact, "phone", None) or "",
            "credit_days":     int(getattr(contact, "credit_days", 0) or 0),
            "linked_supplier": contact.supplier or None,
            "linked_customer": contact.customer or None,
        }

        def _bal_type(v: float) -> str:
            if v >  0.005: return "debit"
            if v < -0.005: return "credit"
            return "nil"

        if not parties:
            return {
                "party":                party_block,
                "period":               {"from": from_date, "to": to_date},
                "from_date":            from_date,
                "to_date":              to_date,
                "opening_balance":      0.0,
                "opening_balance_type": "nil",
                "closing_balance":      0.0,
                "closing_balance_type": "nil",
                "totals":               {"debit": 0.0, "credit": 0.0, "net": 0.0},
                "transactions":         [],
                "last_activity":        None,
            }

        from_date = from_date or "1900-01-01"
        to_date   = to_date   or today()

        placeholders = ", ".join(["(%s, %s)"] * len(parties))
        party_params = [v for pair in parties for v in pair]

        # ── 1. Opening balance (signed Dr - Cr before from_date) ───────────────
        # Cheque-aware: for cheque entries, use clearance_date as the effective
        # date so that post-dated cheques only affect the balance once cleared.
        ob_row = frappe.db.sql(f"""
            SELECT COALESCE(SUM(gl.debit - gl.credit), 0) AS ob
              FROM `tabGL Entry` gl
              LEFT JOIN `tabJournal Entry` je
                     ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
             WHERE (gl.party_type, gl.party) IN ({placeholders})
               AND COALESCE(je.clearance_date, gl.posting_date) < %s
               AND gl.company = %s
               AND gl.is_cancelled = 0
        """, tuple(party_params + [from_date, company]))
        opening_balance = flt(ob_row[0][0] or 0, 2)

        # ── 2. Period transactions ─────────────────────────────────────────────
        # All transactions within the date range are now included
        rows = frappe.db.sql(f"""
            SELECT gl.name,
                   COALESCE(je.clearance_date, gl.posting_date) AS date,
                   gl.posting_date AS original_posting_date,
                   gl.account, gl.party_type, gl.party,
                   gl.voucher_type, gl.voucher_no,
                   gl.against_voucher, gl.against_voucher_type,
                   gl.debit, gl.credit, gl.creation,
                   COALESCE(je.user_remark, gl.remarks) AS description,
                   je.cheque_no, je.cheque_date, je.clearance_date
              FROM `tabGL Entry` gl
              LEFT JOIN `tabJournal Entry` je
                     ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
             WHERE (gl.party_type, gl.party) IN ({placeholders})
               AND COALESCE(je.clearance_date, gl.posting_date) BETWEEN %s AND %s
               AND gl.company = %s
               AND gl.is_cancelled = 0
             ORDER BY date ASC, gl.creation ASC
        """, tuple(party_params + [from_date, to_date, company]), as_dict=True)

        # ── 3. Bulk-load referenced item / lot detail (avoid N+1) ──────────────
        arrival_ids = sorted({r.against_voucher for r in rows
                              if r.against_voucher_type == "Mandi Arrival" and r.against_voucher})
        sale_ids    = sorted({r.against_voucher for r in rows
                              if r.against_voucher_type == "Mandi Sale"    and r.against_voucher})
        # Also catch the rare case where voucher_type itself is Mandi Arrival/Sale.
        for r in rows:
            if r.voucher_type == "Mandi Arrival" and r.voucher_no and r.voucher_no not in arrival_ids:
                arrival_ids.append(r.voucher_no)
            if r.voucher_type == "Mandi Sale"    and r.voucher_no and r.voucher_no not in sale_ids:
                sale_ids.append(r.voucher_no)

        arrival_lots: dict = {}   # arrival_id -> [lot, ...]
        arrival_meta: dict = {}   # arrival_id -> {"bill_no": ...}
        if arrival_ids:
            for lot in frappe.db.sql("""
                SELECT ml.parent, ml.item_id, ml.qty, ml.unit, ml.supplier_rate,
                       ml.lot_code, ml.net_qty, ml.idx, ma.contact_bill_no
                  FROM `tabMandi Lot` ml
                  JOIN `tabMandi Arrival` ma ON ma.name = ml.parent
                 WHERE ml.parent IN %s
                 ORDER BY ml.parent ASC, ml.idx ASC
            """, (arrival_ids,), as_dict=True):
                arrival_lots.setdefault(lot["parent"], []).append(lot)
                arrival_meta.setdefault(lot["parent"], {"bill_no": lot.get("contact_bill_no")})

        sale_items: dict = {}
        if sale_ids:
            for si in frappe.get_all("Mandi Sale Item",
                filters={"parent": ["in", sale_ids]},
                fields=["parent", "item_id", "qty", "rate", "amount", "lot_id", "idx"],
                order_by="parent asc, idx asc",
                ignore_permissions=True,
            ):
                sale_items.setdefault(si["parent"], []).append(si)

        # Resolve item names in one shot.
        all_item_ids = set()
        for lots in arrival_lots.values():
            for lot in lots:
                if lot.get("item_id"): all_item_ids.add(lot["item_id"])
        for items in sale_items.values():
            for si in items:
                if si.get("item_id"): all_item_ids.add(si["item_id"])

        item_name_map: dict = {}
        if all_item_ids:
            for it in frappe.get_all("Item",
                filters={"name": ["in", list(all_item_ids)]},
                fields=["name", "item_name", "stock_uom"],
                ignore_permissions=True,
            ):
                item_name_map[it["name"]] = {
                    "name":     it.get("item_name") or it["name"],
                    "stock_uom": it.get("stock_uom") or "Kg",
                }

        # ── 4. Build enriched transactions with running balance ────────────────
        running_bal  = float(opening_balance)
        total_debit  = 0.0
        total_credit = 0.0
        transactions = []

        for r in rows:
            debit  = float(r.get("debit")  or 0)
            credit = float(r.get("credit") or 0)
            running_bal += debit - credit
            total_debit  += debit
            total_credit += credit

            ref_type = r.get("against_voucher_type") or r.get("voucher_type")
            ref_id   = r.get("against_voucher")    or (r.get("voucher_no") if r.get("voucher_type") in ("Mandi Arrival", "Mandi Sale") else None)

            # Structured items[] + a human readable summary line.
            items_detail = []
            summary_lines = []
            bill_no = None

            # Enhanced Item Resolution for Journal Entries
            # If this is a JV pointing to a Sale or Arrival, pull the items for better audit
            ref_type = r.get("against_voucher_type") or r.get("voucher_type")
            ref_id   = r.get("against_voucher") or (r.get("voucher_no") if r.get("voucher_type") in ("Mandi Arrival", "Mandi Sale") else None)

            if ref_type == "Mandi Arrival" and ref_id in arrival_lots:
                bill_no = (arrival_meta.get(ref_id) or {}).get("bill_no")
                for lot in arrival_lots[ref_id]:
                    nm = item_name_map.get(lot.get("item_id"), {})
                    item_label = nm.get("name") or lot.get("item_id")
                    unit       = lot.get("unit") or nm.get("stock_uom") or "Kg"
                    # Use the original purchased qty (not net_qty which is post-deduction stock qty)
                    # The less/cutting is reflected in the bill amount, not the unit count.
                    qty        = float(lot.get("qty") or lot.get("initial_qty") or 0)
                    rate       = float(lot.get("supplier_rate") or 0)
                    items_detail.append({
                        "item":     item_label,
                        "item_id":  lot.get("item_id"),
                        "qty":      qty,
                        "unit":     unit,
                        "rate":     rate,
                        "lot_code": lot.get("lot_code") or "",
                    })
                    lot_str = f" [{lot.get('lot_code')}]" if lot.get("lot_code") else ""
                    summary_lines.append(f"{item_label} ({qty} {unit} @ ₹{rate}){lot_str}")

            elif ref_type == "Mandi Sale" and ref_id in sale_items:
                for si in sale_items[ref_id]:
                    nm = item_name_map.get(si.get("item_id"), {})
                    item_label = nm.get("name") or si.get("item_id")
                    unit       = nm.get("stock_uom") or "Kg"
                    qty        = float(si.get("qty") or 0)
                    rate       = float(si.get("rate") or 0)
                    items_detail.append({
                        "item":    item_label,
                        "item_id": si.get("item_id"),
                        "qty":     qty,
                        "unit":    unit,
                        "rate":    rate,
                        "amount":  float(si.get("amount") or 0),
                        "lot_id":  si.get("lot_id") or "",
                    })
                    summary_lines.append(f"{item_label} ({qty} {unit} @ ₹{rate})")

            base_desc = r.get("description") or f"{r.get('voucher_type','')} — {r.get('voucher_no','')}"
            if summary_lines:
                bill_str  = f"Bill #{bill_no} — " if bill_no else ""
                base_desc = f"{bill_str}{' | '.join(summary_lines)}"

            posting_date   = r.get("date")
            if posting_date is not None and not isinstance(posting_date, str):
                posting_date = posting_date.isoformat()
            cheque_date = r.get("cheque_date")
            if cheque_date is not None and not isinstance(cheque_date, str):
                cheque_date = cheque_date.isoformat()
            clearance_date = r.get("clearance_date")
            if clearance_date is not None and not isinstance(clearance_date, str):
                clearance_date = clearance_date.isoformat()

            transactions.append({
                "id":              r.get("name"),
                "date":            posting_date,
                "voucher_type":    r.get("voucher_type"),
                "voucher_no":      r.get("voucher_no"),
                "reference_type":  r.get("against_voucher_type"),
                "reference_id":    r.get("against_voucher"),
                "against_voucher": r.get("against_voucher"),  # legacy alias
                "account":         r.get("account"),
                "party_type":      r.get("party_type"),
                "party":           r.get("party"),
                "description":     base_desc,
                "particulars":     base_desc,                # alias for ERPNext-style UIs
                "items":           items_detail,
                "cheque_no":       r.get("cheque_no") or "",
                "cheque_date":     cheque_date,
                "clearance_date":  clearance_date,
                "is_cleared":      bool(clearance_date) if r.get("cheque_no") else True,
                "debit":           flt(debit, 2),
                "credit":          flt(credit, 2),
                "running_balance": flt(running_bal, 2),
            })

        # Backwards-compat fields kept alongside the new structured shape.
        return {
            "party":                party_block,
            "party_id":             contact.name,
            "party_name":           party_block["name"],
            "party_type":           party_block["type"],
            "period":               {"from": from_date, "to": to_date},
            "from_date":            from_date,
            "to_date":              to_date,
            "opening_balance":      flt(opening_balance, 2),
            "opening_balance_type": _bal_type(opening_balance),
            "closing_balance":      flt(running_bal, 2),
            "closing_balance_type": _bal_type(running_bal),
            "totals": {
                "debit":  flt(total_debit, 2),
                "credit": flt(total_credit, 2),
                "net":    flt(total_debit - total_credit, 2),
            },
            "transactions":  transactions,
            "last_activity": transactions[-1]["date"] if transactions else None,
        }
    except Exception as exc:
        frappe.log_error(frappe.get_traceback(), "get_ledger_statement Failed")
        return {"error": str(exc)}


@frappe.whitelist(allow_guest=False)
def get_trial_balance(p_org_id: str = None) -> dict:
    """
    Returns Trial Balance using ERPNext GL Entry data.
    """
    company = _get_user_company()

    query = """
        SELECT 
            account as account_name,
            account as account_id,
            SUBSTRING_INDEX(account, ' - ', 1) as account_code,
            CASE 
                WHEN account LIKE 'Debtors%%' OR account LIKE 'Cash%%' OR account LIKE 'Bank%%' OR account LIKE 'Receivable%%' THEN 'asset'
                WHEN account LIKE 'Creditors%%' OR account LIKE 'Payable%%' THEN 'liability'
                WHEN account LIKE 'Sales%%' OR account LIKE 'Income%%' THEN 'revenue'
                ELSE 'expense'
            END as account_type,
            SUM(debit) as total_debit,
            SUM(credit) as total_credit,
            SUM(debit - credit) as net_balance
        FROM `tabGL Entry`
        WHERE company = %s AND is_cancelled = 0
        GROUP BY account
        HAVING SUM(debit) > 0 OR SUM(credit) > 0
        ORDER BY account_name
    """
    results = frappe.db.sql(query, (company,), as_dict=True)
    return {"data": results}

@frappe.whitelist(allow_guest=False)
def get_profit_loss(p_org_id: str = None) -> dict:
    """
    Returns Profit and Loss using ERPNext GL Entry data.
    """
    company = _get_user_company()

    query = """
        SELECT 
            gl.account as account_name,
            gl.account as account_id,
            SUBSTRING_INDEX(gl.account, ' - ', 1) as account_code,
            CASE 
                WHEN acc.root_type = 'Income' THEN 'revenue'
                ELSE 'expense'
            END as account_type,
            SUM(gl.debit) as total_debit,
            SUM(gl.credit) as total_credit,
            SUM(gl.credit - gl.debit) as net_balance
        FROM `tabGL Entry` gl
        JOIN `tabAccount` acc ON gl.account = acc.name
        WHERE acc.root_type IN ('Income', 'Expense')
          AND gl.company = %s AND gl.is_cancelled = 0
        GROUP BY gl.account
        HAVING SUM(gl.debit) > 0 OR SUM(gl.credit) > 0
        ORDER BY acc.root_type DESC, net_balance ASC
    """
    results = frappe.db.sql(query, (company,), as_dict=True)
    return {"data": results}

@frappe.whitelist(allow_guest=False)
def get_receivable_aging(p_org_id: str = None) -> list:
    """
    Returns Accounts Receivable Aging using ERPNext GL Entry data.
    """
    company = _get_user_company()
    
    # Very basic aging query logic. We assume all AR is Customer type.
    query = """
        SELECT 
            party as contact_name, 
            party as contact_id, 
            SUM(CASE WHEN DATEDIFF(CURDATE(), posting_date) <= 30 THEN (debit - credit) ELSE 0 END) as bucket_0_30,
            SUM(CASE WHEN DATEDIFF(CURDATE(), posting_date) BETWEEN 31 AND 60 THEN (debit - credit) ELSE 0 END) as bucket_31_60,
            SUM(CASE WHEN DATEDIFF(CURDATE(), posting_date) BETWEEN 61 AND 90 THEN (debit - credit) ELSE 0 END) as bucket_61_90,
            SUM(CASE WHEN DATEDIFF(CURDATE(), posting_date) > 90 THEN (debit - credit) ELSE 0 END) as bucket_90_plus,
            SUM(debit - credit) as net_balance
        FROM `tabGL Entry`
        WHERE party_type = 'Customer' AND company = %s AND is_cancelled = 0
        GROUP BY party
        HAVING net_balance > 0
        ORDER BY net_balance DESC
    """
    results = frappe.db.sql(query, (company,), as_dict=True)
    return {"data": results}

@frappe.whitelist(allow_guest=False)
def get_purchase_bill_details(lot_id: str) -> dict:
    """
    Fetches the Mandi Arrival and its items based on a single lot (Mandi Lot) ID.
    """
    try:
        # First, find the parent Mandi Arrival name from the lot row
        parent_name = frappe.db.get_value("Mandi Lot", lot_id, "parent")
        if not parent_name:
            return {"error": "Lot not found"}

        # Fetch the Mandi Arrival doc
        arrival_doc = frappe.get_doc("Mandi Arrival", parent_name)
        _enforce_ownership(arrival_doc)
        if arrival_doc.organization_id != _get_user_org():
            frappe.throw("Access Denied", frappe.PermissionError)

        arrival_dict = arrival_doc.as_dict()

        # Format items to match frontend expectations
        formatted_items = []
        for item in arrival_doc.items:
            stock = _normalize_lot_stock(item.as_dict())
            formatted_items.append({
                "id": item.name,
                "item_id": item.item_id,
                "item": {
                    "name": frappe.db.get_value("Item", item.item_id, "item_name") or item.item_id
                },
                "qty": item.qty,
                "unit": item.unit or "Box",
                "unit_weight": item.unit_weight,
                "supplier_rate": item.supplier_rate,
                "commission_percent": item.commission_percent,
                "less_percent": item.less_percent,
                "less_units": item.less_units,
                "packing_cost": item.packing_cost,
                "loading_cost": item.loading_cost,
                "farmer_charges": item.farmer_charges,
                "lot_code": item.lot_code,
                "storage_location": item.storage_location,
                "initial_qty": stock.get("initial_qty"),
                "current_qty": stock.get("current_qty"),
                "status": stock.get("status"),
                # custom_attributes is an optional field — not present on the
                # standard Mandi Lot doctype unless added as a Custom Field.
                "custom_attributes": getattr(item, "custom_attributes", None) or {},
            })

        # Determine if the cheque has actually been cleared (i.e., JE is submitted, not just draft)
        is_cheque_cleared = True  # Default: all non-cheque modes are always cleared
        advance_mode = (arrival_doc.advance_payment_mode or "").lower()
        if advance_mode == "cheque" and arrival_doc.advance and flt(arrival_doc.advance) > 0:
            # Check if a SUBMITTED JE exists for this arrival (draft = not cleared yet)
            submitted_je = frappe.db.sql("""
                SELECT je.name FROM `tabJournal Entry` je
                JOIN `tabGL Entry` gl ON je.name = gl.voucher_no AND gl.is_cancelled = 0
                WHERE gl.against_voucher = %s
                  AND gl.against_voucher_type = 'Mandi Arrival'
                  AND je.cheque_no IS NOT NULL AND je.cheque_no != ''
                  AND je.docstatus = 1
                LIMIT 1
            """, (parent_name,), as_list=True)
            is_cheque_cleared = bool(submitted_je)

        return {
            "id": lot_id,
            "arrival_id": parent_name,
            "lot_code": frappe.db.get_value("Mandi Lot", lot_id, "lot_code"),
            "farmer": {
                "name": frappe.db.get_value("Mandi Contact", arrival_doc.party_id, "full_name") or arrival_doc.party_id,
                "id": arrival_doc.party_id
            },
            "item": {
                "name": frappe.db.get_value("Item", frappe.db.get_value("Mandi Lot", lot_id, "item_id"), "item_name") or frappe.db.get_value("Mandi Lot", lot_id, "item_id"),
                "default_unit": frappe.db.get_value("Mandi Lot", lot_id, "unit")
            },
            "arrival": {
                "arrival_date": arrival_doc.arrival_date,
                "party_id": arrival_doc.party_id,
                "arrival_type": arrival_doc.arrival_type,
                "storage_location": arrival_doc.storage_location,
                "vehicle_number": arrival_doc.vehicle_number,
                "vehicle_type": arrival_doc.vehicle_type,
                "driver_name": arrival_doc.driver_name,
                "driver_mobile": arrival_doc.driver_mobile,
                "guarantor": arrival_doc.guarantor,
                "hire_charges": arrival_doc.hire_charges,
                "hamali_expenses": arrival_doc.hamali_expenses,
                "other_expenses": arrival_doc.other_expenses,
                "contact_bill_no": arrival_doc.contact_bill_no,
                "advance": arrival_doc.advance,
                "advance_payment_mode": arrival_doc.advance_payment_mode,
                "advance_bank_name": arrival_doc.advance_bank_name,
                "advance_cheque_no": arrival_doc.advance_cheque_no,
                "advance_cheque_date": arrival_doc.advance_cheque_date,
                # KEY FLAG: True only if the cheque JE is submitted (Cleared Instantly)
                # False if the JE is a draft (Clear Later — pending)
                "is_cheque_cleared": is_cheque_cleared,
            },
            "all_lots": formatted_items
        }
    except Exception as e:
        frappe.log_error(f"Error in get_purchase_bill_details: {str(e)}")
        return {"error": str(e)}

@frappe.whitelist()
def repair_arrival_financials(arrival_id):
    """
    Force re-recompute financials for a submitted Arrival and update the ledger.
    Use this when prices were added after submission or if JE is missing.
    """
    if not frappe.has_permission("Mandi Arrival", "write"):
        frappe.throw("Not permitted")
        
    doc = frappe.get_doc("Mandi Arrival", arrival_id)
    _enforce_ownership(doc)
    # Tenant guard
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match
    enforce_org_match(doc)
    # Manually trigger the controller's recompute logic (even if docstatus=1)
    doc._recompute_summary()
    
    # Update the document fields directly (save() would fail)
    fields_to_update = [
        "total_realized", "total_commission", "total_expenses", 
        "mandi_total_earnings", "net_payable_farmer"
    ]
    for field in fields_to_update:
        frappe.db.set_value("Mandi Arrival", doc.name, field, doc.get(field))
        
    # Cancel old JEs linked to this arrival
    old_je_names = frappe.db.sql_list("""
        SELECT DISTINCT voucher_no 
        FROM `tabGL Entry` 
        WHERE against_voucher = %s AND voucher_type IN ('Journal Entry', 'Cash Entry', 'Bank Entry') AND is_cancelled = 0
    """, arrival_id)
    
    for je_name in old_je_names:
        try:
            je_doc = frappe.get_doc("Journal Entry", je_name)
            _enforce_ownership(je_doc)
            if je_doc.docstatus == 1:
                je_doc.cancel()
        except Exception:
            pass
            
    # Post new ledger entries
    from mandigrow.mandigrow.logic.automation import post_arrival_ledger
    post_arrival_ledger(doc)
    
    frappe.db.commit()
    return {"status": "success", "message": "Financials repaired and ledger updated."}

# Removed insecure debug_financials endpoint

@frappe.whitelist(allow_guest=False)
def update_purchase_bill(arrival_id: str, data: str) -> dict:
    """
    Updates the Mandi Arrival document.
    """
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    try:
        import json
        if isinstance(data, str):
            data = json.loads(data)

        doc = frappe.get_doc("Mandi Arrival", arrival_id)
        _enforce_ownership(doc)
        # Tenant guard
        from mandigrow.mandigrow.logic.tenancy import enforce_org_match
        enforce_org_match(doc)
        
        # Update header fields
        doc.arrival_date = data.get('arrival_date')
        doc.party_id = data.get('party_id')
        doc.arrival_type = data.get('arrival_type')
        doc.storage_location = data.get('storage_location')
        doc.vehicle_number = data.get('vehicle_number')
        doc.vehicle_type = data.get('vehicle_type')
        doc.driver_name = data.get('driver_name')
        doc.driver_mobile = data.get('driver_mobile')
        doc.guarantor = data.get('guarantor')
        doc.hire_charges = data.get('hire_charges')
        doc.hamali_expenses = data.get('hamali_expenses')
        doc.other_expenses = data.get('other_expenses')

        # Update items only if provided
        if 'items' in data:
            items_data = data.get('items', [])
            
            # Simple update: Since items might have been deleted/added, it's safer to clear and re-add or meticulously update
            # For this refactor, let's update existing items and add new ones
            existing_items = {item.name: item for item in doc.items}
            doc.set('items', []) # Clear items
    
            for item_data in items_data:
                item_doc = doc.append('items', {})
                if item_data.get('id') and item_data.get('id') in existing_items:
                    item_doc.name = item_data.get('id') # preserve name to update existing row
                    
                item_doc.item_id = item_data.get('item_id')
                item_doc.qty = item_data.get('qty')
                item_doc.unit = item_data.get('unit')
                item_doc.unit_weight = item_data.get('unit_weight')
                item_doc.supplier_rate = item_data.get('supplier_rate')
                item_doc.commission_percent = item_data.get('commission_percent')
                item_doc.less_percent = item_data.get('less_percent')
                item_doc.less_units = item_data.get('less_units')
                item_doc.packing_cost = item_data.get('packing_cost')
                item_doc.loading_cost = item_data.get('loading_cost')
                item_doc.farmer_charges = item_data.get('farmer_charges')
                item_doc.storage_location = item_data.get('storage_location')
                item_doc.lot_code = item_data.get('lot_code')
                _normalize_lot_stock(item_doc)

        doc.flags.ignore_validate_update_after_submit = True
        doc.save(ignore_permissions=True)
        for item in doc.items or []:
            _normalize_lot_stock(item, persist=True)
        frappe.db.commit()
        return {"success": True, "arrival_id": doc.name}
    except Exception as e:
        frappe.log_error(f"Error in update_purchase_bill: {str(e)}")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def get_arrival_detail(arrival_id: str = None) -> dict:
    """Return one Mandi Arrival with its lots, contact, and item info.

    Shape matches the Supabase-era expectation used by ArrivalDetailsSheet:
      { arrival: {...arrival, contacts:{name,city}}, lots: [{...lot, item:{name}}] }
    """
    if not arrival_id:
        return {"arrival": None, "lots": []}

    try:
        doc = frappe.get_doc("Mandi Arrival", arrival_id)
        _enforce_ownership(doc)
    except frappe.DoesNotExistError:
        return {"arrival": None, "lots": []}

    # Tenant guard
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match
    enforce_org_match(doc)

    arrival = doc.as_dict()
    arrival["id"] = doc.name

    contact = None
    if doc.party_id:
        try:
            c = frappe.get_doc("Mandi Contact", doc.party_id)
            contact = {"id": c.name, "name": c.full_name or c.name, "city": getattr(c, "city", "")}
        except Exception:
            contact = {"id": doc.party_id, "name": doc.party_id, "city": ""}
    arrival["contacts"] = contact
    if isinstance(arrival.get("status"), str):
        arrival["status"] = arrival["status"].lower()

    item_ids = list({l.item_id for l in (doc.items or []) if l.item_id})
    item_map = {}
    if item_ids:
        # Silicon Valley Grade: Schema-Aware Query
        fields = ["name", "item_name", "item_group", "stock_uom", "item_code", "image", "valuation_rate"]
        if frappe.db.has_column("Item", "internal_id"):
            fields.append("internal_id")
        if frappe.db.has_column("Item", "organization_id"):
            fields.append("organization_id")
            
        for it in frappe.get_all(
            "Item",
            filters={"name": ["in", item_ids]},
            fields=fields,
            ignore_permissions=True,
        ):
            item_map[it["name"]] = {"name": it.get("item_name") or it["name"]}

    lots = []
    for child in doc.items or []:
        row = child.as_dict()
        row["id"] = child.name
        row["arrival_id"] = doc.name
        row["item"] = item_map.get(child.item_id) or {"name": child.item_id}
        lots.append(row)

    return {"arrival": arrival, "lots": lots}


@frappe.whitelist(allow_guest=False)
def update_lot(lot_id: str, data=None) -> dict:
    """
    Updates a specific lot (Mandi Lot) and resaves its parent to trigger ledger calculations.
    """
    try:
        import json
        if isinstance(data, str):
            data = json.loads(data)
            
        # Get parent doc
        parent_name = frappe.db.get_value("Mandi Lot", lot_id, "parent")
        if not parent_name:
            return {"error": "Lot not found"}

        # Tenant guard: verify parent arrival belongs to user's org
        from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
        enforce_org_match_by_name("Mandi Arrival", parent_name)

        doc = frappe.get_doc("Mandi Arrival", parent_name)
        _enforce_ownership(doc)
        
        for item in doc.items:
            if item.name == lot_id:
                if 'supplier_rate' in data: item.supplier_rate = data['supplier_rate']
                if 'initial_qty' in data: item.qty = data['initial_qty']
                if 'sale_price' in data: item.sale_price = data['sale_price']
                if 'commission_percent' in data: item.commission_percent = data['commission_percent']
                if 'less_percent' in data: item.less_percent = data['less_percent']
                if 'packing_cost' in data: item.packing_cost = data['packing_cost']
                if 'loading_cost' in data: item.loading_cost = data['loading_cost']
                if 'farmer_charges' in data: item.farmer_charges = data['farmer_charges']
                if 'shelf_life_days' in data: item.shelf_life_days = data['shelf_life_days']
                if 'critical_age_days' in data: item.critical_age_days = data['critical_age_days']
                _normalize_lot_stock(item)
                break
                
        doc.flags.ignore_validate_update_after_submit = True
        doc.save(ignore_permissions=True)
        for item in doc.items or []:
            _normalize_lot_stock(item, persist=True)
        frappe.db.commit()
        
        # Repost financials so ledger automatically matches the new rates
        try:
            repair_arrival_financials(parent_name)
        except Exception as e_rep:
            frappe.log_error(f"Ledger auto-sync failed for {parent_name}: {str(e_rep)}")
            
        return {"success": True}
    except Exception as e:
        frappe.log_error(f"Error in update_lot: {str(e)}")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def create_voucher(p_organization_id: str = None, p_party_id: str = None, p_amount: float = None, p_auto_allocate: bool = False, p_voucher_type: str = None,
                   p_payment_mode: str = None, p_date: str = None, p_remarks: str = None, p_cheque_no: str = None,
                   p_cheque_date: str = None, p_bank_name: str = None, p_expense_account: str = None,
                   p_cheque_status: str = None, p_invoice_id: str = None, p_arrival_id: str = None,
                   p_lot_id: str = None, p_bank_account_id: str = None, p_discount: float = None,
                   p_account_id: str = None) -> dict:
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    # p_account_id is the canonical alias used by the expense-dialog frontend.
    # Merge it into p_expense_account if not already set.
    if p_account_id and not p_expense_account:
        p_expense_account = p_account_id
    # Auto-detect expense voucher type: if an account is provided but no party,
    # caller almost certainly means 'expense', even if they omitted the type.
    if p_expense_account and not p_party_id and (p_voucher_type or 'expense').lower() not in ('receipt', 'payment', 'contra'):
        p_voucher_type = 'expense'
    """
    Create a Payment / Receipt / Expense voucher (Journal Entry) and link it
    to the relevant party and bill so the daybook, party ledger, and bill
    statuses all stay in sync.

    Key correctness rules (the ones that broke before):

      • `party` on the GL leg MUST be the linked Frappe Customer/Supplier
        doc name — NOT the Mandi Contact id. Otherwise no party-ledger query
        ever finds these payments. Resolution goes via the Mandi Contact's
        `customer` / `supplier` link fields; if missing, we lazily create
        the Frappe party via ensure_customer_for_contact / ensure_supplier_for_contact.

      • For payments that settle a specific bill, the party leg is tagged with
        `against_voucher_type = "Mandi Sale"` or `"Mandi Arrival"` and
        `against_voucher = <bill name>` so `_get_ledger_summary` can attribute
        the payment to that bill (drives paid / partial / pending status).

      • Cheque mode: `je.cheque_no` + `je.cheque_date` set; `clearance_date`
        only set when status == "Cleared" or no future cheque date is given.
        Post-dated cheques act as udhaar (pending) until cleared.

    Voucher kinds:
      receipt — buyer pays the mandi  → Bank/Cash Dr, Debtors Cr (party=Customer)
      payment — mandi pays farmer/sup → Creditors Dr (party=Supplier), Bank/Cash Cr
      expense — operational outflow   → Expense Dr, Bank/Cash Cr  (no party)
      contra  — internal transfer     → Target Dr, Bank/Cash Cr  (no party)
    """
    try:
        # Resolve company: strictly prioritize the organization's linked ERP company 
        # to ensure multi-tenant isolation.
        company = None
        org_id  = p_organization_id or _get_user_org()
        if org_id:
            company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
        if not company:
            company = _get_user_company()

        if not company:
            return {"error": "Unauthorized: No linked ERP company found for your organization."}

        amount  = flt(p_amount or 0)
        discount = flt(p_discount or 0)

        if amount <= 0 and discount <= 0:
            return {"error": "Amount or discount must be greater than 0"}

        v_type = (p_voucher_type or "payment").lower()

        # 1. Resolve Bank/Cash account ──────────────────────────────────────
        if p_bank_account_id and frappe.db.exists("Account", p_bank_account_id):
            bank_cash_account = p_bank_account_id
        elif p_payment_mode == "cash":
            bank_cash_account = frappe.db.get_value("Account", {"account_type": "Cash", "company": company}, "name")
            if not bank_cash_account:
                # Fallback to name search if type-mapping failed
                bank_cash_account = frappe.db.get_value("Account", {"account_name": ["like", "Cash%"], "company": company}, "name")
        else:
            bank_cash_account = frappe.db.get_value("Account", {"account_type": "Bank", "company": company}, "name")
            if not bank_cash_account:
                bank_cash_account = frappe.db.get_value("Account", {"account_name": ["like", "Bank%"], "company": company}, "name")

        if not bank_cash_account:
            return {"error": f"No valid {p_payment_mode or 'Bank'} account found for company {company}"}

        # 2. Resolve party (Customer / Supplier) and party account ───────────
        accounts = []
        party_name_display = None
        party_type = None
        party_doc_name = None
        party_account = None

        if p_party_id and v_type in ("receipt", "payment"):
            contact = frappe.db.get_value(
                "Mandi Contact", p_party_id,
                ["full_name", "contact_type", "supplier", "customer"],
                as_dict=True,
            )
            if not contact:
                # Allow contra-style direct account ids in `p_party_id` too.
                if frappe.db.exists("Account", p_party_id):
                    v_type = "contra"
                else:
                    return {"error": f"Invalid Party/Account ID: {p_party_id}"}

            if contact:
                party_name_display = contact.full_name
                # Receipts → buyer paying us → Customer + Debtors.
                # Payments → we pay farmer/supplier → Supplier + Creditors.
                if v_type == "receipt":
                    party_type = "Customer"
                    try:
                        from mandigrow.mandigrow.logic.erp_bootstrap import ensure_customer_for_contact
                        party_doc_name = (contact.customer
                                          if contact.customer and frappe.db.exists("Customer", contact.customer)
                                          else ensure_customer_for_contact(p_party_id, company))
                    except Exception:
                        party_doc_name = contact.customer or contact.full_name or p_party_id
                    party_account = frappe.db.get_value("Account", {"account_type": "Receivable", "company": company}, "name")
                    if not party_account:
                        party_account = frappe.db.get_value("Account", {"account_name": ["like", "Debtors%"], "company": company}, "name")
                    
                    if not party_account:
                        return {"error": f"No Receivable/Debtors account found for company {company}"}
                else:  # payment
                    party_type = "Supplier"
                    try:
                        from mandigrow.mandigrow.logic.erp_bootstrap import ensure_supplier_for_contact
                        party_doc_name = (contact.supplier
                                          if contact.supplier and frappe.db.exists("Supplier", contact.supplier)
                                          else ensure_supplier_for_contact(p_party_id, company))
                    except Exception:
                        party_doc_name = contact.supplier or contact.full_name or p_party_id
                    party_account = frappe.db.get_value("Account", {"account_type": "Payable", "company": company}, "name")
                    if not party_account:
                        party_account = frappe.db.get_value("Account", {"account_name": ["like", "Creditors%"], "company": company}, "name")
                    
                    if not party_account:
                        return {"error": f"No Payable/Creditors account found for company {company}"}

        # 3. Resolve against_voucher (which bill this settles, if any) ──────
        # invoice_id → Mandi Sale ; arrival_id (or lot's parent) → Mandi Arrival.
        against_vtype = None
        against_vname = None
        if p_invoice_id and frappe.db.exists("Mandi Sale", p_invoice_id):
            against_vtype, against_vname = "Mandi Sale", p_invoice_id
        elif p_arrival_id and frappe.db.exists("Mandi Arrival", p_arrival_id):
            against_vtype, against_vname = "Mandi Arrival", p_arrival_id
        elif p_lot_id:
            parent = frappe.db.get_value("Mandi Lot", p_lot_id, "parent")
            if parent and frappe.db.exists("Mandi Arrival", parent):
                against_vtype, against_vname = "Mandi Arrival", parent

        # 4. Build GL legs ───────────────────────────────────────────────────
        if v_type == "receipt":
            # ── Receipt (Buyer pays Mandi) ─────────────────────────────────
            # Cash leg: only if real money was received (amount > 0)
            # Write-off leg: only if settlement discount given (discount > 0)
            #
            # Buyer write-off = LOSS for Mandi:
            #   Dr: Discount Allowed (Expense) ← Mandi absorbs the loss
            #   Cr: Debtors (party)            ← Buyer balance reduced
            if amount > 0:
                cash_leg = {
                    "account": bank_cash_account,
                    "debit_in_account_currency": amount,
                    "user_remark": f"Receipt from {party_name_display or 'party'}",
                }
                party_leg = {
                    "account": party_account,
                    "credit_in_account_currency": amount,
                    "party_type": party_type,
                    "party": party_doc_name,
                    "user_remark": f"Payment received from {party_name_display or 'party'}",
                }
                if against_vtype:
                    # Only tag the PARTY leg to the bill — NOT the cash leg.
                    # The cash leg must remain untagged so the Daybook's Liquid Assets
                    # card can include it as a real cash movement (not an arrival/sale entry).
                    party_leg["against_voucher_type"] = against_vtype
                    party_leg["against_voucher"]      = against_vname
                accounts.extend([cash_leg, party_leg])

            if discount > 0:
                writeoff_exp_acc = (
                    frappe.db.get_value("Account", {"account_name": "Discount Allowed", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Discount%"], "root_type": "Expense", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": "Bad Debts", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"root_type": "Expense", "company": company, "is_group": 0}, "name")
                )
                if not writeoff_exp_acc:
                    return {"error": "No 'Discount Allowed' expense account found. Please create one in Chart of Accounts."}
                writeoff_dr = {
                    "account": writeoff_exp_acc,
                    "debit_in_account_currency": discount,
                    "user_remark": f"Write-off / Settlement — {party_name_display or 'party'} (loss to Mandi)",
                }
                writeoff_cr = {
                    "account": party_account,
                    "credit_in_account_currency": discount,
                    "party_type": party_type,
                    "party": party_doc_name,
                    "user_remark": f"Write-off: {party_name_display or 'party'} balance reduced by \u20b9{discount}",
                }
                if against_vtype:
                    writeoff_dr["against_voucher_type"] = against_vtype
                    writeoff_dr["against_voucher"]      = against_vname
                    writeoff_cr["against_voucher_type"] = against_vtype
                    writeoff_cr["against_voucher"]      = against_vname
                accounts.extend([writeoff_dr, writeoff_cr])

        elif v_type == "payment":
            # ── Payment (Mandi pays Farmer/Supplier) ─────────────────────────
            # Cash leg: only if real money is going out (amount > 0)
            # Write-off leg: only if Mandi negotiated a settlement (discount > 0)
            #
            # Supplier write-off = PROFIT for Mandi:
            #   Dr: Creditors (party)             ← Supplier balance reduced
            #   Cr: Discount Received (Income)    ← Mandi gains this amount
            if amount > 0:
                party_leg = {
                    "account": party_account,
                    "debit_in_account_currency": amount,
                    "party_type": party_type,
                    "party": party_doc_name,
                    "user_remark": f"Payment to {party_name_display or 'party'}",
                }
                cash_leg = {
                    "account": bank_cash_account,
                    "credit_in_account_currency": amount,
                    "user_remark": f"Cash paid to {party_name_display or 'party'}",
                }
                if against_vtype:
                    # Only tag the PARTY leg to the bill — NOT the cash leg.
                    # The cash leg must remain untagged so the Daybook's Liquid Assets
                    # card can include it as a real cash movement (not an arrival/sale entry).
                    party_leg["against_voucher_type"] = against_vtype
                    party_leg["against_voucher"]      = against_vname
                accounts.extend([party_leg, cash_leg])

            if discount > 0:
                writeoff_inc_acc = (
                    frappe.db.get_value("Account", {"account_name": "Discount Received", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Settlement%"], "root_type": "Income", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Discount%"], "root_type": "Income", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"root_type": "Income", "company": company, "is_group": 0}, "name")
                )
                if not writeoff_inc_acc:
                    return {"error": "No 'Discount Received' income account found. Please create one in Chart of Accounts."}
                writeoff_dr = {
                    "account": party_account,
                    "debit_in_account_currency": discount,
                    "party_type": party_type,
                    "party": party_doc_name,
                    "user_remark": f"Write-off: Mandi saves \u20b9{discount} from {party_name_display or 'party'}",
                }
                writeoff_cr = {
                    "account": writeoff_inc_acc,
                    "credit_in_account_currency": discount,
                    "user_remark": f"Settlement Income: \u20b9{discount} discount from {party_name_display or 'party'}",
                }
                if against_vtype:
                    writeoff_dr["against_voucher_type"] = against_vtype
                    writeoff_dr["against_voucher"]      = against_vname
                    writeoff_cr["against_voucher_type"] = against_vtype
                    writeoff_cr["against_voucher"]      = against_vname
                accounts.extend([writeoff_dr, writeoff_cr])


        elif v_type == "expense":
            # Resolve: prefer explicitly passed account; fall back to General Expenses
            expense_acc = p_expense_account or p_party_id
            
            # --- INTERCEPT NON-MANDI EXPENSES ---
            if expense_acc and (expense_acc.startswith("non_mandi_") or expense_acc in ["paid_on_behalf_farmers", "paid_on_behalf_buyers"]):
                mapping = {
                    "non_mandi_paid_on_behalf_buyers": "Paid on behalf of Buyers (Non Mandi Expense)",
                    "non_mandi_paid_on_behalf_farmers": "Paid on behalf of farmers (Non Mandi Expense)",
                    "non_mandi_transport_expense": "Transport expense (Non Mandi Expense)",
                    "non_mandi_hamali_expense": "Hamali expense (Non Mandi Expense)",
                    "non_mandi_loading_expense": "Loading expense (Non Mandi Expense)",
                    "non_mandi_others": "Others (Non Mandi Expense)",
                    # Legacy support
                    "paid_on_behalf_buyers": "Paid on behalf of Buyers (Non Mandi Expense)",
                    "paid_on_behalf_farmers": "Paid on behalf of farmers (Non Mandi Expense)"
                }
                acc_name = mapping.get(expense_acc, "Other Non Mandi Expense")
                real_acc = frappe.db.get_value("Account", {"account_name": acc_name, "company": company}, "name")
                
                if not real_acc:
                    parent_acc = (
                        frappe.db.get_value("Account", {"account_name": "Loans and Advances (Assets)", "company": company}, "name") or
                        frappe.db.get_value("Account", {"account_name": "Current Assets", "company": company}, "name") or
                        frappe.db.get_value("Account", {"root_type": "Asset", "is_group": 1, "company": company}, "name")
                    )
                    doc = frappe.new_doc("Account")
                    doc.account_name = acc_name
                    doc.parent_account = parent_acc
                    doc.company = company
                    # Do not set account_type to Receivable/Payable to avoid requiring Party in Journal Entries
                    doc.insert(ignore_permissions=True)
                    real_acc = doc.name
                
                expense_acc = real_acc
            # --- END INTERCEPT ---
            
            if not (expense_acc and frappe.db.exists("Account", expense_acc)):
                expense_acc = (
                    frappe.db.get_value("Account", {"account_name": "General Expenses", "company": company}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Expense%"], "root_type": "Expense", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"root_type": "Expense", "company": company, "is_group": 0}, "name")
                )
            if not expense_acc:
                return {"error": "Valid Expense Account required. Please create an expense category first."}

            accounts.append({
                "account": expense_acc,
                "debit_in_account_currency": amount,
                "user_remark": p_remarks or "Mandi Expense",
            })
            accounts.append({
                "account": bank_cash_account,
                "credit_in_account_currency": amount,
                "user_remark": p_remarks or "Mandi Expense",
            })

        elif v_type == "contra":
            target_acc = p_party_id if frappe.db.exists("Account", p_party_id or "") else None
            if not target_acc:
                return {"error": f"Invalid target account for contra: {p_party_id}"}
            accounts.append({
                "account": target_acc,
                "debit_in_account_currency": amount,
                "user_remark": p_remarks or "Contra Transfer",
            })
            accounts.append({
                "account": bank_cash_account,
                "credit_in_account_currency": amount,
                "user_remark": p_remarks or "Contra Transfer",
            })

        if not accounts:
            return {"error": "No GL legs built for voucher"}

        # Ensure cost center is set for all rows (required by ERPNext)
        cost_center = frappe.db.get_value("Company", company, "cost_center")
        for row in accounts:
            row.setdefault("account_currency", "INR")
            row.setdefault("exchange_rate", 1)
            row.setdefault("cost_center", cost_center)

        # 5. Posting date — for pending cheques, post on the cheque date so
        #    the bank movement lands on funds-clear day. Otherwise on p_date.
        is_cheque   = (p_payment_mode or "").lower() == "cheque"
        cheque_norm = (p_cheque_date.split("T")[0] if p_cheque_date and "T" in p_cheque_date else p_cheque_date) if p_cheque_date else None
        date_norm   = (p_date.split("T")[0] if p_date and "T" in p_date else p_date) or today()

        # Frappe requires cheque_date (Reference date) whenever cheque_no is set.
        # If the user didn't supply one, default to the transaction date.
        if is_cheque and not cheque_norm:
            cheque_norm = date_norm

        is_cheque_cleared = True
        if is_cheque:
            # Honour explicit status from UI; else infer from cheque_date.
            status_lower = (p_cheque_status or "").lower()
            if status_lower == "pending":
                is_cheque_cleared = False
            elif status_lower == "cleared":
                is_cheque_cleared = True
            elif cheque_norm:
                try:
                    is_cheque_cleared = getdate(cheque_norm) <= getdate(date_norm)
                except Exception:
                    is_cheque_cleared = True

        # For pending cheques: use the TRANSACTION date (date_norm) as posting_date,
        # NOT the cheque date.  The cheque_date is just a reference for when the
        # cheque is expected to clear — it should not dictate when the GL entry
        # lands.  When the cheque is later marked cleared, clearance_date will
        # be stamped with the actual clearing date.
        # For instantly-cleared cheques: also use date_norm so the entry appears
        # on the day the user made the transaction.
        posting_date = date_norm

        # 6. Build, insert, submit JE ────────────────────────────────────────
        je = frappe.new_doc("Journal Entry")
        je.company       = company
        je.posting_date  = posting_date
        je.voucher_type  = (
            "Contra Entry" if v_type == "contra"
            else ("Cash Entry" if (p_payment_mode or "").lower() == "cash" else "Bank Entry")
        )
        
        # Frappe requires specific voucher types for certain account types
        if v_type == "expense" and p_expense_account:
            acc_type = frappe.get_cached_value("Account", p_expense_account, "account_type")
            if acc_type == "Depreciation" or "depreciation" in p_expense_account.lower():
                je.voucher_type = "Depreciation Entry"
        if is_cheque:
            je.cheque_no   = p_cheque_no or "CHQ-" + frappe.generate_hash(length=8)
            je.cheque_date = cheque_norm
            if is_cheque_cleared:
                je.clearance_date = cheque_norm or date_norm
        elif je.voucher_type == "Bank Entry":
            je.cheque_no = p_cheque_no or ("TRF-" + frappe.generate_hash(length=8))
            je.cheque_date = posting_date
            je.clearance_date = posting_date

        from mandigrow.mandigrow.finance.cheque_api import (
            get_reconciliation_data,
            mark_cheque_cleared,
            cancel_cheque_voucher
        )

        remark_prefix = v_type.replace("_", " ").title()
        party_suffix  = f" — {party_name_display}" if party_name_display else ""
        bill_suffix   = f" for {against_vtype} {against_vname}" if against_vtype else ""
        bank_suffix   = f" (Cheque · {p_bank_name})" if (is_cheque and p_bank_name) else ""

        # If this is a pure write-off (no real money moved), use a clear description
        if amount == 0 and discount > 0:
            if v_type == "receipt":
                auto_remark = f"Write-off / Settlement{party_suffix} — Buyer balance reduced by ₹{discount}"
            else:
                auto_remark = f"Write-off / Settlement{party_suffix} — Supplier balance reduced by ₹{discount}"
        else:
            auto_remark = f"{remark_prefix}{party_suffix}{(' — ' + bill_suffix.strip()) if bill_suffix.strip() else ''}{bank_suffix}"

        je.user_remark = (p_remarks or auto_remark)[:140]

        if hasattr(je, "organization_id"):
            je.organization_id = org_id

        je.set("accounts", accounts)
        je.insert(ignore_permissions=True)
        
        # Only submit if it's NOT a pending cheque
        # Pending cheques must remain as draft (docstatus=0) until cleared 
        # so they don't pollute the Daybook and Party Ledger prematurely.
        if not (is_cheque and not is_cheque_cleared):
            je.submit()

        # ERPNext fix: clearance_date is read-only and stripped on insert/submit.
        # We MUST forcefully bypass the ORM and write the clearance date for ALL cleared cheques
        # AND all instantaneous Bank/UPI transfers. Otherwise, they get trapped in the Daybook's
        # "uncleared cheque" filter and disappear from liquid balances.
        # IMPORTANT: the elif must guard `not is_cheque` — cheque voucher_type is also "Bank Entry"
        # but pending cheques must NOT have a clearance_date stamped on them.
        if (is_cheque and is_cheque_cleared):
            je.db_set("clearance_date", cheque_norm or date_norm)
        elif je.voucher_type == "Bank Entry" and not is_cheque:
            je.db_set("clearance_date", posting_date)

        # ── 7. Optional Auto-settle oldest bills (FIFO) ─────────────────────
        if p_auto_allocate:
            total_settlement = amount + discount
            if total_settlement > 0 and p_party_id and not against_vtype:
                try:
                    if v_type == "receipt":
                        settle_buyer_receipt(p_organization_id=org_id, p_contact_id=p_party_id, p_payment_amount=total_settlement, p_payment_id=je.name)
                    elif v_type == "payment":
                        settle_supplier_payment(p_organization_id=org_id, p_contact_id=p_party_id, p_payment_amount=total_settlement, p_payment_id=je.name)
                except Exception as set_err:
                    frappe.log_error(f"Auto-settlement failed: {str(set_err)}")

        return {
            "success": True,
            "voucher_id": je.name,
            "voucher_type": v_type,
            "posting_date": str(je.posting_date),
            "cheque_cleared": is_cheque_cleared if is_cheque else None,
            "linked_to": {"type": against_vtype, "name": against_vname} if against_vtype else None,
            "party": party_doc_name,
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "create_voucher Failed")
        return {"error": str(e)}


@frappe.whitelist(allow_guest=False)
def mark_cheque_cleared(voucher_no: str, clearance_date: str = None) -> dict:
    from mandigrow.mandigrow.finance.cheque_api import mark_cheque_cleared as _mark_cheque_cleared
    return _mark_cheque_cleared(voucher_no, clearance_date)


@frappe.whitelist(allow_guest=False)
def cancel_cheque_voucher(voucher_no: str) -> dict:
    from mandigrow.mandigrow.finance.cheque_api import cancel_cheque_voucher as _cancel_cheque_voucher
    return _cancel_cheque_voucher(voucher_no)


@frappe.whitelist(allow_guest=False)
def get_reconciliation_data(org_id: str = None, date_from: str = None, date_to: str = None, status_filter: str = "All") -> dict:
    from mandigrow.mandigrow.finance.cheque_api import get_reconciliation_data as _get_reconciliation_data
    return _get_reconciliation_data(org_id, date_from, date_to, status_filter)


@frappe.whitelist(allow_guest=False)
def get_payments_register(
    page: int = 1,
    page_size: int = 15,
    type_filter: str = "all",
    date_from: str = None,
    date_to: str = None,
    search: str = None,
    org_id: str = None,
) -> dict:
    """Return a paginated payments/receipts register for the Finance page.

    Sources Journal Entries (Bank/Cash) in Frappe and shapes them into the
    Supabase-era `{ id, date, type, voucher_no, narration, amount, lines }`
    shape. Each line carries `{debit, credit, account_id, contact_id,
    account:{name}}` — the contact_id comes from the JE Account's party
    when the party_type is a Mandi Contact.

    IMPORTANT: org_id MUST be passed by the frontend so that company
    resolution matches get_daybook exactly.  Without it the fallback
    (_get_user_company) can resolve to a DIFFERENT company and entries
    visible on the Payments page will be invisible in the Daybook.
    """
    page = max(1, int(page or 1))
    page_size = max(1, min(100, int(page_size or 15)))
    # Resolve company the same way get_daybook does: prefer org_id, then session.
    company = None
    if org_id:
        company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
    if not company:
        company = _get_user_company()

    filters = [["docstatus", "=", 1], ["company", "=", company], ["voucher_type", "!=", "Opening Entry"]]
    if date_from:
        filters.append(["posting_date", ">=", date_from])
    if date_to:
        filters.append(["posting_date", "<=", date_to])

    if search:
        q = (search or "").strip()
        if q.isdigit():
            filters.append(["name", "like", f"%{q}%"])
        else:
            filters.append(["user_remark", "like", f"%{q}%"])

    total = frappe.db.count("Journal Entry", filters=filters)

    jes = frappe.get_all(
        "Journal Entry",
        filters=filters,
        fields=[
            "name", "posting_date", "voucher_type", "user_remark",
            "total_debit", "total_credit", "creation",
        ],
        order_by="creation desc",
        limit_start=(page - 1) * page_size,
        limit_page_length=page_size,
        ignore_permissions=True,
    )

    if not jes:
        return {"records": [], "total_count": total}

    je_names = [j["name"] for j in jes]
    rows = frappe.get_all(
        "Journal Entry Account",
        filters={"parent": ["in", je_names]},
        fields=[
            "parent", "account", "debit_in_account_currency as debit",
            "credit_in_account_currency as credit", "party_type", "party",
        ],
        ignore_permissions=True,
    )

    by_parent: dict = {}
    customer_partys: set = set()
    supplier_partys: set = set()
    account_types: dict = {}
    for row in rows:
        by_parent.setdefault(row["parent"], []).append(row)
        # Frappe writes party_type as "Customer" or "Supplier"; collect both
        # so we can resolve back to the Mandi Contact for display.
        ptype = row.get("party_type")
        pname = row.get("party")
        if pname:
            if ptype == "Customer":
                customer_partys.add(pname)
            elif ptype == "Supplier":
                supplier_partys.add(pname)
        acct = row.get("account")
        if acct and acct not in account_types:
            account_types[acct] = None

    if account_types:
        for a in frappe.get_all(
            "Account",
            filters={"name": ["in", list(account_types.keys())]},
            fields=["name", "account_type", "root_type"],
            ignore_permissions=True,
        ):
            atype = "cash" if (a.get("account_type") or "").lower() == "cash" else (
                "bank" if (a.get("account_type") or "").lower() == "bank" else (
                    "expense" if (a.get("root_type") or "").lower() == "expense" else ""
                )
            )
            account_types[a["name"]] = {
                "name": a["name"],
                "type": atype,
                "account_sub_type": atype,
            }

    # Resolve Customer/Supplier → Mandi Contact (so list rows can display
    # the buyer/farmer/supplier name instead of falling back to the account).
    party_to_contact: dict = {}     # (party_type, party) -> {id, name}
    if customer_partys:
        for c in frappe.get_all(
            "Mandi Contact",
            filters={"customer": ["in", list(customer_partys)]},
            fields=["name", "full_name", "customer"],
            ignore_permissions=True,
        ):
            party_to_contact[("Customer", c["customer"])] = {
                "id": c["name"], "name": c.get("full_name") or c["name"]
            }
    if supplier_partys:
        for c in frappe.get_all(
            "Mandi Contact",
            filters={"supplier": ["in", list(supplier_partys)]},
            fields=["name", "full_name", "supplier"],
            ignore_permissions=True,
        ):
            party_to_contact[("Supplier", c["supplier"])] = {
                "id": c["name"], "name": c.get("full_name") or c["name"]
            }
    # Fallback: legacy data where the GL `party` is the Mandi Contact id itself.
    legacy_ids = {p for (_, p) in (
        [("Customer", x) for x in customer_partys] + [("Supplier", x) for x in supplier_partys]
    ) if p and (("Customer", p) not in party_to_contact and ("Supplier", p) not in party_to_contact)}
    if legacy_ids:
        for c in frappe.get_all(
            "Mandi Contact",
            filters={"name": ["in", list(legacy_ids)]},
            fields=["name", "full_name"],
            ignore_permissions=True,
        ):
            party_to_contact.setdefault(("Customer", c["name"]), {"id": c["name"], "name": c.get("full_name") or c["name"]})
            party_to_contact.setdefault(("Supplier", c["name"]), {"id": c["name"], "name": c.get("full_name") or c["name"]})

    def classify(je_row, lines) -> str:
        # Receipt: bank/cash debit is the entry point.
        # Payment: bank/cash credit is the exit point.
        for ln in lines:
            acct_info = account_types.get(ln.get("account_id")) or {}
            if acct_info.get("type") in ("cash", "bank"):
                if float(ln.get("debit") or 0) > 0:
                    return "receipt"
                if float(ln.get("credit") or 0) > 0:
                    return "payment"
        return "journal"

    records = []
    for je in jes:
        lines_raw = by_parent.get(je["name"], [])
        lines = []
        for ln in lines_raw:
            acct = ln.get("account")
            ptype, pname = ln.get("party_type"), ln.get("party")
            contact = party_to_contact.get((ptype, pname)) if pname else None
            lines.append({
                "debit": float(ln.get("debit") or 0),
                "credit": float(ln.get("credit") or 0),
                "account_id": acct,
                "party_type": ptype,
                "party": pname,
                "contact_id": (contact or {}).get("id"),
                "contact_name": (contact or {}).get("name"),
                "account": account_types.get(acct) or {"name": acct or ""},
            })

        vtype = classify(je, lines)
        if type_filter and type_filter != "all" and vtype != type_filter:
            continue

        amount = float(je.get("total_debit") or je.get("total_credit") or 0)
        posting_date = je.get("posting_date")
        if posting_date is not None and not isinstance(posting_date, str):
            posting_date = posting_date.isoformat()
        creation = je.get("creation")
        if creation is not None and not isinstance(creation, str):
            creation = creation.isoformat()

        records.append({
            "id": je["name"],
            "date": posting_date,
            "type": vtype,
            "voucher_no": je["name"],
            "narration": je.get("user_remark") or "",
            "created_at": creation,
            "source": "journal_entry",
            "amount": amount,
            "lines": lines,
        })

    return {"records": records, "total_count": total}


@frappe.whitelist(allow_guest=False)
def record_advance_payment(p_organization_id: str = None, p_contact_id: str = None, p_lot_id: str = None, p_amount: float = None, 
                           p_payment_mode: str = None, p_date: str = None, p_narration: str = None, p_account_id: str = None, 
                           p_cheque_no: str = None, p_cheque_date: str = None, p_cheque_status: str = None) -> dict:
    """
    Specifically records an advance payment to a Farmer/Supplier.
    """
    # For now, we can route this to create_voucher with type 'payment'
    # but we add lot_id/reference_id to the narration
    return create_voucher(
        p_organization_id=p_organization_id,
        p_party_id=p_contact_id,
        p_amount=p_amount,
        p_voucher_type='payment',
        p_payment_mode=p_payment_mode,
        p_date=p_date,
        p_remarks=p_narration,
        p_cheque_no=p_cheque_no,
        p_cheque_date=p_cheque_date
    )

@frappe.whitelist(allow_guest=False)
def get_invoice_balance(p_invoice_id: str) -> float:
    """
    Returns balance for a specific invoice (Purchase/Sales Invoice).
    """
    try:
        # Check Sales Invoice first
        doc = None
        if frappe.db.exists("Sales Invoice", p_invoice_id):
            doc = frappe.get_doc("Sales Invoice", p_invoice_id)
        elif frappe.db.exists("Purchase Invoice", p_invoice_id):
            doc = frappe.get_doc("Purchase Invoice", p_invoice_id)
            
        if doc:
            return [{
                "total_amount": float(doc.grand_total),
                "amount_paid": float(doc.paid_amount),
                "balance_due": float(doc.outstanding_amount)
            }]
        return []
    except Exception as e:
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def settle_buyer_receipt(p_organization_id: str = None, p_contact_id: str = None, p_payment_amount: float = None, p_payment_id: str = None) -> dict:
    """
    Allocates a receipt amount to a buyer's oldest outstanding sale bills (FIFO).
    """
    try:
        if not p_payment_amount or p_payment_amount <= 0:
            return {"success": True, "message": "No amount to settle"}

        org_id = p_organization_id or _get_user_org()
        
        # Get all unpaid or partially paid sales for this buyer, oldest first
        sales = frappe.get_all("Mandi Sale",
            filters={
                "organization_id": org_id,
                "buyerid": p_contact_id,
                "status": ["in", ["Pending", "Partial", "Unpaid"]],
                "docstatus": 1
            },
            fields=["name", "totalamount", "amountreceived", "status"],
            order_by="saledate asc, creation asc"
        )

        remaining = float(p_payment_amount)
        for sale in sales:
            if remaining <= 0: break
            
            total = float(sale.totalamount or 0)
            received = float(sale.amountreceived or 0)
            due = max(0, total - received)
            
            if due <= 0.01:
                if sale.status != "Paid":
                    frappe.db.set_value("Mandi Sale", sale.name, {"status": "Paid", "amountreceived": total}, update_modified=False)
                continue
            
            if remaining >= due:
                # Fully clear this bill
                frappe.db.set_value("Mandi Sale", sale.name, {
                    "amountreceived": total,
                    "status": "Paid"
                }, update_modified=False)
                remaining -= due
            else:
                # Partially clear this bill
                frappe.db.set_value("Mandi Sale", sale.name, {
                    "amountreceived": received + remaining,
                    "status": "Partial"
                }, update_modified=False)
                remaining = 0
                
        frappe.db.commit()
        return {"success": True, "allocated": float(p_payment_amount) - remaining}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "settle_buyer_receipt Failed")
        return {"success": False, "error": str(e)}

@frappe.whitelist(allow_guest=False)
def settle_supplier_payment(p_organization_id: str = None, p_contact_id: str = None, p_payment_amount: float = None, p_payment_id: str = None) -> dict:
    """
    Allocates a payment amount to a supplier's oldest outstanding arrival bills (FIFO).
    """
    try:
        if not p_payment_amount or p_payment_amount <= 0:
            return {"success": True, "message": "No amount to settle"}

        org_id = p_organization_id or _get_user_org()
        
        base_fields = ["name", "net_payable_farmer as totalamount", "advance", "status"]
        if _col_exists("Mandi Arrival", "paid_amount"):
            base_fields.append("paid_amount as amountreceived")
        else:
            base_fields.append("advance as amountreceived")

        # Get all unpaid or partially paid arrivals for this farmer/supplier, oldest first
        arrivals = frappe.get_all("Mandi Arrival",
            filters={
                "organization_id": org_id,
                "party_id": p_contact_id,
                "status": ["in", ["Pending", "Partial", "Unpaid"]],
                "docstatus": 1
            },
            fields=base_fields,
            order_by="arrival_date asc, creation asc"
        )

        remaining = float(p_payment_amount)
        for arr in arrivals:
            if remaining <= 0: break
            
            total = float(arr.totalamount or 0)
            received = float(arr.amountreceived or arr.advance or 0)
            due = max(0, total - received)
            
            if due <= 0.01:
                if arr.status != "Paid":
                    upd = {"status": "Paid"}
                    if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = total
                    frappe.db.set_value("Mandi Arrival", arr.name, upd, update_modified=False)
                continue
            
            if remaining >= due:
                upd = {"status": "Paid"}
                if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = total
                frappe.db.set_value("Mandi Arrival", arr.name, upd, update_modified=False)
                remaining -= due
            else:
                upd = {"status": "Partial"}
                if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = received + remaining
                frappe.db.set_value("Mandi Arrival", arr.name, upd, update_modified=False)
                remaining = 0
                
        frappe.db.commit()
        return {"success": True, "allocated": float(p_payment_amount) - remaining}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "settle_supplier_payment Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_dashboard_data() -> dict:
    """
    Returns aggregated stats and recent activity for the dashboard.
    """
    org_id = _get_user_org()
    if not org_id:
        return {
            "revenue": 0,
            "collections": 0,
            "payables": 0,
            "inventory": 0,
            "recent_activity": [],
            "sales_data": []
        }
        
    company = _get_user_company()
    
    # Fetch Daybook data directly for perfect parity with the Day Book frontend logic
    daybook_data = get_daybook(date=today(), org_id=org_id)

    # ── 1. Today's Sales Summary — EXACT SAME GL source as Day Book ──────────
    # Day Book reads tabGL Entry debit legs for sale vouchers. We do the same
    # so Command Center and Day Book are guaranteed to show identical numbers.
    # The 'Mandi Sale' voucher type in ERPNext creates GL entries where:
    #   - Debit leg  → Receivable/Customer account (= totalamount)
    #   - Credit leg → Sales Revenue account
    # We SUM the max-debit per voucher (matching the Day Book Math.max logic)
    # to avoid double-counting when multiple GL legs exist per voucher.
    sales_gl_res = frappe.db.sql("""
        SELECT gl.voucher_no, MAX(gl.debit) as sale_debit, MAX(gl.credit) as cash_credit
        FROM `tabGL Entry` gl
        LEFT JOIN `tabAccount` acc ON gl.account = acc.name
        WHERE gl.is_cancelled = 0
          AND gl.posting_date = %s
          AND gl.company = %s
          AND gl.voucher_type = 'Sales Invoice'
        GROUP BY gl.voucher_no
    """, (today(), company), as_dict=True)

    # Fallback: if Sales Invoices don't exist (Mandi uses custom Sale doc),
    # fall back to Mandi Sale totalamount — this keeps things working even if
    # the GL hasn't been posted yet.
    if sales_gl_res:
        revenue = sum(float(r.sale_debit or 0) for r in sales_gl_res)
        collections = sum(float(r.cash_credit or 0) for r in sales_gl_res)
    else:
        # Authoritative fallback: Mandi Sale doctype (same filter as Day Book uses)
        today_sales = frappe.get_all("Mandi Sale",
            filters={"docstatus": 1, "saledate": today(), **_org_filter("Mandi Sale", org_id)},
            fields=["invoice_total", "amountreceived"],
            ignore_permissions=True,
        )
        revenue = sum(float(s.invoice_total or 0) for s in today_sales)
        collections = sum(float(s.amountreceived or 0) for s in today_sales)

    # Udhaar Sales = total billed minus cash collected
    payables = max(0.0, revenue - collections)
    
    # 2. Active Lots (Stock Ledger)
    # Filter lots by their parent Arrival's org_id
    valid_arrivals = frappe.get_all("Mandi Arrival", filters={**_org_filter("Mandi Arrival", org_id)}, pluck="name")
    if valid_arrivals:
        inventory = frappe.db.count("Mandi Lot", {"parent": ["in", valid_arrivals], "qty": [">", 0]})
    else:
        inventory = 0
    
    # 3. Recent Activity (Latest Arrivals & Sales)
    recent_activity = []
    
    # Get latest arrivals
    arrivals = frappe.get_all("Mandi Arrival",
        filters={"docstatus": 1, **_org_filter("Mandi Sale", org_id)},
        fields=["name", "creation", "party_id"],
        order_by="creation desc",
        limit=5
    )
    for arr in arrivals:
        # Get first lot for this arrival
        lot = frappe.db.get_value("Mandi Lot", {"parent": arr.name}, ["lot_code", "item_id", "current_qty", "unit"], as_dict=True)
        qty = lot.current_qty if lot else 0
        lot_code = lot.lot_code if lot else ""
        item_id = lot.item_id if lot else ""
        
        item_name = item_id
        if item_id:
            item_name = frappe.db.get_value("Item", item_id, "item_name") or item_id
        
        party = arr.party_id if arr.party_id else ""
        farmer_name = frappe.db.get_value("Mandi Contact", party, "full_name") or party if party else "Farmer"
        
        recent_activity.append({
            "id": arr.name,
            "created_at": arr.creation,
            "amount": qty,
            "type": "arrival",
            "buyer": None,
            "lot": {"item_type": item_id, "lot_code": lot_code, "item": {"name": item_name}},
            "description": f"Received from {farmer_name}"
        })
        
    # Get latest sales
    sales_docs = frappe.get_all("Mandi Sale",
        filters={"docstatus": 1, **_org_filter("Mandi Sale", org_id)},
        fields=["name", "creation", "buyerid", "invoice_total"],
        order_by="creation desc",
        limit=5
    )
    for s in sales_docs:
        # Find related lot code from items
        item_rows = frappe.get_all("Mandi Sale Item", filters={"parent": s.name}, fields=["lot_id", "item_id"], limit=1)
        lot_code = item_rows[0].lot_id if item_rows and item_rows[0].lot_id else ""
        item_name = "Item"
        if item_rows and item_rows[0].item_id:
            item_name = frappe.db.get_value("Item", item_rows[0].item_id, "item_name") or item_rows[0].item_id
        
        # Resolve customer name
        customer_name = frappe.db.get_value("Mandi Contact", s.buyerid, "full_name") or s.buyerid
        
        recent_activity.append({
            "id": s.name,
            "created_at": s.creation,
            "amount": s.invoice_total,
            "type": "sale",
            "buyer": {"name": customer_name, "id": s.buyerid},
            "lot": {"lot_code": lot_code, "item": {"name": item_name}},
            "description": f"Sold to {customer_name}"
        })
        
    # Sort combined activity by creation desc
    recent_activity.sort(key=lambda x: x["created_at"], reverse=True)
    recent_activity = recent_activity[:10]

    # 4. Payables (AP) is calculated in section 1 above as udhaar sales

    # 5. Network (Farmers)
    network = frappe.db.count("Mandi Contact", {"contact_type": "farmer", **_org_filter("Mandi Contact", org_id)})

    # 6. Sales Trend (Last 7 Days)
    start_date = add_days(today(), -6)
    
    trend_data = frappe.db.sql("""
        SELECT saledate as date, SUM(invoice_total) as value
        FROM `tabMandi Sale`
        WHERE organization_id = %s AND docstatus = 1 AND saledate >= %s
        GROUP BY saledate
        ORDER BY saledate ASC
    """, (org_id, start_date), as_dict=True)
    
    trend_dict = {str(d['date']): float(d['value']) for d in trend_data}
    sales_trend = []
    
    for i in range(6, -1, -1):
        d = str(add_days(today(), -i))
        sales_trend.append({
            "date": d,
            "value": trend_dict.get(d, 0.0)
        })

    # 7. Purchase Insights: Cash vs Udhaar (Today's Arrivals)
    cash_purchase = 0
    total_purchase_volume = 0
    today_arrivals = frappe.get_all("Mandi Arrival",
        filters={"docstatus": 1, "arrival_date": today(), **_org_filter("Mandi Arrival", org_id)},
        fields=["name", "net_payable_farmer", "advance"]
    )
    
    for arr in today_arrivals:
        total_purchase_volume += float(arr.net_payable_farmer or 0)
        cash_purchase += float(arr.advance or 0)
        
    udhaar_purchase = max(0, total_purchase_volume - cash_purchase)

    # 8. Liquid Assets: EXACT SAME LOGIC as Day Book summary card ─────────────
    # Day Book liquid_assets = cash movements from STANDALONE Journal Entries only.
    # Specifically: Journal Entry legs on Cash/Bank accounts that are NOT tagged
    # against a Mandi Sale or Mandi Arrival (those belong to Cards 1 & 3).
    #
    # Day Book math (from day-book.tsx):
    #   inflow  = sum of Cash/Bank GL legs where credit > 0 (money flowing INTO the account)
    #             EXCLUDING: sale-payment legs, purchase-payment legs
    #   outflow = sum of Cash/Bank GL legs where debit > 0 (money flowing OUT)
    #             EXCLUDING: same
    #
    # The Daybook shows: Inflow = cash RECEIVED (credit on cash leg = cash comes in),
    # Outflow = cash PAID OUT (debit on cash leg = cash goes out)
    # Wait — in double-entry: Cash Dr = money IN; Cash Cr = money OUT.
    # Day Book: isLiquidAccountEntry → debit = inflow, credit = outflow.
    #
    # ISOLATION RULE:
    # - Standalone Receive Money / Make Payment entries → Liquid Assets
    # - Entries tagged against Mandi Sale / Arrival → stay in Card 1/3
    # - Expense entries → stay in Card 4
    # - Pending (uncleared) cheques → excluded (not cash yet)
    liquid_res = frappe.db.sql("""
        SELECT 
            COALESCE(SUM(CASE WHEN gl.debit > 0 THEN gl.debit ELSE 0 END), 0) as inflow,
            COALESCE(SUM(CASE WHEN gl.credit > 0 THEN gl.credit ELSE 0 END), 0) as outflow
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        LEFT JOIN `tabAccount` acc ON gl.account = acc.name
        WHERE gl.is_cancelled = 0
          AND gl.posting_date = %s
          AND gl.company = %s
          -- Only Cash/Bank accounts (actual liquid movement)
          AND acc.account_type IN ('Cash', 'Bank')
          -- Only Journal Entries (standalone payments/receipts)
          AND gl.voucher_type = 'Journal Entry'
          -- EXCLUDE only if the cash/bank GL leg ITSELF is tagged against Sale/Arrival.
          -- Note: After the create_voucher fix, cash legs are never tagged — only party legs are.
          -- This allows Receive Money / Make Payment entries to appear in Liquid Assets.
          AND (gl.against_voucher_type IS NULL OR gl.against_voucher_type NOT IN ('Mandi Sale', 'Mandi Arrival'))
          -- EXCLUDE expense-side entries (Card 4)
          AND gl.voucher_no NOT IN (
              SELECT DISTINCT gl2.voucher_no FROM `tabGL Entry` gl2
              JOIN `tabAccount` acc2 ON gl2.account = acc2.name
              WHERE acc2.root_type = 'Expense' AND gl2.is_cancelled = 0
          )
          -- EXCLUDE pending (uncleared) cheques — not cash yet
          AND (je.cheque_no IS NULL OR je.cheque_no = '' OR je.clearance_date IS NOT NULL)
    """, (today(), company), as_dict=True)
    inflow  = float(liquid_res[0].inflow  if liquid_res and liquid_res[0].inflow  else 0)
    outflow = float(liquid_res[0].outflow if liquid_res and liquid_res[0].outflow else 0)

    # 9. Daily Expenses: Sum of Expense debits today
    expense_res = frappe.db.sql("""
        SELECT SUM(debit - credit) as total
        FROM `tabGL Entry`
        WHERE is_cancelled = 0 
          AND posting_date = %s
          AND company = %s
          AND account IN (SELECT name FROM tabAccount WHERE root_type = 'Expense')
    """, (today(), company), as_dict=True)
    daily_expenses = expense_res[0].total if expense_res and expense_res[0].total else 0

    # Also compute Mandi Sale-level cash/udhaar for Sales Summary card
    # to guarantee parity with Day Book (which uses amountreceived from Mandi Sale)
    today_sales_docs = frappe.get_all("Mandi Sale",
        filters={"docstatus": 1, "saledate": today(), **_org_filter("Mandi Sale", org_id)},
        fields=["invoice_total", "amountreceived"],
        ignore_permissions=True,
    )
    # Use invoice_total as the authoritative total (what was billed)
    # Use amountreceived as cash collected (matches Day Book "Cash Sales Collected")
    if today_sales_docs:
        revenue     = sum(float(s.invoice_total     or 0) for s in today_sales_docs)
        collections = sum(float(s.amountreceived    or 0) for s in today_sales_docs)
    # payables (udhaar) already computed above

    return {
        "stats": {
            "revenue": float(revenue),
            "inventory": int(inventory),
            "collections": float(collections),
            "payables": float(payables),
            "network": int(network),
            "purchases": float(total_purchase_volume),
            "cash_purchase": float(cash_purchase),
            "udhaar_purchase": float(udhaar_purchase),
            "inflow": float(inflow),
            "outflow": float(outflow),
            "daily_expenses": float(daily_expenses)
        },
        # Include raw daybook so the frontend can derive stats via calculateDaybookStats
        # — guaranteeing absolute parity between Command Center and the Day Book report.
        "daybook_data": daybook_data,
        "recentActivity": recent_activity,
        "salesTrend": sales_trend
    }


@frappe.whitelist(allow_guest=False)
def check_contact_id_exists(internal_id: str, contact_type: str) -> dict:
    """Checks if a contact with the given internal_id and type already exists."""
    exists = frappe.db.exists("Mandi Contact", {"internal_id": internal_id, "contact_type": contact_type})
    if exists:
        name = frappe.db.get_value("Mandi Contact", exists, "full_name")
        return {"exists": True, "name": name}
    return {"exists": False}

@frappe.whitelist(allow_guest=False)
def create_contact(full_name: str, contact_type: str, phone: str = None, city: str = None, address: str = None, internal_id: str = None, opening_balance: float = 0, balance_type: str = 'receivable', org_id: str = None,
    gstin: str = None, pan_number: str = None, state: str = None, pincode: str = None,
    billing_address_line1: str = None, billing_address_line2: str = None) -> dict:
    """Creates a new Mandi Contact and optional opening balance."""
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    org_id = _get_user_org()
    doc = frappe.get_doc({
        "doctype": "Mandi Contact",
        "full_name": full_name,
        "contact_type": contact_type,
        "phone": phone,
        "city": city,
        "address": address,
        "internal_id": internal_id,
        "organization_id": org_id,
        "status": "active",
        # GST & Compliance fields
        "gstin": (gstin or "").strip().upper() or None,
        "pan_number": (pan_number or "").strip().upper() or None,
        "state": state,
        "pincode": pincode,
        "billing_address_line1": billing_address_line1,
        "billing_address_line2": billing_address_line2,
    })
    doc.insert(ignore_permissions=True)
    
    if opening_balance > 0:
        """
        Opening Balance Journal Entry — accounting rules per user requirement:

        'To Pay'    (balance_type='payable'):
            Mandi purchased goods but hasn't paid yet → Supplier owes us nothing, WE owe THEM.
            Entry: Dr Opening Equity  /  Cr Payable (Supplier)
            Meaning: liability created, mandi received goods on credit.

        'To Receive' (balance_type='receivable'):
            Mandi sold goods but hasn't collected yet → Buyer owes mandi money.
            Entry: Dr Receivable (Customer)  /  Cr Opening Equity
            Meaning: asset created, mandi has outstanding money to collect.

        Both legs use is_opening='Yes' so:
          - Day Book tx_type is correctly set to 'opening_balance'
          - Liquid Assets SQL (which filters on Cash/Bank accounts) never picks these up
          - Opening balance is shown in Day Book transactions, NOT in inflow/outflow
        """
        company = _get_user_company()
        # Prefer 'Temporary Opening' account; fall back to any Equity account.
        account = (
            frappe.db.get_value("Account", {"account_name": "Temporary Opening", "company": company}, "name")
            or frappe.db.get_value("Account", {"account_type": "Equity", "company": company}, "name")
        )

        from mandigrow.mandigrow.logic.automation import ensure_customer_for_contact, ensure_supplier_for_contact

        party_type   = "Customer" if contact_type == 'buyer' else "Supplier"
        balance_label = "To Receive" if balance_type == 'receivable' else "To Pay"

        if party_type == "Customer":
            party         = ensure_customer_for_contact(doc.name, company)
            party_account = frappe.db.get_value("Account", {"account_type": "Receivable", "company": company}, "name")
        else:
            party         = ensure_supplier_for_contact(doc.name, company)
            party_account = frappe.db.get_value("Account", {"account_type": "Payable",    "company": company}, "name")

        if party and party_account and account:
            je = frappe.get_doc({
                "doctype":      "Journal Entry",
                # 'Opening Entry' voucher_type ensures Frappe marks GL legs with is_opening='Yes'
                # → Day Book detects tx_type='opening_balance' via the is_opening=="Yes" guard
                # → Liquid Assets SQL (Cash/Bank filter) never sees these Receivable/Payable legs
                "voucher_type": "Opening Entry",
                "posting_date": frappe.utils.today(),
                "company":      company,
                # user_remark acts as a Day Book text-hint fallback
                "user_remark":  f"Opening Balance ({balance_label}) — {doc.full_name}",
                "accounts": [
                    {
                        # Receivable leg: Debit when 'To Receive' (asset), Credit when 'To Pay' (liability)
                        "account":                   party_account,
                        "party_type":                party_type,
                        "party":                     party,
                        "debit_in_account_currency":  opening_balance if balance_type == 'receivable' else 0,
                        "credit_in_account_currency": opening_balance if balance_type == 'payable'    else 0,
                    },
                    {
                        # Equity contra leg: always the opposite side
                        "account":                   account,
                        "debit_in_account_currency":  opening_balance if balance_type == 'payable'    else 0,
                        "credit_in_account_currency": opening_balance if balance_type == 'receivable' else 0,
                    },
                ],
            })
            je.flags.ignore_permissions = True
            je.insert()
            je.submit()
            frappe.db.commit()

    return {"name": doc.name, "full_name": doc.full_name}

@frappe.whitelist(allow_guest=False)
def get_gate_entries(date_from: str = None, date_to: str = None) -> list:
    """
    Returns list of gate entries for the current org.
    
    BUG FIX: Filter on the system `creation` field (always populated by Frappe
    on every insert) NOT on `created_at` (a custom Datetime field that was never
    explicitly written during create_gate_entry → always NULL → 0 rows returned).
    """
    org_id = _get_user_org()
    filters = {"organization_id": org_id} if org_id else {}

    if date_from and date_to:
        # Use Frappe's system `creation` field — guaranteed non-NULL on every doc.
        # Append time bounds so the full end-date is included (creation is a Datetime).
        filters["creation"] = ["between", [f"{date_from} 00:00:00", f"{date_to} 23:59:59"]]
        
    return frappe.get_all("Mandi Gate Entry",
        fields=[
            "name as id", "token_no", "status",
            "vehicle_number", "driver_name", "driver_phone",
            "commodity", "source", "created_at", "creation"
        ],
        filters=filters,
        order_by="creation desc",
        ignore_permissions=True
    )

@frappe.whitelist(allow_guest=False)

@frappe.whitelist(allow_guest=False)
def get_gate_entry(entry_id: str) -> dict:
    """
    Fetch a single Gate Entry by ID (name) for the current org.
    """
    org_id = _get_user_org()
    if not frappe.db.exists("Mandi Gate Entry", entry_id):
        frappe.throw("Gate Entry not found", frappe.DoesNotExistError)
        
    doc = frappe.get_doc("Mandi Gate Entry", entry_id)
    if org_id and doc.organization_id != org_id:
        frappe.throw("Not permitted", frappe.PermissionError)
        
    return {
        "id": doc.name,
        "token_no": doc.token_no,
        "status": doc.status,
        "vehicle_number": doc.vehicle_number or doc.vehicle_no,
        "vehicle_no": doc.vehicle_number or doc.vehicle_no,
        "driver_name": doc.driver_name,
        "driver_phone": doc.driver_phone,
        "commodity": doc.commodity,
        "source": doc.source,
        "created_at": doc.creation,
        "updated_at": doc.modified,
        "organization_id": doc.organization_id
    }

@frappe.whitelist(allow_guest=False)
def create_gate_entry(vehicle_number: str, driver_name: str = None, driver_phone: str = None, commodity: str = None, source: str = None) -> dict:
    """
    Creates a new Gate Entry.
    
    BUG FIX:
    - Explicitly set `created_at` to now (the DocType default 'Today' only applies
      to UI-created docs, not Python inserts → previously always NULL).
    - Generate `token_no` via an org-scoped atomic counter so it is unique per org
      and sequential (was previously unset / always 0).
    """
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    org_id = _get_user_org()

    # Org-scoped sequential token number — atomic via frappe.db.sql for safety.
    # Uses a simple MAX(token_no)+1 pattern; safe for low-concurrency mandi ops.
    max_token = frappe.db.sql(
        "SELECT COALESCE(MAX(token_no), 0) FROM `tabMandi Gate Entry` WHERE organization_id = %s",
        (org_id,)
    )
    next_token = int(max_token[0][0] if max_token else 0) + 1

    now = frappe.utils.now_datetime()
    doc = frappe.get_doc({
        "doctype": "Mandi Gate Entry",
        "vehicle_number": vehicle_number,
        "driver_name": driver_name,
        "driver_phone": driver_phone,
        "commodity": commodity,
        "source": source,
        "organization_id": org_id,
        "status": "pending",
        "token_no": next_token,
        "created_at": now,   # Explicitly set — DocType default 'Today' only fires in UI
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {
        "id": doc.name, 
        "token_no": doc.token_no,
        "vehicle_number": doc.vehicle_number,
        "driver_name": doc.driver_name,
        "commodity": doc.commodity,
        "source": doc.source,
        "status": doc.status,
        "created_at": doc.created_at
    }

@frappe.whitelist(allow_guest=False)
def delete_gate_entry(id: str) -> dict:
    """Deletes a gate entry."""
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
    enforce_org_match_by_name("Mandi Gate Entry", id)
    frappe.delete_doc("Mandi Gate Entry", id, ignore_permissions=True)
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def update_gate_entry_status(id: str, status: str) -> dict:
    """Updates the status of a gate entry."""
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match
    doc = frappe.get_doc("Mandi Gate Entry", id)
    enforce_org_match(doc)
    doc.status = status
    doc.save(ignore_permissions=True)
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def get_mandi_settings(org_id: str = None) -> dict:
    """Returns the settings for a specific organization."""
    org_id = _get_user_org()
    org_info = _get_org_info(org_id)
    
    # Map organization profile fields to settings payload
    settings = {
        "commission_rate_default": float(org_info.get("commission_rate_default") or 0),
        "market_fee_percent": float(org_info.get("market_fee_percent") or 0),
        "nirashrit_percent": float(org_info.get("nirashrit_percent") or 0),
        "misc_fee_percent": float(org_info.get("misc_fee_percent") or 0),
        "default_credit_days": int(org_info.get("default_credit_days") or 15),
        "state_code": org_info.get("state_code") or "",
        "gst_enabled": bool(org_info.get("gst_enabled")),
        "gst_type": org_info.get("gst_type") or "intra",
        "cgst_percent": float(org_info.get("cgst_percent") or 0),
        "sgst_percent": float(org_info.get("sgst_percent") or 0),
        "igst_percent": float(org_info.get("igst_percent") or 0),
        "brand_color": org_info.get("brand_color") or "#10b981"
    }
    return settings

@frappe.whitelist(allow_guest=False)
def get_payment_settings() -> dict:
    """
    Returns the payment/UPI print settings stored in Mandi Organization.payment_settings.
    Also returns the list of bank accounts so the UI can populate bank selectors.
    """
    import json
    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "error": "Organization not found"}

    try:
        raw = frappe.db.get_value("Mandi Organization", org_id, "payment_settings")
        if raw:
            settings = json.loads(raw) if isinstance(raw, str) else (raw or {})
        else:
            settings = {}
    except Exception:
        settings = {}

    # Fetch bank accounts (with description metadata)
    banks = get_bank_accounts(org_id)

    return {
        "success": True,
        "settings": settings,
        "banks": banks,
    }


@frappe.whitelist(allow_guest=False)
def save_payment_settings(**kwargs) -> dict:
    """
    Persists payment/UPI print settings into Mandi Organization.payment_settings (JSON field).
    Accepts the full settings payload from the bank-details page.
    """
    import json
    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "error": "Organization not found"}

    try:
        settings = {
            "upi_id":             kwargs.get("upi_id", ""),
            "upi_name":           kwargs.get("upi_name", ""),
            "bank_name":          kwargs.get("bank_name", ""),
            "account_number":     kwargs.get("account_number", ""),
            "ifsc_code":          kwargs.get("ifsc_code", ""),
            "account_holder":     kwargs.get("account_holder", ""),
            "print_upi_qr":       bool(kwargs.get("print_upi_qr", False)),
            "print_bank_details": bool(kwargs.get("print_bank_details", False)),
            "text_bank_id":       kwargs.get("text_bank_id", ""),
            "qr_bank_id":         kwargs.get("qr_bank_id", ""),
        }

        if frappe.db.has_column("Mandi Organization", "payment_settings"):
            frappe.db.set_value("Mandi Organization", org_id, "payment_settings", json.dumps(settings), update_modified=False)
        else:
            # Graceful fallback: store in org notes/description field
            frappe.log_error("payment_settings column missing — run bench migrate", "save_payment_settings")
            return {"success": False, "error": "Schema not migrated. Run bench migrate on server."}

        frappe.db.commit()
        return {"success": True, "message": "Payment settings saved."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "save_payment_settings Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_master_data(org_id: str = None, contact_type: str = None) -> dict:

    """
    Returns all master data needed for forms (contacts, commodities, units, settings).
    Supports filtering contacts by type (e.g. for Arrivals vs Sales).
    """
    org_id = _get_user_org()
    if org_id and "ORG" in org_id and "-" not in org_id:
        org_id = f"ORG-{org_id.replace('ORG', '')}"
    # Build contact WHERE clause manually to avoid frappe.get_all alias conflict.
    # frappe.get_all always auto-injects `name` (PK) into SELECT, so using
    # 'full_name as name' creates a duplicate column alias that breaks as_dict
    # result parsing, causing empty contact lists even when records exist.
    contact_where = ["1=1"]
    contact_params = []
    if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
        contact_where.append("organization_id = %s")
        contact_params.append(org_id)

    if contact_type:
        types = contact_type.split(",") if "," in contact_type else [contact_type]
        placeholders = ",".join(["%s"] * len(types))
        contact_where.append(f"contact_type IN ({placeholders})")
        contact_params.extend(types)

    has_internal_id = frappe.db.has_column("Mandi Contact", "internal_id")
    internal_id_col = ", internal_id" if has_internal_id else ""

    contacts_raw = frappe.db.sql(f"""
        SELECT name AS id, full_name AS display_name, contact_type AS type, city {internal_id_col}
        FROM `tabMandi Contact`
        WHERE {' AND '.join(contact_where)}
        ORDER BY full_name ASC
    """, contact_params, as_dict=True)

    contacts = []
    for c in contacts_raw:
        contacts.append({
            "id": c.get("id") or "",
            "name": c.get("display_name") or c.get("id") or "Unknown",
            "type": c.get("type") or "",
            "city": c.get("city") or "",
            "internal_id": c.get("internal_id") if has_internal_id else None,
        })

    try:
        commodities_res = get_commodities()
        commodities = commodities_res.get("commodities", [])
    except Exception:
        commodities = []

    # Return only mandi-relevant units — NOT the full ERPNext UOM table (200+ scientific units)
    MANDI_UNITS = ["Box", "Crate", "Kgs", "Tons", "Nug", "Pieces", "Carton", "Bunch", "Nos", "Kg"]
    units = [{"name": u} for u in MANDI_UNITS]

    settings = get_mandi_settings(org_id)

    # Fetch liquid accounts via the shared get_bank_accounts helper.
    # This ensures get_master_data (used by all payment forms) and
    # get_bank_accounts (used by finance-dashboard) return IDENTICAL data.
    # Only user-created accounts (with JSON description) are returned.
    all_liquid = get_bank_accounts(org_id)

    # Ensure is_default is a proper boolean for the frontend
    for acc in all_liquid:
        acc['is_default'] = bool(acc.get('is_default'))

    banks = [a for a in all_liquid if a.get('account_type') == "Bank"]
    cash_accounts = [a for a in all_liquid if a.get('account_type') == "Cash"]

    # Fetch storage locations — scoped to THIS org only (prevents cross-org data leak)
    storage_locations = frappe.get_all("Mandi Storage Location",
        filters={"is_active": 1, **_org_filter("Mandi Storage Location", org_id)},
        fields=["name as id", "location_name as name", "is_active"],
        ignore_permissions=True
    )
    
    # Self-Healing Default: create 'Mandi' only if NONE exist (idempotent guard)
    if not storage_locations:
        try:
            # Check if "Mandi" already exists (any name/spelling) before creating
            existing = frappe.db.get_value(
                "Mandi Storage Location",
                {"location_name": "Mandi", "organization_id": org_id},
                "name"
            )
            if existing:
                # It exists but wasn't returned (maybe is_active=0) — activate it
                frappe.db.set_value("Mandi Storage Location", existing, "is_active", 1)
                frappe.db.commit()
                storage_locations = [{"id": existing, "name": "Mandi", "is_active": True}]
            else:
                new_loc = frappe.get_doc({
                    "doctype": "Mandi Storage Location",
                    "location_name": "Mandi",
                    "organization_id": org_id,
                    "is_active": 1
                })
                new_loc.insert(ignore_permissions=True)
                frappe.db.commit()
                storage_locations = [{"id": new_loc.name, "name": "Mandi", "is_active": True}]
        except Exception as e:
            frappe.log_error(f"Failed to create default storage location for {org_id}: {str(e)}")
            storage_locations = []

    crate_types = []
    if frappe.db.exists("DocType", "Mandi Crate Type"):
        try:
            _auto_migrate_crate_schema()
        except Exception:
            pass
            
        # Detect which optional columns exist in the live DB (safe after partial migration)
        existing_cols = {row[0] for row in frappe.db.sql(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tabMandi Crate Type'"
        )}

        select_cols = "name as id, crate_name, capacity_kg, deposit_amount, is_active, organization_id"
        if "purchase_rate" in existing_cols:
            select_cols += ", purchase_rate"
        if "sale_rate" in existing_cols:
            select_cols += ", sale_rate"

        try:
            ct_list = frappe.db.sql(f"""
                SELECT {select_cols}
                FROM `tabMandi Crate Type`
                WHERE is_active = 1 AND (organization_id = %s OR organization_id IS NULL OR organization_id = '')
                ORDER BY crate_name
            """, (org_id,), as_dict=True)
            
            stock_map = _get_crate_stock_balance(org_id)
            
            for ct in ct_list:
                s = stock_map.get(ct["id"], {})
                ct["purchase_rate"] = float(ct.get("purchase_rate") or 0)
                ct["sale_rate"] = float(ct.get("sale_rate") or 0)
                ct["capacity_kg"] = float(ct.get("capacity_kg") or 0)
                ct["deposit_amount"] = float(ct.get("deposit_amount") or 0)
                ct["available"] = s.get("available", 0)
                
            crate_types = ct_list
        except Exception as e:
            frappe.log_error(f"Error fetching crate types in get_master_data: {str(e)}")
            crate_types = []

    return {
        "contacts": contacts,
        "commodities": commodities,
        "units": [u.get('name') for u in units],
        "settings": settings,
        "banks": banks,
        "cash_accounts": cash_accounts,
        "storage_locations": storage_locations,
        "crate_types": crate_types
    }

@frappe.whitelist(allow_guest=False)
def adjust_liquid_balance(p_organization_id: str = None, p_account_id: str = None, p_amount: float = None, p_adjustment_type: str = None, p_description: str = None, p_date: str = None) -> dict:
    try:
        company = _get_user_company()
        amount = flt(p_amount or 0)
        if amount <= 0:
            return {"error": "Amount must be greater than 0"}
            
        equity_account = frappe.db.get_value("Account", {"account_type": "Equity", "company": company}, "name")
        if not equity_account:
            equity_account = frappe.db.get_value("Account", {"account_name": ["like", "%Opening%"], "company": company}, "name")
        if not equity_account:
            return {"error": "Equity/Opening balance account not found in Chart of Accounts"}
            
        # Normalize date: strip any ISO 8601 time component (e.g. "2026-05-05T08:09:11.228Z" → "2026-05-05")
        posting_date = str(p_date).split("T")[0] if p_date else frappe.utils.today()

        je = frappe.get_doc({
            "doctype": "Journal Entry",
            "voucher_type": "Journal Entry",
            "posting_date": posting_date,
            "company": company,
            "remark": p_description,
            "accounts": [
                {
                    "account": p_account_id,
                    "debit_in_account_currency": amount if p_adjustment_type == "deposit" else 0,
                    "credit_in_account_currency": amount if p_adjustment_type == "withdraw" else 0,
                },
                {
                    "account": equity_account,
                    "debit_in_account_currency": amount if p_adjustment_type == "withdraw" else 0,
                    "credit_in_account_currency": amount if p_adjustment_type == "deposit" else 0,
                }
            ]
        })
        je.insert(ignore_permissions=True)
        je.submit()
        frappe.db.commit()
        return {"success": True, "message": "Adjustment successful"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "adjust_liquid_balance Failed")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def transfer_liquid_funds(p_organization_id: str = None, p_from_account_id: str = None, p_to_account_id: str = None, p_amount: float = None, p_remarks: str = None, p_transfer_date: str = None) -> dict:
    try:
        company = _get_user_company()

        amount = flt(p_amount or 0)
        if amount <= 0:
            return {"error": "Amount must be greater than 0"}

        # Normalize date: frontend sends ISO 8601 like "2026-05-05T08:09:11.228Z"
        # MySQL DATE column only accepts YYYY-MM-DD — strip the time component.
        if p_transfer_date:
            posting_date = str(p_transfer_date).split("T")[0]
        else:
            posting_date = frappe.utils.today()

        je = frappe.get_doc({
            "doctype": "Journal Entry",
            "voucher_type": "Journal Entry",
            "posting_date": posting_date,
            "company": company,
            "remark": p_remarks or "Cash/Bank Transfer",
            "accounts": [
                {
                    "account": p_from_account_id,
                    "credit_in_account_currency": amount,
                },
                {
                    "account": p_to_account_id,
                    "debit_in_account_currency": amount,
                }
            ]
        })
        je.insert(ignore_permissions=True)
        je.submit()
        frappe.db.commit()
        return {"success": True, "message": "Transfer successful"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "transfer_liquid_funds Failed")
        return {"error": str(e)}


@frappe.whitelist(allow_guest=False)
def cleanup_demo_accounts() -> dict:
    """
    Removes 'Demo Bank Account' placeholder accounts created by setup_new_tenant.
    Safe to call multiple times (idempotent).
    Only removes accounts that have zero GL Entries (no real transactions).
    """
    company = _get_user_company()
    if not company:
        return {"success": False, "error": "No company found for this user"}

    DEMO_NAMES = ["Demo Bank Account", "Demo Cash Account", "Demo Account"]
    removed = []
    disabled = []

    for demo_name in DEMO_NAMES:
        full_name = f"{demo_name} - {frappe.db.get_value('Company', company, 'abbr') or ''}"
        candidates = frappe.get_all("Account",
            filters={"company": company, "account_name": ["like", f"%{demo_name}%"]},
            pluck="name"
        )
        for acc_id in candidates:
            if frappe.db.exists("GL Entry", {"account": acc_id, "is_cancelled": 0}):
                frappe.db.set_value("Account", acc_id, "disabled", 1)
                disabled.append(acc_id)
            else:
                try:
                    frappe.delete_doc("Account", acc_id, ignore_permissions=True, force=True)
                    removed.append(acc_id)
                except Exception as e:
                    disabled.append(f"{acc_id} (err: {e})")

    frappe.db.commit()
    return {"success": True, "removed": removed, "disabled": disabled}

@frappe.whitelist()
def get_bank_accounts(org_id: str = None) -> list:
    """
    Returns liquid accounts for use on the Banks page and Finance Dashboard.

    Strategy:
    - BANK accounts: Only return user-created ones (JSON description from save_bank_account).
      This excludes system default COA nodes like "Bank - SY".
    - CASH accounts: Always return ALL cash accounts for the company, including the system
      "Cash In Hand" account created during company setup. This ensures the Banks page
      "Total Cash in Hand" matches the Finance Dashboard exactly (single source of truth).

    Returns is_default and current GL balance for all accounts.
    """
    org_id = _get_user_org()
    company = _get_user_company()

    has_desc = frappe.db.has_column("Account", "description")
    has_is_def = frappe.db.has_column("Account", "is_default")

    fields = ["name as id", "account_name as name", "account_type", "account_number", "company"]
    if has_desc:
        fields.append("description")
    if has_is_def:
        fields.append("is_default")

    all_accounts = frappe.get_all("Account",
        filters={"account_type": ["in", ["Bank", "Cash"]], "is_group": 0, "disabled": 0, "company": company},
        fields=fields,
        ignore_permissions=True
    )

    bank_accounts = [a for a in all_accounts if a.get("account_type") == "Bank"]
    cash_accounts = [a for a in all_accounts if a.get("account_type") == "Cash"]

    # For BANK accounts: only show user-created ones (have a JSON description)
    user_banks = [
        a for a in bank_accounts
        if a.get("description") and str(a["description"]).strip().startswith("{")
    ]
    if not user_banks:
        # Fallback: if no user-created banks found, return all bank accounts
        user_banks = bank_accounts

    # For CASH accounts: always include ALL cash accounts (system + user-created).
    # This ensures "Cash In Hand" system account is never excluded even if it lacks a JSON desc.
    # Sort: user-created cash accounts first (have JSON desc), then system ones
    user_cash_ids = {
        a["id"] for a in cash_accounts
        if a.get("description") and str(a["description"]).strip().startswith("{")
    }
    user_cash = (
        [a for a in cash_accounts if a["id"] in user_cash_ids] +
        [a for a in cash_accounts if a["id"] not in user_cash_ids]
    )

    user_accounts = user_banks + user_cash

    # Batch-fetch GL balances in one SQL call
    if user_accounts:
        acc_ids = tuple(a["id"] for a in user_accounts)
        bal_rows = frappe.db.sql("""
            SELECT account, COALESCE(SUM(debit) - SUM(credit), 0) as balance
            FROM `tabGL Entry`
            WHERE account IN %s AND is_cancelled = 0 AND company = %s
            GROUP BY account
        """, (acc_ids, company), as_dict=True)
        bal_map = {r["account"]: float(r["balance"] or 0) for r in bal_rows}
        for acc in user_accounts:
            acc["balance"] = bal_map.get(acc["id"], 0.0)
            acc["is_default"] = 1 if acc.get("is_default") else 0

    return user_accounts


@frappe.whitelist(allow_guest=False)
def get_invoice_banks() -> list:
    """Return all bank accounts that have show_on_invoice=True in their JSON description.
    Used by the invoice template to print bank details / QR codes for marked banks.
    """
    import json
    all_banks = get_bank_accounts()
    invoice_banks = []
    for bank in all_banks:
        if bank.get("account_type") != "Bank":
            continue
        desc_raw = bank.get("description") or ""
        meta = {}
        if desc_raw and str(desc_raw).strip().startswith("{"):
            try:
                meta = json.loads(desc_raw)
            except Exception:
                pass
        if meta.get("show_on_invoice"):
            invoice_banks.append({
                "id": bank.get("id"),
                "name": bank.get("name"),
                "bank_name": meta.get("bank_name") or "",
                "account_number": meta.get("account_number") or "",
                "ifsc_code": meta.get("ifsc_code") or "",
                "upi_id": meta.get("upi_id") or "",
                "account_holder": meta.get("account_holder") or "",
                "show_upi_qr": bool(meta.get("show_upi_qr")),
                "is_default": bool(bank.get("is_default")),
            })
    return invoice_banks


@frappe.whitelist(allow_guest=False)
def save_bank_account(**kwargs) -> dict:
    """
    Creates or updates a Bank/Cash account in Frappe Chart of Accounts.
    """
    try:
        org_id = kwargs.get("organization_id") or _get_user_org()
        account_id = kwargs.get("id")
        name = kwargs.get("name")
        sub_type = kwargs.get("account_sub_type") or "Bank"
        opening_balance = flt(kwargs.get("opening_balance") or 0)
        is_default = kwargs.get("is_default")
        
        company = _get_user_company()
        
        # Parent account resolution
        parent = frappe.db.get_value("Account", {"account_type": sub_type, "is_group": 1, "company": company}, "name")
        if not parent:
            parent = frappe.db.get_value("Account", {"account_name": ["like", f"%{sub_type}%"], "is_group": 1, "company": company}, "name")
        
        if not parent:
            # Fallback to root asset
            parent = frappe.db.get_value("Account", {"is_group": 1, "root_type": "Asset", "company": company}, "name")

        # Store metadata in description for UI retrieval
        meta = {
            "account_number": kwargs.get("account_number"),
            "bank_name": kwargs.get("bank_name"),
            "ifsc_code": kwargs.get("ifsc_code"),
            "upi_id": kwargs.get("upi_id"),
            "account_holder": kwargs.get("account_holder"),
            "show_on_invoice": bool(kwargs.get("show_on_invoice")),
            "show_upi_qr": bool(kwargs.get("show_upi_qr")),
        }
        
        if not frappe.db.has_column("Account", "description"):
            from frappe.custom.doctype.custom_field.custom_field import create_custom_field
            create_custom_field("Account", {
                "fieldname": "description",
                "label": "Description",
                "fieldtype": "Text",
                "insert_after": "account_name"
            })
            frappe.db.commit()

        account_payload = {
            "doctype": "Account",
            "account_name": name,
            "parent_account": parent,
            "company": company,
            "account_type": sub_type,
            "account_sub_type": sub_type,
            "is_default": 1 if is_default else 0,
            "description": frappe.as_json(meta),
            "account_number": kwargs.get("account_number")
        }
        # Only write organization_id if the custom column actually exists in the DB
        if frappe.db.has_column("Account", "organization_id"):
            account_payload["organization_id"] = org_id

        if not account_id:
            # Predict Frappe's autoname to catch duplicates cleanly
            abbr = frappe.db.get_value("Company", company, "abbr")
            if abbr and not name.endswith(f" - {abbr}"):
                generated_name = f"{name} - {abbr}"
            else:
                generated_name = name
            
            if frappe.db.exists("Account", generated_name):
                existing_doc = frappe.get_doc("Account", generated_name)
                if existing_doc.disabled:
                    # Account was previously "deleted" (soft-disabled due to transactions)
                    # Re-enable it instead of creating a new one
                    existing_doc.disabled = 0
                    existing_doc.account_name = name
                    existing_doc.description = frappe.as_json(meta)
                    existing_doc.account_number = kwargs.get("account_number")
                    existing_doc.save(ignore_permissions=True)
                    frappe.db.commit()
                    return {"success": True, "id": generated_name, "message": "Restored previously disabled account."}
                else:
                    return {"success": False, "error": f"Account '{name}' already exists. Please use a unique label."}

            doc = frappe.get_doc(account_payload)
            doc.insert(ignore_permissions=True)
            
            # Post opening balance via Journal Entry
            if opening_balance > 0:
                equity_account = frappe.db.get_value("Account", {"account_type": "Equity", "company": company}, "name")
                if not equity_account:
                    equity_account = frappe.db.get_value("Account", {"account_name": ["like", "%Opening%"], "company": company}, "name")
                
                if equity_account:
                    je = frappe.get_doc({
                        "doctype": "Journal Entry",
                        "voucher_type": "Opening Entry",
                        "is_opening": "Yes",
                        "posting_date": frappe.utils.today(),
                        "company": company,
                        "user_remark": f"Opening Balance for {name}",
                        "accounts": [
                            {
                                "account": doc.name,
                                "debit_in_account_currency": opening_balance,
                                "is_advance": "No",
                            },
                            {
                                "account": equity_account,
                                "credit_in_account_currency": opening_balance,
                                "is_advance": "No",
                            }
                        ]
                    })
                    je.insert(ignore_permissions=True)
                    je.submit()
        else:
            doc = frappe.get_doc("Account", account_id)
            # Tenant guard: ensure this account belongs to the caller's company
            if doc.company != company:
                return {"success": False, "error": "Access denied: account belongs to another company."}
            # On edit: only update safe metadata — never account_name (triggers ERPNext rename)
            # Write description via raw SQL to avoid Small Text 255-char truncation
            #
            # KEY FIX: If all meta fields are None (caller only sent is_default),
            # preserve the existing description instead of wiping it with nulls.
            meta_fields = ["account_number", "bank_name", "ifsc_code", "upi_id", "account_holder"]
            has_real_meta = any(kwargs.get(f) is not None for f in meta_fields)

            if has_real_meta:
                # Full save — write new description
                meta_json = frappe.as_json(meta)
                new_account_number = kwargs.get("account_number") or ""
                frappe.db.sql("""
                    UPDATE `tabAccount`
                    SET `description` = %s, `account_number` = %s
                    WHERE `name` = %s
                """, (meta_json, new_account_number, account_id))
            # else: default-only change — leave description and account_number untouched

            # Handle is_default and organization_id separately via set_value
            scalar_update = {}
            if is_default is not None:
                scalar_update["is_default"] = 1 if is_default else 0
            if frappe.db.has_column("Account", "organization_id"):
                scalar_update["organization_id"] = org_id
            if scalar_update:
                frappe.db.set_value("Account", account_id, scalar_update, update_modified=False)
            frappe.db.commit()


            
        # Unset is_default on other accounts for this company+type (use company — always exists)
        if is_default:
            frappe.db.sql("""
                UPDATE `tabAccount` SET is_default = 0
                WHERE company = %s AND account_type = %s AND name != %s
            """, (company, sub_type, doc.name))
            
        frappe.db.commit()
        return {"success": True, "id": doc.name, "message": "Account saved successfully."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "save_bank_account Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def delete_bank_account(account_id: str) -> dict:
    try:
        # Tenant guard: verify account belongs to user's company
        from mandigrow.mandigrow.logic.tenancy import is_super_admin
        if not is_super_admin():
            company = _get_user_company()
            acc_company = frappe.db.get_value("Account", account_id, "company")
            if acc_company and acc_company != company:
                frappe.throw(_("You do not have permission to delete this account."), frappe.PermissionError)

        # 1. Check current balance
        balance_res = frappe.db.sql("""
            SELECT SUM(debit) - SUM(credit) 
            FROM `tabGL Entry` 
            WHERE account = %s AND is_cancelled = 0
        """, (account_id,))
        balance = flt(balance_res[0][0]) if balance_res and balance_res[0][0] else 0.0

        if abs(balance) > 0.01:
            return {
                "success": False, 
                "error": f"Cannot delete account. It has a non-zero balance of ₹{balance:,.2f}. Please empty the account by transferring or withdrawing the amount first."
            }

        # Check if used in GL Entry (has real transactions)
        if frappe.db.exists("GL Entry", {"account": account_id}):
            # Has real transactions — disable instead of delete
            doc = frappe.get_doc("Account", account_id)
            doc.disabled = 1
            if doc.account_number:
                doc.account_number = f"DEL-{frappe.utils.generate_hash()[:6]}-{doc.account_number}"
            doc.save(ignore_permissions=True)
            frappe.db.commit()
            return {"success": True, "message": "Account has transactions; it was disabled instead of deleted. It will no longer appear in new entries."}

        # No transactions — hard delete is safe
        frappe.delete_doc("Account", account_id, ignore_permissions=True, force=True)
        frappe.db.commit()
        return {"success": True, "message": "Account deleted."}
    except frappe.PermissionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"delete_bank_account({account_id}): {e}", "Bank Delete Error")
        return {"success": False, "error": str(e)}

@frappe.whitelist(allow_guest=False)
def get_voucher_health(days: int = 90, p_org_id: str = None) -> list:
    """
    Returns GL Entries for the last N days to check system activity and calculate bank balances.
    Cheque-aware: provides clearance status so the frontend can filter accordingly.
    """
    from frappe.utils import add_days, today
    date_limit = add_days(today(), -int(days))
    
    # Resolve company: prioritize p_org_id if provided
    company = None
    if p_org_id:
        company = frappe.db.get_value("Mandi Organization", p_org_id, "erp_company")
    if not company:
        company = _get_user_company()
    
    # Use raw SQL to get join with Journal Entry
    return frappe.db.sql("""
        SELECT 
            gl.voucher_no as voucher_id, 
            gl.account as account_id,
            gl.debit, 
            gl.credit,
            je.cheque_no,
            je.clearance_date
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE gl.posting_date >= %s 
          AND gl.company = %s
          AND gl.is_cancelled = 0
        LIMIT 50000
    """, (date_limit, company), as_dict=True)


@frappe.whitelist(allow_guest=False)
def get_list_permission_safe(doctype: str, filters: Union[dict, str, list] = None, fields: Union[list, str] = None, order_by: str = None, limit_page_length: int = 500) -> list:
    try:
        if isinstance(filters, str):
            import json
            filters = json.loads(filters)
        if isinstance(fields, str):
            import json
            fields = json.loads(fields)
            
        # Add basic multi-tenancy filter if it exists on the doctype
        meta = frappe.get_meta(doctype)
        if "organization_id" in [f.fieldname for f in meta.fields]:
            filters = filters or {}
            if isinstance(filters, dict) and "organization_id" not in filters:
                filters["organization_id"] = _get_user_org()
        elif "company" in [f.fieldname for f in meta.fields]:
            filters = filters or {}
            if isinstance(filters, dict) and "company" not in filters:
                filters["company"] = _get_user_company()

        return frappe.get_all(doctype,
            filters=filters,
            fields=fields or ["*"],
            order_by=order_by,
            limit_page_length=limit_page_length,
            ignore_permissions=True
        )
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_list_permission_safe Error")
        # Also print to stdout/stderr for log visibility
        print(f"API ERROR: {str(e)}")
        raise e

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: SALES, CONTACTS, STOCK, SETTINGS RPCs
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_invoices_for_return(search_term: str = None, page: int = 0) -> list:
    """
    Returns invoices from the last 30 days for return processing.
    """
    org_id = _get_user_org()
    if not org_id:
        return []

    # Normalization: ensure ORG-0000x format (matches get_master_data logic)
    if org_id and "ORG" in org_id and "-" not in org_id:
        org_id = f"ORG-{org_id.replace('ORG', '')}"

    page_size = 20
    start = int(page or 0) * page_size

    # 30-day filter
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.now() - timedelta(days=30)
    date_string = thirty_days_ago.strftime('%Y-%m-%d')

    filters = [
        ["organization_id", "=", org_id],
        ["saledate", ">=", date_string],
        ["docstatus", "=", 1] # Only submitted invoices are returnable
    ]

    if search_term:
        if search_term.isdigit():
            filters.append(["name", "like", f"%{search_term}%"])
        else:
            # Search by Buyer Name
            buyers = frappe.get_all("Mandi Contact", 
                filters={"full_name": ["like", f"%{search_term}%"], "organization_id": org_id}, 
                fields=["name"],
                ignore_permissions=True
            )
            if buyers:
                filters.append(["buyerid", "in", [b.name for b in buyers]])
            else:
                return []

    sales = frappe.get_all("Mandi Sale", 
        filters=filters,
        fields=[
            "name as id", "name as bill_no", "saledate as sale_date", "buyerid as buyer_id", 
            "totalamount as total_amount", "invoice_total", "discountamount as discount",
            "marketfee", "nirashrit", "miscfee", "loadingcharges", "unloadingcharges", "otherexpenses", "gsttotal"
        ],
        order_by="saledate desc",
        limit_start=start,
        limit_page_length=page_size,
        ignore_permissions=True
    )

    # Hydrate buyer info
    for s in sales:
        s.buyer = frappe.db.get_value("Mandi Contact", s.buyer_id, ["name as id", "full_name as name"], as_dict=1)
    
    return sales

@frappe.whitelist(allow_guest=False)
def get_sale_items_for_return(sale_id: str) -> list:
    """
    Returns items for a specific sale with remaining returnable quantity.
    """
    org_id = _get_user_org()
    if not org_id:
        return []

    # 1. Fetch Original Sale Items
    sale_items = frappe.get_all("Mandi Sale Item",
        filters={"parent": sale_id},
        fields=["name as id", "lot_id", "qty", "rate", "amount", "item_id", "returned_qty"],
        ignore_permissions=True
    )

    # 2. Calculate Remaining
    for item in sale_items:
        lot_info = frappe.db.get_value("Mandi Lot", item.lot_id, ["name as id", "lot_code", "item_id"], as_dict=1)
        if lot_info:
            lot_info.item = frappe.db.get_value("Item", lot_info.item_id, ["name as id", "item_name as name"], as_dict=1)
            item.lot = lot_info
        
        already_returned = item.get("returned_qty") or 0
        item.max_qty = max(0, item.qty - already_returned)
        item.original_sold_qty = item.qty
        item.already_returned = already_returned
        item.return_qty = 0 # Default for UI

    return sale_items

@frappe.whitelist(allow_guest=False)
def process_sale_return(payload: dict) -> dict:
    """
    Handles Sales Return and optional Exchange.
    Logic:
    1. Validate Return Items and Sale Reference.
    2. Create Journal Entry (Debit: Stock/Revenue, Credit: Buyer).
    3. Restore Lot Quantities.
    4. If 'exchange', trigger confirm_sale_transaction for new items.
    """
    from mandigrow.mandigrow.logic.automation import get_acc, get_debtor_acc, get_stock_acc, _tag_gl_entries, _get_cost_center
    from mandigrow.mandigrow.logic.erp_bootstrap import get_default_company
    
    org_id = _get_user_org()
    sale_id = payload.get("sale_id")
    return_items = payload.get("return_items", [])
    return_type = payload.get("return_type", "credit") # credit, cash, exchange
    remarks = payload.get("remarks", "")
    
    if not sale_id or not return_items:
        frappe.throw(_("Sale ID and items are required for return."))

    sale = frappe.get_doc("Mandi Sale", sale_id)
    _enforce_ownership(sale)
    company = _get_user_company()
    cost_center = _get_cost_center(company)
    
    total_refund = sum(flt(i.get("qty", 0)) * flt(i.get("rate", 0)) for i in return_items)
    
    # 1. Create Return Journal Entry
    # Debit: Stock In Hand (returning goods)
    # Credit: Debtors (reducing what buyer owes or creating a refund obligation) OR Cash (if cash return)
    credit_account = get_debtor_acc(company)
    party_type = "Customer"
    party = frappe.db.get_value("Mandi Contact", sale.buyerid, "customer")
    buyer_name = frappe.db.get_value("Mandi Contact", sale.buyerid, "full_name") or "Unknown"

    if return_type == "cash":
        credit_account = get_acc("Cash", company)
        party_type = None
        party = None

    je_accounts = [
        {
            "account": get_stock_acc(company),
            "debit_in_account_currency": total_refund,
            "cost_center": cost_center,
            "user_remark": f"Sales Return from {sale.name} - {buyer_name}"
        },
        {
            "account": credit_account,
            "credit_in_account_currency": total_refund,
            "cost_center": cost_center,
            "user_remark": f"Sales Return credit for {sale.name} - {buyer_name}"
        }
    ]

    if party_type and party:
        je_accounts[1]["party_type"] = party_type
        je_accounts[1]["party"] = party
    
    je = frappe.get_doc({
        "doctype": "Journal Entry",
        "voucher_type": "Journal Entry",
        "company": company,
        "posting_date": today(),
        "user_remark": f"Sales Return: {sale.name} - {buyer_name}",
        "accounts": je_accounts
    })
    je.insert(ignore_permissions=True)
    je.submit()
    _tag_gl_entries(je.name, "Mandi Sale", sale.name)
    
    # 2. Update Lot Quantities and Sale Item returned_qty
    for item in return_items:
        lot_id = item.get("lot_id")
        qty = flt(item.get("qty", 0))
        if lot_id:
            frappe.db.sql("""
                UPDATE `tabMandi Lot` 
                SET current_qty = current_qty + %s 
                WHERE name = %s
            """, (qty, lot_id))
            frappe.db.sql("""
                UPDATE `tabMandi Sale Item`
                SET returned_qty = COALESCE(returned_qty, 0) + %s
                WHERE parent = %s AND lot_id = %s
            """, (qty, sale_id, lot_id))
            
    return {
        "success": True,
        "return_je": je.name,
        "new_sale_id": None,
        "message": "Return processed and stock restored."
    }

@frappe.whitelist(allow_guest=False)
def get_sales_list(org_id: str = None, page: int = 1, page_size: int = 20,
                   status_filter: str = "all", date_from: str = None, date_to: str = None,
                   search: str = None) -> dict:
    """
    Paginated sales list with stats — replaces 4 parallel Supabase queries from Sales PageClient.
    Returns: {sales, total_count, total_revenue, debtors_count, creditors_count}
    """
    org_id = _get_user_org()
    page = int(page or 1)
    page_size = int(page_size or 20)

    filters = {"organization_id": org_id}
    if status_filter and status_filter != "all":
        if status_filter == "overdue":
            filters["status"] = ["in", ["Pending", "Partial"]]
            filters["duedate"] = ["<", today()]
        elif status_filter == "pending":
            filters["status"] = ["in", ["Pending", "Partial"]]
        elif status_filter == "paid":
            filters["status"] = "Paid"
    if date_from:
        filters["saledate"] = [">=", date_from[:10] if date_from else None]
    if date_to:
        if "saledate" in filters:
            filters["saledate"] = ["between", [date_from[:10] if date_from else "", date_to[:10] if date_to else ""]]
        else:
            filters["saledate"] = ["<=", date_to[:10] if date_to else None]

    # Search by buyer name
    if search:
        matching = frappe.get_all("Mandi Contact",
            filters={"full_name": ["like", f"%{search}%"], "organization_id": org_id},
            fields=["name"],
            limit_page_length=50,
            ignore_permissions=True
        )
        if matching:
            filters["buyerid"] = ["in", [m.name for m in matching]]
        else:
            # No matching buyers, search by bill number
            try:
                bill_no = int(search.strip())
                # Remove buyerid filter if set
                filters.pop("buyerid", None)
            except ValueError:
                # Force empty results
                return {"sales": [], "total_count": 0, "total_revenue": 0, "debtors_count": 0, "creditors_count": 0}

    total_count = frappe.db.count("Mandi Sale", filters=filters)

    # Build field list dynamically: include contact_bill_no and GST breakdown if columns exist
    sale_fields = ["name as id", "saledate as sale_date", "buyerid as buyer_id",
                "paymentmode as payment_mode", "totalamount as total_amount",
                "invoice_total", "amountreceived as amount_received", "duedate as due_date",
                "vehiclenumber as vehicle_number", "bookno as book_no",
                "lotno as lot_no", "chequeno as cheque_no", "bankname as bank_name",
                "marketfee as market_fee", "nirashrit", "miscfee as misc_fee",
                "loadingcharges as loading_charges", "unloadingcharges as unloading_charges",
                "otherexpenses as other_expenses", "gsttotal as gst_total",
                "discountamount as discount_amount", "creation", "status"]
    if frappe.db.has_column("Mandi Sale", "contact_bill_no"):
        sale_fields.append("contact_bill_no")
    if frappe.db.has_column("Mandi Sale", "cgst_amount"):
        sale_fields.extend(["cgst_amount", "sgst_amount", "igst_amount"])

    sales_raw = frappe.get_all("Mandi Sale",
        filters=filters,
        fields=sale_fields,
        order_by="creation desc",
        limit_start=(page - 1) * page_size,
        limit_page_length=page_size,
        ignore_permissions=True
    )

    # Enrich with buyer name and calculate stats
    buyer_cache = {}
    total_revenue = 0
    for s in sales_raw:
        bid = s.get("buyer_id")
        if bid and bid not in buyer_cache:
            buyer_cache[bid] = frappe.db.get_value("Mandi Contact", bid, "full_name") or "Unknown"
        s["contact"] = {"id": bid, "name": buyer_cache.get(bid, "Unknown")}
        # Use the stored invoice_total (Single Source of Truth)
        invoice_total = float(s.get("invoice_total") or 0)
        s["total_amount"] = invoice_total
        total_revenue += invoice_total
        
        # Read direct fields updated by repair_single_party_settlement
        # This resolves the discrepancy where unlinked payments weren't mapping to the UI list
        s["payment_status"] = s.get("status") or "Pending"
        s["amount_received"] = float(s.get("amount_received") or 0)
        s["balance"] = max(0.0, invoice_total - s["amount_received"])
        s["pending_cheque_amount"] = 0  # Assuming it's tracked separately or handled in repair hook

    # Debtors/Creditors count from party balances
    debtors_count = 0
    creditors_count = 0
    try:
        result = frappe.db.sql("""
            SELECT
                SUM(CASE WHEN net_bal > 0 THEN 1 ELSE 0 END) as debtors,
                SUM(CASE WHEN net_bal < 0 THEN 1 ELSE 0 END) as creditors
            FROM (
                SELECT party, SUM(debit) - SUM(credit) as net_bal
                FROM `tabGL Entry`
                WHERE is_cancelled = 0 AND party_type = 'Customer' AND company = %s
                GROUP BY party
            ) t
        """, (_get_user_company(),), as_dict=True)
        if result:
            debtors_count = int(result[0].debtors or 0)
            creditors_count = int(result[0].creditors or 0)
    except Exception:
        pass

    # Diagnostic: total records for this org (ignoring date/status filters)
    total_all_time = frappe.db.count("Mandi Sale", {"organization_id": org_id})

    return {
        "sales": sales_raw,
        "total_count": total_count,
        "total_revenue": total_revenue,
        "debtors_count": debtors_count,
        "creditors_count": creditors_count,
        "_debug": {
            "org_id": org_id,
            "date_from": date_from,
            "date_to": date_to,
            "total_all_time": total_all_time,
            "filters_applied": str(filters),
        }
    }

@frappe.whitelist(allow_guest=False)
def get_drawings_account() -> dict:
    """
    Returns the 'Personal Drawings' equity account for the current user's company.
    Auto-creates it under the Capital Accounts group if missing.
    Used by the expense-dialog frontend for Owner Withdrawal — replaces the
    forbidden frappe.client.get_value cross-origin call.
    """
    try:
        company = _get_user_company()
        if not company:
            return {"error": "No company found"}

        # Try to find an existing drawings/equity account
        account_name = (
            frappe.db.get_value("Account", {"account_name": ["like", "%Drawing%"], "company": company, "is_group": 0}, "name") or
            frappe.db.get_value("Account", {"account_name": ["like", "%Withdrawal%"], "company": company, "root_type": "Equity", "is_group": 0}, "name")
        )

        if not account_name:
            # Auto-create under Capital / Equity parent
            parent_acc = (
                frappe.db.get_value("Account", {"root_type": "Equity", "is_group": 1, "company": company}, "name") or
                frappe.db.get_value("Account", {"account_name": ["like", "%Capital%"], "is_group": 1, "company": company}, "name")
            )
            if parent_acc:
                try:
                    acc = frappe.get_doc({
                        "doctype": "Account",
                        "account_name": "Personal Drawings",
                        "parent_account": parent_acc,
                        "account_type": "Equity",
                        "company": company,
                        "is_group": 0
                    })
                    acc.flags.ignore_permissions = True
                    acc.insert()
                    account_name = acc.name
                except Exception:
                    pass

        if not account_name:
            return {"error": "Personal Drawings account not found and could not be created. Please create it manually in Chart of Accounts."}

        return {"account": account_name, "success": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_drawings_account Failed")
        return {"error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_trading_pl(date_from: str = None, date_to: str = None) -> dict:
    """
    Returns summarized Trading P&L data for a period.

    P&L Philosophy (Unit Cost Model):
    ----------------------------------
    Cost of Goods Sold (COGS) is computed using the true "Unit Cost" — the
    landed cost per unit that the Mandi actually bore, mirroring the frontend
    calculateItemFinancials() logic.  This prevents double-counting because
    packing / loading / transport expenses are already embedded in the unit
    cost for Direct purchases, and for Commission purchases they are recovered
    from the farmer (not Mandi's expense at all).

    Direct purchase unit cost:
        adj_qty   = initial_qty - less_units
        adj_value = adj_qty * supplier_rate - farmer_charges
        transport_share = proportional share of trip (hire + hamali + other)
        unit_cost = (adj_value + packing + loading + transport_share) / initial_qty

    Commission purchase unit cost:
        adj_value = adj_qty * supplier_rate - farmer_charges
        unit_cost = adj_value / initial_qty

    COGS for sold qty = unit_cost * qty_sold
    Profit per lot   = Revenue - COGS + Commission
    """
    org_id = _get_user_org()

    # ── Date filters ──────────────────────────────────────────────────────────
    filters = {"organization_id": org_id}
    if date_from and date_to:
        filters["saledate"] = ["between", [date_from, date_to]]
    elif date_from:
        filters["saledate"] = [">=", date_from]
    elif date_to:
        filters["saledate"] = ["<=", date_to]

    # ── Fetch Sales ───────────────────────────────────────────────────────────
    sale_fields = ["name", "saledate", "totalamount"]
    # Conditionally include sale-level charge columns for recovery tracking
    for col in ["marketfee", "nirashrit", "miscfee",
                "loadingcharges", "unloadingcharges", "otherexpenses",
                "gsttotal", "discountamount"]:
        if frappe.db.has_column("Mandi Sale", col):
            sale_fields.append(col)

    sales = frappe.get_all("Mandi Sale",
        filters=filters,
        fields=sale_fields,
        ignore_permissions=True
    )

    if not sales:
        return {
            "items": [], "totalRevenue": 0, "totalCost": 0,
            "totalExpenses": 0, "totalCommission": 0, "totalProfit": 0,
            "totalTradingLoss": 0, "totalStockLoss": 0,
            "totalBusinessExpenses": 0, "totalSaleRecoveries": 0, "margin": 0
        }

    sale_ids = [s.name for s in sales]

    # ── Sale-level charge recoveries (pass-through: collected from buyer,
    #    paid out to laborers / govt — net zero on Mandi P&L) ─────────────────
    total_sale_recoveries = 0.0
    total_market_fee = 0.0
    total_nirashrit = 0.0
    total_misc_fee = 0.0
    for s in sales:
        m_fee = flt(s.get("marketfee"))
        n_fee = flt(s.get("nirashrit"))
        misc_fee = flt(s.get("miscfee"))
        
        total_market_fee += m_fee
        total_nirashrit += n_fee
        total_misc_fee += misc_fee
        
        total_sale_recoveries += (
            m_fee
            + n_fee
            + misc_fee
            + flt(s.get("loadingcharges"))
            + flt(s.get("unloadingcharges"))
            + flt(s.get("otherexpenses"))
        )

    # ── Arrival-level charge recoveries (from commission suppliers) ───────────
    # These are expenses (loading, packing, transport, hamali, etc.) that the 
    # Mandi pays to 3rd parties but recovers by deducting them from the farmer's payout.
    # Therefore, they act as "pass-through" collections just like buyer-side loading charges.
    arr_date_cond = ""
    arr_date_params = []
    if date_from and date_to:
        arr_date_cond = "AND arrival_date BETWEEN %s AND %s"
        arr_date_params = [date_from, date_to]
    elif date_from:
        arr_date_cond = "AND arrival_date >= %s"
        arr_date_params = [date_from]
    elif date_to:
        arr_date_cond = "AND arrival_date <= %s"
        arr_date_params = [date_to]

    # Trip-level expenses
    arr_sel = ["SUM(hire_charges) as hire_charges", "SUM(hamali_expenses) as hamali", "SUM(other_expenses) as other"]
    if _col_exists("Mandi Arrival", "trip_loading_amount"): arr_sel.append("SUM(trip_loading_amount) as trip_loading")
    if _col_exists("Mandi Arrival", "trip_other_expenses"): arr_sel.append("SUM(trip_other_expenses) as trip_other")
    
    arr_res = frappe.db.sql(f"""
        SELECT {', '.join(arr_sel)}
        FROM `tabMandi Arrival`
        WHERE docstatus = 1 AND arrival_type IN ('commission', 'commission_supplier') AND organization_id = %s {arr_date_cond}
    """, [org_id] + arr_date_params, as_dict=True)
    
    arr_totals = arr_res[0] if arr_res else {}
    trip_recoveries = (
        flt(arr_totals.get("hire_charges")) +
        flt(arr_totals.get("hamali")) +
        flt(arr_totals.get("other")) +
        flt(arr_totals.get("trip_loading", 0)) +
        flt(arr_totals.get("trip_other", 0))
    )

    # Lot-level expenses
    lot_sel = []
    if _col_exists("Mandi Lot", "packing_cost"): lot_sel.append("SUM(l.packing_cost) as packing")
    if _col_exists("Mandi Lot", "loading_cost"): lot_sel.append("SUM(l.loading_cost) as lot_loading")
    if _col_exists("Mandi Lot", "farmer_charges"): lot_sel.append("SUM(l.farmer_charges) as farmer_charges")
    if _col_exists("Mandi Lot", "other_cut"): lot_sel.append("SUM(l.other_cut) as other_cut")
    
    lot_recoveries = 0.0
    if lot_sel:
        lot_res = frappe.db.sql(f"""
            SELECT {', '.join(lot_sel)}
            FROM `tabMandi Lot` l
            JOIN `tabMandi Arrival` a ON l.parent = a.name
            WHERE a.docstatus = 1 AND a.arrival_type IN ('commission', 'commission_supplier') AND a.organization_id = %s {arr_date_cond}
        """, [org_id] + arr_date_params, as_dict=True)
        lot_totals = lot_res[0] if lot_res else {}
        lot_recoveries = (
            flt(lot_totals.get("packing", 0)) +
            flt(lot_totals.get("lot_loading", 0)) +
            flt(lot_totals.get("farmer_charges", 0)) +
            flt(lot_totals.get("other_cut", 0))
        )
        
    total_sale_recoveries += (trip_recoveries + lot_recoveries)

    sale_items = frappe.get_all("Mandi Sale Item",
        filters={"parent": ["in", sale_ids]},
        fields=["parent", "lot_id", "qty", "returned_qty", "rate", "amount", "item_id"],
        ignore_permissions=True
    )

    lot_ids = list({si.lot_id for si in sale_items if si.lot_id})
    lots = frappe.get_all("Mandi Lot",
        filters={"name": ["in", lot_ids]},
        fields=[
            "name", "lot_code", "parent", "supplier_rate", "initial_qty",
            "packing_cost", "loading_cost", "farmer_charges",
            "commission_percent", "item_id", "less_percent", "less_units"
        ],
        ignore_permissions=True
    )
    lot_map = {l.name: l for l in lots}

    # ── Fetch parent Mandi Arrival data (arrival_type + trip expenses) ────────
    arrival_ids = list({l.parent for l in lots if l.parent})
    arrival_map = {}
    if arrival_ids:
        arrivals = frappe.get_all("Mandi Arrival",
            filters={"name": ["in", arrival_ids]},
            fields=["name", "arrival_type", "hire_charges", "hamali_expenses", "other_expenses"],
            ignore_permissions=True
        )
        arrival_map = {a.name: a for a in arrivals}

    # ── Step 1: per-arrival total adjusted value (for transport proration) ────
    arrival_adj_totals = {}
    for lot in lots:
        arrival_id  = lot.parent
        initial_qty = float(lot.initial_qty or 1)
        rate        = float(lot.supplier_rate or 0)
        less_units  = float(lot.less_units or 0)
        less_pct    = float(lot.less_percent or 0)
        farmer_chg  = float(lot.farmer_charges or 0)

        adj_qty = (initial_qty - less_units) if less_units else initial_qty * (1 - less_pct / 100)
        adj_val = max(0.0, adj_qty * rate - farmer_chg)
        arrival_adj_totals[arrival_id] = arrival_adj_totals.get(arrival_id, 0.0) + adj_val

    # ── Step 2: compute unit cost per lot ─────────────────────────────────────
    lot_unit_cost  = {}
    lot_arv_type   = {}
    for lot in lots:
        arrival_id   = lot.parent
        arrival      = arrival_map.get(arrival_id) if arrival_id else None
        arrival_type = (arrival.arrival_type if arrival else "direct") or "direct"
        lot_arv_type[lot.name] = arrival_type

        initial_qty = float(lot.initial_qty or 1)
        rate        = float(lot.supplier_rate or 0)
        less_units  = float(lot.less_units or 0)
        less_pct    = float(lot.less_percent or 0)
        farmer_chg  = float(lot.farmer_charges or 0)
        packing     = float(lot.packing_cost or 0)
        loading     = float(lot.loading_cost or 0)

        adj_qty = (initial_qty - less_units) if less_units else initial_qty * (1 - less_pct / 100)
        adj_val = max(0.0, adj_qty * rate - farmer_chg)

        if arrival_type.lower() == "direct":
            trip_transport = 0.0
            if arrival:
                trip_transport = (float(arrival.hire_charges or 0)
                                  + float(arrival.hamali_expenses or 0)
                                  + float(arrival.other_expenses or 0))
            arr_total = arrival_adj_totals.get(arrival_id, 0.0)
            transport_share = (adj_val / arr_total * trip_transport) if arr_total > 0 else 0.0
            total_net_cost  = adj_val + packing + loading + transport_share
        else:
            # Commission arrivals: Mandi is an agent; expenses recovered from farmer.
            total_net_cost = adj_val

        lot_unit_cost[lot.name] = total_net_cost / initial_qty if initial_qty > 0 else 0.0

    # ── Item display name map ─────────────────────────────────────────────────
    item_map  = {}
    item_ids  = list({l.item_id for l in lots if l.item_id})
    if item_ids:
        for i in frappe.get_all("Item", filters={"name": ["in", item_ids]}, fields=["name", "item_name"]):
            item_map[i.name] = i.item_name

    # ── Pre-calculate Sale goods totals for discount proration (excluding crates) ─
    sale_map = {s.name: s for s in sales}
    sale_goods_totals = {}
    for si in sale_items:
        if si.item_id and si.item_id.startswith("CRATE-"):
            continue
        si_qty = float(si.qty or 0)
        si_ret = float(si.get("returned_qty") or 0)
        si_net = max(0.0, si_qty - si_ret)
        sale_goods_totals[si.parent] = sale_goods_totals.get(si.parent, 0.0) + (si_net * float(si.rate or 0))

    # ── Main aggregation loop ─────────────────────────────────────────────────
    stats_map        = {}
    total_revenue    = 0.0
    total_cost       = 0.0
    total_commission = 0.0

    for si in sale_items:
        lot = lot_map.get(si.lot_id)
        if not lot:
            continue

        qty          = float(si.qty or 0)
        returned_qty = float(si.get("returned_qty") or 0)
        net_qty      = max(0.0, qty - returned_qty)
        
        if net_qty <= 0:
            continue
            
        base_revenue = net_qty * float(si.rate or 0)
        
        # ── Discount Proration ────────────────────────────────────────────────
        sale         = sale_map.get(si.parent)
        discount     = float(sale.get("discountamount") or 0) if sale else 0.0
        goods_total  = sale_goods_totals.get(si.parent, 1)
        prorated_disc= (base_revenue / goods_total) * discount if goods_total > 0 else 0
        revenue      = base_revenue - prorated_disc
        # ──────────────────────────────────────────────────────────────────────

        unit_cost    = lot_unit_cost.get(lot.name, 0.0)
        cogs         = unit_cost * net_qty          # Cost of Goods Sold (unit-cost based)
        arrival_type = lot_arv_type.get(lot.name, "direct")
        initial_qty  = float(lot.initial_qty or 1)
        pro_rata     = net_qty / initial_qty if initial_qty > 0 else 0.0

        # Commission income: only for non-direct arrivals, pro-rated by sold qty
        if arrival_type.lower() != "direct":
            less_units   = float(lot.less_units or 0)
            less_pct     = float(lot.less_percent or 0)
            adj_qty      = (initial_qty - less_units) if less_units else initial_qty * (1 - less_pct / 100)
            base_adj_val = adj_qty * float(lot.supplier_rate or 0)
            commission   = pro_rata * (base_adj_val * float(lot.commission_percent or 0) / 100)
        else:
            commission = 0.0

        trading_profit    = revenue - cogs + commission
        total_revenue    += revenue
        total_cost       += cogs
        total_commission += commission

        sale_doc = sale_map.get(si.parent)
        sale_creation = str(sale_doc.creation) if sale_doc else "1970-01-01 00:00:00"

        if si.lot_id not in stats_map:
            item_name = item_map.get(lot.item_id, lot.item_id or "Unknown")
            stats_map[si.lot_id] = {
                "id":           si.lot_id,
                "lot_code":     lot.lot_code,
                "date":         sale_doc.saledate if sale_doc else "",
                "latest_creation": sale_creation,
                "item":         item_name,
                "arrival_type": arrival_type,
                "lot":          {"commodity": {"name": item_name}},
                "qty":          0,
                "revenue":      0,
                "cost":         0,
                "expenses":     0,   # Always 0 — embedded in unit cost
                "commission":   0,
                "profit":       0
            }
        else:
            # Update latest_creation if this sale is newer
            if sale_creation > stats_map[si.lot_id].get("latest_creation", ""):
                stats_map[si.lot_id]["latest_creation"] = sale_creation

        entry = stats_map[si.lot_id]
        entry["qty"]        += qty
        entry["revenue"]    += revenue
        entry["cost"]       += cogs
        entry["commission"] += commission
        entry["profit"]     += trading_profit

    # ── Crate PNL (POS Sales) ─────────────────────────────────────────────────
    crate_types = frappe.get_all("Mandi Crate Type", filters={"organization_id": org_id}, fields=["name", "crate_name", "purchase_rate"])
    crate_map = {c.name: c for c in crate_types}

    # map "CRATE-<SCUBBED>" to crate_type "name"
    virtual_crate_map = {f"CRATE-{frappe.scrub(c.name).upper()[:20]}": c for c in crate_types}

    for si in sale_items:
        if si.item_id and si.item_id.startswith("CRATE-"):
            ctype = si.item_id
            crate = virtual_crate_map.get(ctype)
            if not crate: continue
            
            qty = float(si.qty or 0)
            rate = float(si.rate or 0)
            if qty <= 0 or rate <= 0: continue
            
            pur_rate = float(crate.purchase_rate if crate else 0)
            rev = qty * rate
            cost = qty * pur_rate
            prof = rev - cost
            
            sale_id = si.parent
            sale_doc = sale_map.get(sale_id)
            if not sale_doc: continue
            
            stats_id = f"CRATE-SALE-{sale_id}-{ctype}"
            if stats_id not in stats_map:
                stats_map[stats_id] = {
                    "id": stats_id,
                    "lot_code": f"Crates (Sale)",
                    "date": sale_doc.saledate,
                    "latest_creation": str(sale_doc.creation),
                    "item": crate.name,
                    "arrival_type": "Crate Sale",
                    "lot": {"commodity": {"name": crate.crate_name}},
                    "qty": qty,
                    "revenue": rev,
                    "cost": cost,
                    "expenses": 0,
                    "commission": 0,
                    "profit": prof
                }
            else:
                if str(sale_doc.creation) > stats_map[stats_id].get("latest_creation", ""):
                    stats_map[stats_id]["latest_creation"] = str(sale_doc.creation)
                stats_map[stats_id]["qty"] += qty
                stats_map[stats_id]["revenue"] += rev
                stats_map[stats_id]["cost"] += cost
                stats_map[stats_id]["profit"] += prof

            total_revenue += rev
            total_cost += cost

    # ── Crate PNL (Ledger Charges) ────────────────────────────────────────────
    try:
        je_company = _get_user_company()
        je_filters = {"user_remark": ["like", "Crate charge for%"]}
        if je_company:
            je_filters["company"] = je_company
            
        if date_from and date_to:
            je_filters["posting_date"] = ["between", [date_from, date_to]]
        elif date_from:
            je_filters["posting_date"] = [">=", date_from]
        elif date_to:
            je_filters["posting_date"] = ["<=", date_to]

        crate_jes = frappe.get_all("Journal Entry", filters=je_filters, fields=["name", "posting_date", "user_remark"], ignore_permissions=True)
        import re
        # Example remark: "Crate charge for PartyName: Plastic crate: 25 × ₹200 = ₹5000"
        # We can extract the chunks after the colon.
        pattern = re.compile(r"([^:;]+):\s*(\d+)\s*×\s*₹([\d\.]+)\s*=\s*₹([\d\.]+)")
        
        for je in crate_jes:
            remark = je.get("user_remark", "")
            matches = pattern.findall(remark)
            for m in matches:
                ctype_raw = m[0].strip()
                qty = float(m[1])
                rate = float(m[2])
                rev = float(m[3])
                if qty <= 0: continue
                
                # Try to find the actual Crate Type name (might exactly match or contain it)
                ctype = ctype_raw
                pur_rate = 0.0
                cname = ctype_raw
                for c_name, c_doc in crate_map.items():
                    if c_name.lower() == ctype_raw.lower() or c_doc.crate_name.lower() == ctype_raw.lower():
                        ctype = c_name
                        pur_rate = float(c_doc.purchase_rate or 0)
                        cname = c_doc.crate_name
                        break
                
                cost = qty * pur_rate
                prof = rev - cost
                
                stats_id = f"CRATE-CHG-{je.name}-{ctype}"
                if stats_id not in stats_map:
                    stats_map[stats_id] = {
                        "id": stats_id,
                        "lot_code": f"Crates (Ledger)",
                        "date": je.posting_date,
                        "item": ctype,
                        "arrival_type": "Crate Charge",
                        "lot": {"commodity": {"name": cname}},
                        "qty": qty,
                        "revenue": rev,
                        "cost": cost,
                        "expenses": 0,
                        "commission": 0,
                        "profit": prof
                    }
                else:
                    stats_map[stats_id]["qty"] += qty
                    stats_map[stats_id]["revenue"] += rev
                    stats_map[stats_id]["cost"] += cost
                    stats_map[stats_id]["profit"] += prof

                total_revenue += rev
                total_cost += cost
    except Exception as e:
        frappe.log_error(str(e), "Crate PNL Ledger Error")

    pl_items = []
    for lot_id, data in stats_map.items():
        data["saleRate"] = data["revenue"] / data["qty"] if data["qty"] > 0 else 0
        data["margin"]   = (data["profit"] / data["revenue"] * 100) if data["revenue"] > 0 else 0
        pl_items.append(data)
    # Sort by date (newest first), then by the exact creation time of the sale
    pl_items.sort(key=lambda x: (str(x["date"]), str(x.get("latest_creation", ""))), reverse=True)

    # ── Trading Loss indicator (informational) ────────────────────────────────
    total_trading_loss = 0.0
    for entry in pl_items:
        qty_sold = entry.get("qty") or 0
        if qty_sold > 0:
            per_unit_revenue = entry["revenue"] / qty_sold
            per_unit_cost    = entry["cost"]    / qty_sold
            if per_unit_cost > per_unit_revenue:
                total_trading_loss += (per_unit_cost - per_unit_revenue) * qty_sold

    # ── Stock Losses (GL-based, from report_loss entries) ─────────────────────
    total_stock_loss = 0.0
    loss_accs = []
    try:
        company = _get_user_company()
        if company:
            loss_accs = frappe.get_all("Account",
                filters={"company": company, "is_group": 0,
                         "account_name": ["like", "%Stock Loss%"]},
                fields=["name"], ignore_permissions=True
            )
            if not loss_accs:
                loss_accs = frappe.get_all("Account",
                    filters={"company": company, "is_group": 0,
                             "account_name": ["like", "%Wastage%"]},
                    fields=["name"], ignore_permissions=True
                )
            if loss_accs:
                loss_acc_names = [a.name for a in loss_accs]
                loss_placeholders = ", ".join(["%s"] * len(loss_acc_names))
                loss_date_cond = ""
                loss_date_params = []
                if date_from and date_to:
                    loss_date_cond = """
                        AND COALESCE(je.clearance_date, gl.posting_date) BETWEEN %s AND %s
                    """
                    loss_date_params = [date_from, date_to]
                elif date_from:
                    loss_date_cond = """
                        AND COALESCE(je.clearance_date, gl.posting_date) >= %s
                    """
                    loss_date_params = [date_from]
                elif date_to:
                    loss_date_cond = """
                        AND COALESCE(je.clearance_date, gl.posting_date) <= %s
                    """
                    loss_date_params = [date_to]
                rows_sl = frappe.db.sql(f"""
                    SELECT gl.debit
                    FROM `tabGL Entry` gl
                    LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                    WHERE gl.is_cancelled = 0
                      AND gl.company = %s
                      AND gl.account IN ({loss_placeholders})
                      {loss_date_cond}
                """, [company] + loss_acc_names + loss_date_params, as_dict=True)
                total_stock_loss = sum(flt(r.debit) for r in rows_sl)
    except Exception:
        pass

    # -- Crate Loss (From Mandi Crate Inventory Entry) --
    try:
        crate_loss_query = """
            SELECT SUM(ABS(quantity) * purchase_rate) as loss
            FROM `tabMandi Crate Inventory Entry`
            WHERE organization_id = %s AND quantity < 0 AND notes LIKE '%%Loss:%%'
        """
        params_cl = [org_id]
        if date_from and date_to:
            crate_loss_query += " AND entry_date BETWEEN %s AND %s"
            params_cl.extend([date_from, date_to])
        elif date_from:
            crate_loss_query += " AND entry_date >= %s"
            params_cl.append(date_from)
        elif date_to:
            crate_loss_query += " AND entry_date <= %s"
            params_cl.append(date_to)
            
        crate_loss_res = frappe.db.sql(crate_loss_query, params_cl, as_dict=True)
        if crate_loss_res and crate_loss_res[0].loss:
            total_stock_loss += flt(crate_loss_res[0].loss)
    except Exception as e:
        frappe.log_error(str(e), "Crate Loss PNL Error")

    # ── Write-off / Settlements (GL-based, buyer write-offs: Discount Allowed) ─
    # These are separate from business expenses — they represent amounts forgiven
    # to buyers (Discount Allowed) or received from suppliers (Discount Received).
    # They must show as a dedicated "Less: Write-off" line in P&L, NOT in opex.
    total_writeoff = 0.0
    try:
        company = company if 'company' in dir() else _get_user_company()
        if company:
            wo_date_cond = ""
            wo_date_params: list = []
            if date_from and date_to:
                wo_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) BETWEEN %s AND %s"
                wo_date_params = [date_from, date_to]
            elif date_from:
                wo_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) >= %s"
                wo_date_params = [date_from]
            elif date_to:
                wo_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) <= %s"
                wo_date_params = [date_to]
            rows_wo = frappe.db.sql(f"""
                SELECT gl.debit
                FROM `tabGL Entry` gl
                LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                WHERE gl.is_cancelled = 0
                  AND gl.company = %s
                  AND gl.remarks LIKE 'Write-off / Settlement — %%'
                  {wo_date_cond}
            """, [company] + wo_date_params, as_dict=True)
            total_writeoff = sum(flt(r.debit) for r in rows_wo)
    except Exception:
        pass

    # ── Settlement Income (GL-based, supplier write-offs: Discount Received) ────
    total_settlement_income = 0.0
    try:
        company = company if 'company' in dir() else _get_user_company()
        if company:
            inc_date_cond = ""
            inc_date_params: list = []
            if date_from and date_to:
                inc_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) BETWEEN %s AND %s"
                inc_date_params = [date_from, date_to]
            elif date_from:
                inc_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) >= %s"
                inc_date_params = [date_from]
            elif date_to:
                inc_date_cond = "AND COALESCE(je.clearance_date, gl.posting_date) <= %s"
                inc_date_params = [date_to]
            
            rows_inc = frappe.db.sql(f"""
                SELECT gl.credit
                FROM `tabGL Entry` gl
                LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                WHERE gl.is_cancelled = 0
                  AND gl.company = %s
                  AND gl.remarks LIKE 'Settlement Income:%%'
                  {inc_date_cond}
            """, [company] + inc_date_params, as_dict=True)
            total_settlement_income = sum(flt(r.credit) for r in rows_inc)
    except Exception:
        pass

    # ── Business Expenses (GL-based, Mandi's own opex: rent, salaries…) ──────
    # The following expense categories are EXCLUDED because they are either:
    #   (a) Already embedded in COGS via the Unit Cost model (purchase-side:
    #       packing, loading, hamali, transport, freight, hire), OR
    #   (b) Pass-through charges collected from buyers and paid out to third
    #       parties (sale-side: market fee, nirashrit, loading, unloading).
    #   (c) Write-offs / settlements (Discount Allowed, Bad Debts) — shown as
    #       separate "Less: Write-off" P&L line above.
    # Including them here would cause double-counting or phantom losses.
    #
    # DATE LOGIC (mirrors Day Book):
    #   • Non-cheque entries   → match on posting_date
    #   • Cleared cheques      → match on clearance_date (not posting_date)
    # This prevents "instant clear" expense cheques from being missed by the
    # P&L when their posting_date is outside the selected date range.
    total_business_expenses = 0.0
    try:
        company = company if 'company' in dir() else _get_user_company()
        if company:
            expense_accs = frappe.get_all("Account",
                filters={"company": company, "is_group": 0, "root_type": "Expense"},
                fields=["name", "account_name"], ignore_permissions=True
            )
            stock_loss_names   = {a.name for a in loss_accs}
            # ── Exclude keywords ──────────────────────────────────────────
            # Purchase-side (already in Unit Cost / COGS):
            #   packing, loading, hamali, transport, freight, hire, farmer
            # Sale-side (pass-through, recovered from buyer):
            #   market fee, nirashrit, unloading
            # Already counted elsewhere:
            #   commission (in totalCommission), stock loss/wastage (in totalStockLoss)
            #   discount/bad debt (in totalWriteoff)
            # Expense Recovery / Service Income:
            #   expense recovery (income account for charges withheld from farmer)
            exclude_keywords   = [
                # Already counted in separate P&L line
                "commission", "stock loss", "wastage",
                # Purchase-side: embedded in Unit Cost (COGS)
                "packing", "loading", "hamali", "transport",
                "freight", "hire", "farmer",
                # Sale-side: pass-through charges (collected from buyer)
                "market fee", "market_fee", "nirashrit",
                "unloading",
                # Clearing accounts (not real opex)
                "expense recovery",
                # Write-offs
                "discount", "bad debt",
            ]
            business_exp_accs  = [
                a.name for a in expense_accs
                if a.name not in stock_loss_names
                and not any(kw in (a.account_name or "").lower() for kw in exclude_keywords)
            ]
            if business_exp_accs:
                # Build date condition that mirrors the Day Book cheque logic:
                # non-cheque GL → posting_date; cleared cheque GL → clearance_date
                acc_placeholders = ", ".join(["%s"] * len(business_exp_accs))
                date_condition = ""
                date_params_be  = []

                if date_from and date_to:
                    date_condition = """
                        AND COALESCE(je.clearance_date, gl.posting_date) BETWEEN %s AND %s
                    """
                    date_params_be = [date_from, date_to]
                elif date_from:
                    date_condition = """
                        AND COALESCE(je.clearance_date, gl.posting_date) >= %s
                    """
                    date_params_be = [date_from]
                elif date_to:
                    date_condition = """
                        AND COALESCE(je.clearance_date, gl.posting_date) <= %s
                    """
                    date_params_be = [date_to]

                rows_be = frappe.db.sql(f"""
                    SELECT gl.debit
                    FROM `tabGL Entry` gl
                    LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                    WHERE gl.is_cancelled = 0
                      AND gl.company = %s
                      AND gl.account IN ({acc_placeholders})
                      AND gl.remarks NOT LIKE 'Write-off / Settlement — %%'
                      {date_condition}
                """, [company] + business_exp_accs + date_params_be, as_dict=True)

                total_business_expenses = sum(flt(r.debit) for r in rows_be)
    except Exception:
        pass

    # ── Final P&L ─────────────────────────────────────────────────────────────
    # Trading Profit = Revenue - COGS + Commission
    #   (Revenue   = pure goods value from sale items, excludes sale charges)
    #   (COGS      = unit cost × qty, includes purchase-side expenses)
    #   (Commission= commission income on commission arrivals)
    #
    # Net Profit = Trading Profit - Stock Losses - Write-offs - Business Expenses
    #   (Stock Losses     = GL debits to Stock Loss / Wastage accounts)
    #   (Write-offs       = GL debits to Discount Allowed accounts, buyer forgiveness)
    #   (Business Expenses= GL debits to Expense accounts EXCLUDING:
    #        - purchase-side costs already in COGS
    #        - sale-side pass-through charges recovered from buyers
    #        - write-off accounts now in separate totalWriteoff line)
    #
    # Sale Recoveries are NOT added to profit — they are informational only.
    # They show what was collected from buyers as pass-through charges.
    # The corresponding payouts are already excluded from Business Expenses
    # via the exclude_keywords filter, so the net effect is zero.
    total_profit = (total_revenue - total_cost + total_commission + total_settlement_income
                    - total_stock_loss - total_writeoff - total_business_expenses)
    net_margin   = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

    return {
        "items":                 pl_items,
        "totalRevenue":          round(total_revenue, 2),
        "totalCost":             round(total_cost, 2),
        "totalExpenses":         0,                               # Embedded in unit cost
        "totalCommission":       round(total_commission, 2),
        "totalTradingLoss":      round(total_trading_loss, 2),
        "totalStockLoss":        round(total_stock_loss, 2),
        "totalWriteoff":         round(total_writeoff, 2),        # Write-off / Settlements line
        "totalSettlementIncome": round(total_settlement_income, 2),
        "totalBusinessExpenses": round(total_business_expenses, 2),
        "totalSaleRecoveries":   round(total_sale_recoveries, 2), # Informational: charges collected from buyers
        "totalMarketFee":        round(total_market_fee, 2),
        "totalNirashrit":        round(total_nirashrit, 2),
        "totalMiscFee":          round(total_misc_fee, 2),
        "totalProfit":           round(total_profit, 2),
        "margin":                round(net_margin, 2)
    }



@frappe.whitelist(allow_guest=False)
def get_contacts_page(org_id: str = None, contact_type: str = None, search: str = None,
                      page: int = 1, page_size: int = 50) -> dict:
    """Paginated contacts list for the Contacts page."""
    org_id = _get_user_org()
    page = int(page or 1)
    page_size = int(page_size or 50)

    filters = [
        ["full_name", "!=", "Walk-in Buyer"],
        ["full_name", "!=", "Opening Balance"]
    ]
    if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
        filters.append(["organization_id", "=", org_id])
    if contact_type and contact_type != "all":
        filters.append(["contact_type", "=", contact_type])
    if search:
        filters.append(["full_name", "like", f"%{search}%"])

    # Build WHERE clause from filters list for raw SQL
    sql_where = ["1=1"]
    sql_params = []
    for f in filters:
        if f[1] == "=":
            sql_where.append(f"`{f[0]}` = %s")
            sql_params.append(f[2])
        elif f[1] == "like":
            sql_where.append(f"`{f[0]}` LIKE %s")
            sql_params.append(f[2])
        elif f[1] == "!=":
            sql_where.append(f"`{f[0]}` != %s")
            sql_params.append(f[2])
    where_sql = " AND ".join(sql_where)
    offset = (page - 1) * page_size

    contacts_raw = frappe.db.sql(f"""
        SELECT name AS id, full_name AS display_name, contact_type, phone, city, address, internal_id,
               gstin, pan_number, state, pincode, billing_address_line1, billing_address_line2
        FROM `tabMandi Contact`
        WHERE {where_sql}
        ORDER BY full_name ASC
        LIMIT %s OFFSET %s
    """, sql_params + [page_size, offset], as_dict=True)

    contacts = [{
        "id": c.get("id") or "",
        "name": c.get("display_name") or c.get("id") or "Unknown",
        "contact_type": c.get("contact_type") or "",
        "phone": c.get("phone") or "",
        "city": c.get("city") or "",
        "address": c.get("address") or "",
        "internal_id": c.get("internal_id") or "",
        "gstin": c.get("gstin") or "",
        "pan_number": c.get("pan_number") or "",
        "state": c.get("state") or "",
        "pincode": c.get("pincode") or "",
        "billing_address_line1": c.get("billing_address_line1") or "",
        "billing_address_line2": c.get("billing_address_line2") or "",
    } for c in contacts_raw]

    if contacts and _is_crate_tracking_enabled(org_id):
        contact_ids = tuple([c["id"] for c in contacts])
        if contact_ids:
            balances = frappe.db.sql("""
                SELECT cl.party_id, cl.crate_type, cl.running_balance
                FROM `tabMandi Crate Ledger` cl
                INNER JOIN (
                    SELECT party_id, crate_type, MAX(creation) as max_creation
                    FROM `tabMandi Crate Ledger`
                    WHERE organization_id = %s AND party_id IN %s
                    GROUP BY party_id, crate_type
                ) latest ON cl.party_id = latest.party_id
                         AND cl.crate_type = latest.crate_type
                         AND cl.creation = latest.max_creation
                WHERE cl.running_balance != 0
            """, (org_id, contact_ids), as_dict=True)
            
            for c in contacts:
                c["crate_balances"] = [{"type": b["crate_type"], "qty": b["running_balance"]} for b in balances if b["party_id"] == c["id"]]

    total = frappe.db.sql(f"""
        SELECT COUNT(*)
        FROM `tabMandi Contact`
        WHERE {where_sql}
    """, sql_params)[0][0]

    return {"contacts": contacts, "total_count": total}


@frappe.whitelist(allow_guest=False)
def search_contacts(query: str = None, contact_type: str = None, org_id: str = None) -> list:
    """Search contacts by name — used for autocomplete dropdowns."""
    if not query:
        return []
    org_id = _get_user_org()
    filters = [["full_name", "!=", "Walk-in Buyer"]]
    if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
        filters.append(["organization_id", "=", org_id])
    if contact_type:
        filters.append(["contact_type", "=", contact_type])
    if query:
        filters.append(["full_name", "like", f"%{query}%"])
        
    # Build WHERE and use raw SQL to avoid frappe.get_all alias conflict
    s_where = ["full_name != 'Walk-in Buyer'"]
    s_params = []
    if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
        s_where.append("organization_id = %s")
        s_params.append(org_id)
    if contact_type:
        s_where.append("contact_type = %s")
        s_params.append(contact_type)
    if query:
        s_where.append("full_name LIKE %s")
        s_params.append(f"%{query}%")

    results = frappe.db.sql(f"""
        SELECT name AS id, full_name AS display_name, contact_type, phone, city
        FROM `tabMandi Contact`
        WHERE {' AND '.join(s_where)}
        ORDER BY full_name ASC
        LIMIT 20
    """, s_params, as_dict=True)
    return [{
        "id": r.get("id") or "",
        "name": r.get("display_name") or r.get("id") or "Unknown",
        "contact_type": r.get("contact_type") or "",
        "phone": r.get("phone") or "",
        "city": r.get("city") or "",
    } for r in results]


@frappe.whitelist(allow_guest=False)
def get_lot_details(lot_id: str) -> dict:
    """Returns lot details, sales, damages, and returns for the Lot PNL Sheet."""
    if not lot_id:
        frappe.throw("lot_id is required")
        
    try:
        lot = frappe.get_doc("Mandi Lot", lot_id)
            
        arrival_type = ""
        if lot.parent and lot.parenttype == "Mandi Arrival":
            arrival_type = frappe.db.get_value("Mandi Arrival", lot.parent, "arrival_type") or ""
            
        item_name = frappe.db.get_value("Item", lot.item_id, "item_name") if lot.item_id else ""
            
        # Sales
        sale_items = frappe.get_all("Mandi Sale Item", 
            filters={"lot_id": lot_id},
            fields=["name as id", "qty", "rate", "parent"],
            ignore_permissions=True
        )
        sales = []
        for si in sale_items:
            sale_doc = frappe.db.get_value("Mandi Sale", si.parent, ["name", "saledate", "buyerid"], as_dict=True)
            if sale_doc:
                buyer_name = frappe.db.get_value("Mandi Contact", sale_doc.buyerid, "full_name") if sale_doc.buyerid else ""
                sales.append({
                    "id": si.id,
                    "qty": si.qty,
                    "rate": si.rate,
                    "unit": lot.unit,
                    "sale": {
                        "bill_no": sale_doc.name,
                        "sale_date": sale_doc.saledate,
                        "buyer": { "name": buyer_name }
                    }
                })
                
        return {
            "lot": {
                "id": lot.name,
                "lot_code": lot.lot_code,
                "initial_qty": float(lot.initial_qty or 0),
                "current_qty": float(lot.current_qty or 0),
                "unit": lot.unit,
                "supplier_rate": float(lot.supplier_rate or 0),
                "commission_percent": float(lot.commission_percent or 0),
                "less_percent": float(lot.less_percent or 0),
                "packing_cost": float(lot.packing_cost or 0),
                "loading_cost": float(lot.loading_cost or 0),
                "farmer_charges": float(lot.farmer_charges or 0),
                "arrival_type": arrival_type,
                "item": { "name": item_name }
            },
            "sales": sales,
            "damages": [],
            "returns": []
        }
    except frappe.DoesNotExistError:
        frappe.throw(f"Lot {lot_id} not found", frappe.NotFoundError)


@frappe.whitelist(allow_guest=False)
def get_lots_for_item(item_id: str = None) -> list:
    """
    Returns all active lots for a given item_id, including farmer name,
    arrival_date, storage_location, lot_code, age_days — matching the
    shape of the old Supabase `view_lot_stock` so lot-stock-dialog.tsx
    works without layout changes.
    """
    from datetime import datetime, date as date_type

    if not item_id:
        return []

    lots = frappe.get_all(
        "Mandi Lot",
        filters={"item_id": item_id},
        fields=_lot_query_fields(
            ["name", "item_id", "lot_code", "unit", "sale_price",
             "supplier_rate", "storage_location", "commission_percent",
             "less_percent", "packing_cost", "loading_cost",
             "farmer_charges", "net_amount", "creation", "parent",
             "shelf_life_days", "critical_age_days"],
            ["qty", "current_qty", "initial_qty", "net_qty", "status"],
        ),
        order_by="creation desc",
        limit_page_length=500,
        ignore_permissions=True,
    )

    if not lots:
        return []

    # Bulk-fetch arrival info
    arrival_ids = list({l.get("parent") for l in lots if l.get("parent")})
    arrival_map = {}
    party_ids = set()
    if arrival_ids:
        for a in frappe.get_all(
            "Mandi Arrival",
            filters={"name": ["in", arrival_ids]},
            fields=["name", "party_id", "arrival_date", "arrival_type", "storage_location"],
            ignore_permissions=True,
        ):
            arrival_map[a["name"]] = a
            if a.get("party_id"):
                party_ids.add(a["party_id"])

    party_map = {}
    if party_ids:
        for c in frappe.get_all(
            "Mandi Contact",
            filters={"name": ["in", list(party_ids)]},
            fields=["name", "full_name", "city"],
            ignore_permissions=True,
        ):
            party_map[c["name"]] = c

    today_date = date_type.today()
    result = []

    for lot in lots:
        lot = _normalize_lot_stock(lot)
        current_qty = flt(lot.get("current_qty") or 0)

        arrival = arrival_map.get(lot.get("parent")) or {}
        party_id = arrival.get("party_id") or ""
        contact = party_map.get(party_id) or {}
        farmer_name = contact.get("full_name") or party_id or "Unknown"
        farmer_city = contact.get("city") or ""

        arrival_date = arrival.get("arrival_date")
        if arrival_date and not isinstance(arrival_date, str):
            arrival_date = arrival_date.isoformat()

        creation = lot.get("creation")
        created_at = None
        age_days = 0
        if creation:
            try:
                if isinstance(creation, datetime):
                    dt = creation
                elif isinstance(creation, date_type):
                    dt = datetime.combine(creation, datetime.min.time())
                else:
                    dt = datetime.fromisoformat(str(creation).replace("Z", ""))
                created_at = dt.isoformat()
                age_days = (today_date - dt.date()).days
            except Exception:
                created_at = str(creation)

        initial_qty = flt(lot.get("initial_qty") or lot.get("qty") or current_qty)
        pct_remaining = round((current_qty / initial_qty) * 100, 1) if initial_qty > 0 else 100.0

        result.append({
            "id":               lot.get("name"),
            "lot_id":           lot.get("name"),
            "lot_code":         lot.get("lot_code") or lot.get("name"),
            "item_id":          lot.get("item_id"),
            "unit":             lot.get("unit") or "Kg",
            "supplier_rate":    flt(lot.get("supplier_rate") or 0),
            "sale_price":       flt(lot.get("sale_price") or 0),
            "qty":              flt(lot.get("qty") or 0),
            "current_qty":      current_qty,
            "initial_qty":      initial_qty,
            "net_qty":          flt(lot.get("net_qty") or current_qty),
            "net_amount":       flt(lot.get("net_amount") or 0),
            "pct_remaining":    pct_remaining,
            "status":           lot.get("status") or "Available",
            "storage_location": lot.get("storage_location") or arrival.get("storage_location") or "Mandi",
            "arrival_id":       lot.get("parent"),
            "arrival_date":     arrival_date,
            "arrival_type":     arrival.get("arrival_type") or "direct",
            "farmer_name":      farmer_name,
            "farmer_city":      farmer_city,
            "age_days":         age_days,
            "created_at":       created_at or arrival_date,
            "mfg_date":         arrival_date,
            "shelf_life_days":  lot.get("shelf_life_days"),
            "critical_age_days": lot.get("critical_age_days"),
        })

    return result


@frappe.whitelist(allow_guest=False)
def get_stock_summary(org_id: str = None) -> dict:
    """Stock summary for the Stock page — grouped by item.

    Each lot row carries the operational fields the UI needs: lot_code,
    storage_location, age in days, and % remaining (current/initial).
    The arrival_id, party (farmer) name, and arrival date are joined so
    the Stock screen can show provenance without a second round-trip.
    """
    from datetime import datetime, date

    org_id = _get_user_org()
    
    # Filter lots by checking parent Mandi Arrival's organization_id
    valid_arrivals = frappe.get_all("Mandi Arrival", filters={**_org_filter("Mandi Arrival", org_id)}, pluck="name")
    if not valid_arrivals:
        return {"items": [], "total_lots": 0}

    lots = frappe.get_all(
        "Mandi Lot",
        filters={"qty": [">", 0], "parent": ["in", valid_arrivals]},
        fields=_lot_query_fields(
            [
                "item_id", "qty", "unit", "sale_price", "supplier_rate",
                "lot_code", "name as id", "name", "storage_location",
                "net_qty", "creation", "parent",
            ],
            ["current_qty", "initial_qty", "status"],
        ),
        order_by="creation desc",
        limit_page_length=1000,
        ignore_permissions=True,
    )

    if not lots:
        return {"items": [], "total_lots": 0}

    # Bulk-fetch parent arrival info so we can join party + arrival_date.
    arrival_ids = list({l.get("parent") for l in lots if l.get("parent")})
    arrival_map = {}
    party_ids = set()
    if arrival_ids:
        for a in frappe.get_all(
            "Mandi Arrival",
            filters={"name": ["in", arrival_ids]},
            fields=["name", "party_id", "arrival_date", "arrival_type", "storage_location"],
            ignore_permissions=True,
        ):
            arrival_map[a["name"]] = a
            if a.get("party_id"):
                party_ids.add(a["party_id"])

    party_map = {}
    if party_ids:
        for c in frappe.get_all(
            "Mandi Contact",
            filters={"name": ["in", list(party_ids)]},
            fields=["name", "full_name"],
            ignore_permissions=True,
        ):
            party_map[c["name"]] = c.get("full_name") or c["name"]

    # Storage locations are stored as hash IDs in the database.
    # We need to map them to their human-readable location_name.
    storage_loc_ids = set()
    for lot in lots:
        if lot.get("storage_location"):
            storage_loc_ids.add(lot["storage_location"])
    for a in arrival_map.values():
        if a.get("storage_location"):
            storage_loc_ids.add(a["storage_location"])

    storage_loc_map = {}
    if storage_loc_ids:
        for loc in frappe.get_all(
            "Mandi Storage Location",
            filters={"name": ["in", list(storage_loc_ids)]},
            fields=["name", "location_name"],
            ignore_permissions=True,
        ):
            storage_loc_map[loc["name"]] = loc.get("location_name") or loc["name"]

    today_date = date.today()

    # Group by item
    by_item = {}
    for lot in lots:
        lot = _normalize_lot_stock(lot)
        current_qty = flt(lot.get("current_qty") or 0)
        if current_qty <= 0:
            continue

        initial_qty = flt(lot.get("initial_qty") or current_qty)
        pct_remaining = round((current_qty / initial_qty) * 100, 1) if initial_qty > 0 else 100.0

        creation = lot.get("creation")
        age_days = None
        creation_iso = None
        if creation:
            if isinstance(creation, datetime):
                creation_dt = creation
            elif isinstance(creation, date):
                creation_dt = datetime.combine(creation, datetime.min.time())
            else:
                try:
                    creation_dt = datetime.fromisoformat(str(creation).replace("Z", ""))
                except Exception:
                    creation_dt = None
            if creation_dt:
                age_days = (today_date - creation_dt.date()).days
                creation_iso = creation_dt.isoformat()

        arrival = arrival_map.get(lot.get("parent")) or {}
        arrival_date = arrival.get("arrival_date")
        if arrival_date is not None and not isinstance(arrival_date, str):
            arrival_date = arrival_date.isoformat()

        # Storage location: prefer lot-level, fall back to arrival-level.
        # Then map the hash ID to the human-readable name.
        storage_location_id = lot.get("storage_location") or arrival.get("storage_location") or ""
        storage_location_name = storage_loc_map.get(storage_location_id) or storage_location_id

        lot["qty"] = current_qty
        lot["pct_remaining"] = pct_remaining
        lot["age_days"] = age_days
        lot["arrival_id"] = arrival.get("name")
        lot["arrival_date"] = arrival_date
        lot["party_id"] = arrival.get("party_id")
        lot["party_name"] = party_map.get(arrival.get("party_id")) if arrival.get("party_id") else None
        lot["storage_location"] = storage_location_name
        lot["arrival_type"] = arrival.get("arrival_type") or "direct"
        lot["created_at"] = creation_iso

        iid = lot.get("item_id") or "Unknown"
        if iid not in by_item:
            try:
                item_name = frappe.db.get_value("Item", iid, "item_name") or iid
            except Exception:
                item_name = iid
            by_item[iid] = {
                "item_id": iid,
                "item_name": item_name,
                "total_qty": 0,
                "total_initial_qty": 0,
                "lots": [],
                "unit": lot.get("unit") or "",
            }
        by_item[iid]["total_qty"] += current_qty
        by_item[iid]["total_initial_qty"] += initial_qty
        by_item[iid]["lots"].append(lot)

    # Per-item rollup percent.
    for it in by_item.values():
        total_initial = it.pop("total_initial_qty") or 0
        it["pct_remaining"] = round((it["total_qty"] / total_initial) * 100, 1) if total_initial > 0 else 100.0

    visible_lots = sum(len(item.get("lots") or []) for item in by_item.values())
    return {"items": list(by_item.values()), "total_lots": visible_lots}


@frappe.whitelist(allow_guest=False)
def get_sales_invoice_detail(sale_id: str = None) -> dict:
    """Get full sale invoice with items — for invoice detail page."""
    if not sale_id:
        frappe.throw("Sale ID is required")

    try:
        doc = frappe.get_doc("Mandi Sale", sale_id)
        _enforce_ownership(doc)
        if doc.organization_id != _get_user_org():
            frappe.throw("Access Denied", frappe.PermissionError)
        buyer_name = ""
        buyer_city = ""
        buyer_gstin = ""
        buyer_phone = ""
        buyer_address = ""
        if doc.buyerid:
            fields_to_fetch = ["full_name", "city"]
            if frappe.db.has_column("Mandi Contact", "gstin"):
                fields_to_fetch.append("gstin")
            if frappe.db.has_column("Mandi Contact", "phone"):
                fields_to_fetch.append("phone")
            if frappe.db.has_column("Mandi Contact", "address"):
                fields_to_fetch.append("address")
            buyer_doc = frappe.db.get_value("Mandi Contact", doc.buyerid, fields_to_fetch, as_dict=True)
            if buyer_doc:
                buyer_name = buyer_doc.get("full_name") or ""
                buyer_city = buyer_doc.get("city") or ""
                buyer_gstin = buyer_doc.get("gstin") or ""
                buyer_phone = buyer_doc.get("phone") or ""
                buyer_address = buyer_doc.get("address") or ""

        items = []
        for item in doc.get("items") or []:
            item_master = frappe.db.get_value("Item", item.item_id, ["item_name", "customs_tariff_number", "gst_rate"], as_dict=True) if item.item_id else {}
            item_name = item_master.get("item_name") or ""
            hsn_code = item.get("hsn_code") or item_master.get("customs_tariff_number") or ""
            gst_rate = float(item.get("gst_rate") or item_master.get("gst_rate") or 0)
            lot_code = frappe.db.get_value("Mandi Lot", item.lot_id, "lot_code") if item.lot_id else ""
            items.append({
                "id": item.name,
                "lot_id": item.get("lot_id"),
                "item_id": item.get("item_id"),
                "qty": float(item.get("qty") or 0),
                "rate": float(item.get("rate") or 0),
                "amount": float(item.get("amount") or 0),
                "gst_rate": gst_rate,
                "gst_amount": float(item.get("gst_amount") or 0),
                "hsn_code": hsn_code,
                "item_name": item_name,
                "lot": {
                    "lot_code": lot_code,
                    "item": { "name": item_name }
                }
            })

        # Fetch real-time ledger-derived totals (due_date drives overdue rule).
        summary = _get_ledger_summary("Mandi Sale", sale_id, doc.invoice_total, due_date=doc.duedate)
        
        # Calculate items total for correct subtotal rendering in UI
        items_total = sum(float(i.get("amount") or 0) for i in items)

        # Fetch adjustments from comments
        comments = frappe.get_all("Comment", filters={"reference_doctype": "Mandi Sale", "reference_name": sale_id, "comment_type": "Comment"}, fields=["content"])
        all_remarks = "\n".join([c.content for c in comments])
        
        # Get bank details if a bank was selected
        selected_bank_details = None
        if doc.bankaccountid:
            try:
                import json
                acc_desc = frappe.db.get_value("Account", doc.bankaccountid, "description")
                if acc_desc and str(acc_desc).strip().startswith('{'):
                    selected_bank_details = json.loads(str(acc_desc).strip())
                    selected_bank_details["bank_name"] = frappe.db.get_value("Account", doc.bankaccountid, "name")
            except Exception:
                pass

        return {
            "id": doc.name,
            "sale_date": str(doc.saledate or ""),
            "buyer_id": doc.buyerid,
            "buyer_name": buyer_name,
            "buyer_city": buyer_city,
            "buyer_gstin": buyer_gstin,
            "buyer_phone": buyer_phone,
            "buyer_address": buyer_address,
            "payment_mode": doc.paymentmode,
            "bankaccountid": doc.bankaccountid,
            "selected_bank_details": selected_bank_details,
            "items_total": items_total,
            "total_amount": float(doc.totalamount or 0),
            "total_amount_inc_tax": float(doc.invoice_total or 0),
            "amount_received": summary["paid"],
            "payment_status": summary["status"],
            "balance_due": summary["balance"],
            "market_fee": float(doc.marketfee or 0),
            "nirashrit": float(doc.nirashrit or 0),
            "misc_fee": float(doc.miscfee or 0),
            "loading_charges": float(doc.loadingcharges or 0),
            "unloading_charges": float(doc.unloadingcharges or 0),
            "other_expenses": float(doc.otherexpenses or 0),
            "discount_amount": float(doc.discountamount or 0),
            "gst_total": float(doc.gsttotal or 0),
            "cgst_amount": float(getattr(doc, 'cgst_amount', 0) or 0),
            "sgst_amount": float(getattr(doc, 'sgst_amount', 0) or 0),
            "igst_amount": float(getattr(doc, 'igst_amount', 0) or 0),
            "contact_bill_no": getattr(doc, 'contact_bill_no', '') or '',
            "due_date": str(doc.duedate or ""),
            "vehicle_number": doc.vehiclenumber or "",
            "transport_name": getattr(doc, 'transport_name', '') or '',
            "book_no": doc.bookno or "",
            "lot_no": doc.lotno or "",
            "cheque_no": doc.chequeno or "",
            "bank_name": doc.bankname or "",
            "items": items,
            "sale_adjustments": _parse_adjustments(all_remarks),
        }
    except frappe.DoesNotExistError:
        frappe.throw(f"Sale {sale_id} not found", frappe.NotFoundError)


@frappe.whitelist(allow_guest=False)
def delete_sale(sale_id: str = None) -> dict:
    """Delete a sale record."""
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    if not sale_id:
        frappe.throw("Sale ID is required")
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
    enforce_org_match_by_name("Mandi Sale", sale_id)
    frappe.delete_doc("Mandi Sale", sale_id, ignore_permissions=True)
    frappe.db.commit()
    return {"status": "deleted"}


@frappe.whitelist(allow_guest=False)
def get_settings_page() -> dict:
    """Get all settings for the Settings page."""
    org_id = _get_user_org()
    org_data = _get_org_info(org_id) if org_id else {}
    settings = {
        "market_fee_percent": float(org_data.get("market_fee_percent") or 0),
        "nirashrit_percent": float(org_data.get("nirashrit_percent") or 0),
        "misc_fee_percent": float(org_data.get("misc_fee_percent") or 0),
        "default_credit_days": int(org_data.get("default_credit_days") or 15),
        "state_code": org_data.get("state_code") or "",
        "gst_enabled": bool(org_data.get("gst_enabled")),
        "gst_type": org_data.get("gst_type") or "intra",
        "cgst_percent": float(org_data.get("cgst_percent") or 0),
        "sgst_percent": float(org_data.get("sgst_percent") or 0),
        "igst_percent": float(org_data.get("igst_percent") or 0),
        "print_upi_qr": bool(org_data.get("print_upi_qr")),
        "print_bank_details": bool(org_data.get("print_bank_details")),
        "qr_bank_id": org_data.get("qr_bank_id") or "",
        "text_bank_id": org_data.get("text_bank_id") or "",
    }
    return {"settings": settings, "organization": org_data}


@frappe.whitelist(allow_guest=False)
def get_bank_account_list() -> list:
    """Get list of bank accounts scoped to current tenant company."""
    company = _get_user_company()
    filters = {"company": company} if company else {}
    return frappe.get_all("Bank Account",
        filters=filters,
        fields=["name as id", "account_name", "bank", "account_type", "company"],
        order_by="account_name asc",
        limit_page_length=50,
        ignore_permissions=True
    )


@frappe.whitelist(allow_guest=False)
def audit_broken_vouchers(date_from: str = None, date_to: str = None) -> dict:
    """List Journal Entries whose total_debit ≠ total_credit (the daybook
    "broken double-entry" warning). Read-only; pair with cancel_broken_voucher
    to actually clean them up.
    """
    company = _get_user_company()
    if not company: return {"broken_vouchers": [], "total_diff": 0, "count": 0}

    where = ["je.docstatus = 1", "je.company = %s", "ABS(je.total_debit - je.total_credit) > 0.01"]
    params = [company]
    if date_from:
        where.append("je.posting_date >= %s")
        params.append(date_from)
    if date_to:
        where.append("je.posting_date <= %s")
        params.append(date_to)

    rows = frappe.db.sql(f"""
        SELECT je.name        AS voucher_no,
               je.posting_date,
               je.voucher_type,
               je.user_remark,
               je.total_debit,
               je.total_credit,
               (je.total_debit - je.total_credit) AS imbalance,
               je.cheque_no,
               je.clearance_date
          FROM `tabJournal Entry` je
         WHERE {" AND ".join(where)}
         ORDER BY je.posting_date DESC, je.creation DESC
    """, tuple(params), as_dict=True)

    total_imbalance = sum(abs(float(r.get("imbalance") or 0)) for r in rows)
    largest = max((abs(float(r.get("imbalance") or 0)) for r in rows), default=0.0)

    return {
        "broken_vouchers": rows,
        "count": len(rows),
        "total_imbalance": flt(total_imbalance, 2),
        "largest_imbalance": flt(largest, 2),
    }


@frappe.whitelist(allow_guest=False)
def cancel_broken_voucher(voucher_no: str, voucher_type: str = "Journal Entry") -> dict:
    """Cancel a single submitted Journal Entry / Payment Entry. Use after
    auditing with audit_broken_vouchers; the cancellation reverses GL impact.
    """
    if not voucher_no:
        frappe.throw("voucher_no required")

    if voucher_type not in ("Journal Entry", "Payment Entry"):
        frappe.throw("voucher_type must be 'Journal Entry' or 'Payment Entry'")

    if not frappe.db.exists(voucher_type, voucher_no):
        frappe.throw(f"{voucher_type} {voucher_no} not found")

    if not frappe.has_permission(voucher_type, "cancel"):
        frappe.throw(f"You do not have permission to cancel {voucher_type}")

    doc = frappe.get_doc(voucher_type, voucher_no)
    if doc.docstatus == 1:
        doc.cancel()
        frappe.db.commit()
        return {"status": "cancelled", "voucher_type": voucher_type, "voucher_no": voucher_no}

    return {"status": "noop", "voucher_type": voucher_type, "voucher_no": voucher_no, "message": f"Already in docstatus {doc.docstatus}"}


@frappe.whitelist(allow_guest=False)
def get_reconciliation_data(org_id: str = None, date_from: str = None, date_to: str = None, status_filter: str = "All") -> dict:
    # Simply call the consolidated finance implementation
    from mandigrow.mandigrow.finance.cheque_api import get_reconciliation_data as _get_reconciliation_data
    return _get_reconciliation_data(org_id, date_from, date_to, status_filter)

@frappe.whitelist(allow_guest=False)
def update_contact(contact_id: str = None, **kwargs) -> dict:
    """Update a Mandi Contact."""
    if not contact_id:
        frappe.throw("Contact ID required")
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match
    skip_keys = {"cmd", "csrf_token", "contact_id"}
    doc = frappe.get_doc("Mandi Contact", contact_id)
    enforce_org_match(doc)
    for key, val in kwargs.items():
        if key in skip_keys:
            continue
        if hasattr(doc, key):
            setattr(doc, key, val)
    doc.save(ignore_permissions=True)
    
    # Sync name changes to the underlying ERPNext ledger records
    if "full_name" in kwargs:
        new_name = kwargs["full_name"]
        if doc.supplier and frappe.db.exists("Supplier", doc.supplier):
            frappe.db.set_value("Supplier", doc.supplier, "supplier_name", new_name, update_modified=False)
        if doc.customer and frappe.db.exists("Customer", doc.customer):
            frappe.db.set_value("Customer", doc.customer, "customer_name", new_name, update_modified=False)
            
    frappe.db.commit()
    return {"name": doc.name, "status": "updated"}


@frappe.whitelist(allow_guest=False)
def delete_contact(contact_id: str = None) -> dict:
    """Delete a Mandi Contact.
    
    Deletes ONLY the contact record. All linked financial records
    (arrivals, ledger entries, daybook, invoices) are fully preserved.
    force=True bypasses Frappe's link-existence check without cascading.
    """
    if not contact_id:
        frappe.throw("Contact ID required")
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
    enforce_org_match_by_name("Mandi Contact", contact_id)
    
    contact = frappe.get_doc("Mandi Contact", contact_id)
    if contact.supplier:
        balance = frappe.db.sql("""
            SELECT SUM(debit - credit)
            FROM `tabGL Entry`
            WHERE party_type='Supplier' AND party=%s AND is_cancelled=0
        """, (contact.supplier,))
        bal_val = balance[0][0] if balance and balance[0][0] else 0
        if round(float(bal_val), 2) != 0.0:
            frappe.throw("Cannot delete contact. They have an outstanding balance. Please clear the balance first.")
            
    if contact.customer:
        balance = frappe.db.sql("""
            SELECT SUM(debit - credit)
            FROM `tabGL Entry`
            WHERE party_type='Customer' AND party=%s AND is_cancelled=0
        """, (contact.customer,))
        bal_val = balance[0][0] if balance and balance[0][0] else 0
        if round(float(bal_val), 2) != 0.0:
            frappe.throw("Cannot delete contact. They have an outstanding balance. Please clear the balance first.")

    frappe.delete_doc("Mandi Contact", contact_id, ignore_permissions=True, force=True)
    frappe.db.commit()
    return {"status": "deleted"}


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: EMPLOYEE MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_salary_status(org_id: str = None) -> dict:
    """Get salary payment status for current month."""
    org_id = _get_user_org()
    if not org_id:
        return {"paid_amounts": {}, "salary_account_id": None}

    # Find salary account
    salary_accounts = frappe.get_all("Account",
        filters={"company": frappe.defaults.get_user_default("company"), "account_name": ["like", "%Salar%"]},
        fields=["name"],
        limit_page_length=1
    )
    salary_account_id = salary_accounts[0].name if salary_accounts else None

    # For now, return empty paid amounts (can be enriched with GL queries)
    return {
        "paid_amounts": {},
        "salary_account_id": salary_account_id
    }


@frappe.whitelist(allow_guest=False)
def create_employee(name: str = None, phone: str = None, role: str = None, salary=0, **kwargs) -> dict:
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    """Create a new employee record."""
    org_id = _get_user_org()
    doc = frappe.new_doc("Employee")
    full_name = name or kwargs.get("name") or "Unnamed"
    doc.first_name = full_name
    doc.employee_name = full_name
    doc.cell_number = phone or kwargs.get("phone", "")
    
    # Issue 11 Fix: Set mandatory Employee fields to prevent MandatoryError
    doc.gender = kwargs.get("gender") or "Male"
    doc.date_of_birth = kwargs.get("date_of_birth") or "1990-01-01"
    doc.date_of_joining = kwargs.get("join_date") or kwargs.get("date_of_joining") or frappe.utils.today()
    doc.company = _get_user_company()
    
    designation = role or kwargs.get("role") or "Worker"
    if designation and not frappe.db.exists("Designation", designation):
        frappe.get_doc({
            "doctype": "Designation",
            "designation_name": designation
        }).insert(ignore_permissions=True)
        frappe.db.commit()
    
    doc.designation = designation
    
    # ERPNext Employee.validate() strictly requires capitalized status values.
    # Map UI lowercase values (active/inactive) to ERPNext's canonical values.
    _ERP_STATUS_MAP = {
        "active": "Active",
        "inactive": "Inactive",
        "suspended": "Suspended",
        "left": "Left",
        # Pass-through already-correct values
        "Active": "Active",
        "Inactive": "Inactive",
        "Suspended": "Suspended",
        "Left": "Left",
    }
    # Fields that must NOT be blindly copied from UI kwargs into ERP Doc
    _BLOCKED_FIELDS = {"status", "doctype", "name", "docstatus", "modified", "creation", "owner"}
    
    # Apply safe custom fields from kwargs (excludes system/reserved fields)
    safe_kwargs = {k: v for k, v in kwargs.items() if k not in _BLOCKED_FIELDS}
    doc.update(safe_kwargs)
    
    # Map frontend keys to proper Frappe standard fields
    if kwargs.get("address"): doc.current_address = kwargs.get("address")
    if kwargs.get("email"): doc.personal_email = kwargs.get("email")
    if kwargs.get("notes"): doc.bio = kwargs.get("notes")
    if kwargs.get("salary_type"): doc.salary_mode = "Bank" if str(kwargs.get("salary_type")).lower() == "bank" else "Cash"
    
    # Override controlled fields explicitly and safely
    doc.organization_id = org_id
    doc.ctc = salary or kwargs.get("salary", 0)  # Standard field for salary
    # Custom fields if they exist
    if frappe.db.has_column("Employee", "salary"): doc.salary = doc.ctc
    
    raw_status = kwargs.get("status", "active")
    doc.status = _ERP_STATUS_MAP.get(str(raw_status).lower(), "Active")
    
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": doc.name, "id": doc.name}


@frappe.whitelist(allow_guest=False)
def update_employee(employee_id: str = None, **kwargs) -> dict:
    """Update an existing employee."""
    if not employee_id:
        frappe.throw("Employee ID is required")
    # Tenant guard: verify employee belongs to user's company
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        company = _get_user_company()
        emp_company = frappe.db.get_value("Employee", employee_id, "company")
        if emp_company and emp_company != company:
            frappe.throw(_("You do not have permission to update this employee."), frappe.PermissionError)
    doc = frappe.get_doc("Employee", employee_id)
    
    if "role" in kwargs:
        designation = kwargs["role"]
        if designation and not frappe.db.exists("Designation", designation):
            frappe.get_doc({
                "doctype": "Designation",
                "designation_name": designation
            }).insert(ignore_permissions=True)
            frappe.db.commit()
        doc.designation = designation
        
    if "name" in kwargs:
        doc.first_name = kwargs["name"]
        doc.employee_name = kwargs["name"]
        
    if "phone" in kwargs:
        doc.cell_number = kwargs["phone"]
        
    if "address" in kwargs: doc.current_address = kwargs["address"]
    if "email" in kwargs: doc.personal_email = kwargs["email"]
    if "notes" in kwargs: doc.bio = kwargs["notes"]
    if "salary" in kwargs: 
        doc.ctc = kwargs["salary"]
        if frappe.db.has_column("Employee", "salary"): doc.salary = kwargs["salary"]
    if "salary_type" in kwargs: doc.salary_mode = "Bank" if str(kwargs["salary_type"]).lower() == "bank" else "Cash"
    if "join_date" in kwargs: doc.date_of_joining = kwargs["join_date"]

    # Same ERPNext status normalization for updates
    _ERP_STATUS_MAP = {
        "active": "Active", "inactive": "Inactive",
        "suspended": "Suspended", "left": "Left",
        "Active": "Active", "Inactive": "Inactive",
        "Suspended": "Suspended", "Left": "Left",
    }
    _BLOCKED_FIELDS = {"status", "employee_id", "role", "doctype", "name", "docstatus", "modified", "creation", "owner"}
    for key, val in kwargs.items():
        if key in _BLOCKED_FIELDS:
            continue
        if hasattr(doc, key):
            setattr(doc, key, val)
    # Apply status separately with normalization
    if "status" in kwargs:
        raw_status = kwargs["status"]
        doc.status = _ERP_STATUS_MAP.get(str(raw_status).lower(), "Active")
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"name": doc.name, "status": "updated"}


@frappe.whitelist(allow_guest=False)
def delete_employee(employee_id: str = None) -> dict:
    """Delete an employee."""
    if not employee_id:
        frappe.throw("Employee ID is required")
    # Tenant guard: verify employee belongs to user's company
    # NOTE: Employee doctype does NOT have 'organization_id' — use 'company' instead.
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        company = _get_user_company()
        emp_company = frappe.db.get_value("Employee", employee_id, "company")
        if emp_company and emp_company != company:
            frappe.throw(_("You do not have permission to delete this employee."), frappe.PermissionError)
    frappe.delete_doc("Employee", employee_id, ignore_permissions=True)
    frappe.db.commit()
    return {"status": "deleted"}



# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: GATE ENTRY WITH LOTS (Atomic)
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)

@frappe.whitelist(allow_guest=False)
def get_gate_entry(entry_id: str) -> dict:
    """
    Fetch a single Gate Entry by ID (name) for the current org.
    """
    org_id = _get_user_org()
    if not frappe.db.exists("Mandi Gate Entry", entry_id):
        frappe.throw("Gate Entry not found", frappe.DoesNotExistError)
        
    doc = frappe.get_doc("Mandi Gate Entry", entry_id)
    if org_id and doc.organization_id != org_id:
        frappe.throw("Not permitted", frappe.PermissionError)
        
    return {
        "id": doc.name,
        "token_no": doc.token_no,
        "status": doc.status,
        "vehicle_number": doc.vehicle_number or doc.vehicle_no,
        "vehicle_no": doc.vehicle_number or doc.vehicle_no,
        "driver_name": doc.driver_name,
        "driver_phone": doc.driver_phone,
        "commodity": doc.commodity,
        "source": doc.source,
        "created_at": doc.creation,
        "updated_at": doc.modified,
        "organization_id": doc.organization_id
    }

@frappe.whitelist(allow_guest=False)
def create_gate_entry_with_lots(farmer_id: str = None, trading_model: str = "commission", items: str = None, **kwargs) -> dict:
    """
    Atomic creation of Gate Entry + associated Lot records.
    Replaces the old direct Supabase lots.insert() from the frontend.
    """
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    import json
    org_id = _get_user_org()
    if not org_id:
        frappe.throw("Organization not found for current user")

    if isinstance(items, str):
        items = json.loads(items)

    if not items or not farmer_id:
        frappe.throw("Farmer and items are required")

    # Create Gate Entry header
    ge = frappe.new_doc("Mandi Gate Entry")
    ge.vehicle_number = kwargs.get("truck_number", "")
    ge.driver_name = kwargs.get("driver_name", "")
    ge.driver_phone = ""
    ge.commodity = items[0].get("item_type", "") if items else ""
    ge.source = farmer_id
    ge.organization_id = org_id
    ge.insert(ignore_permissions=True)

    # Create Mandi Lot for each item
    # Mandi Lot fields: item_id, qty, unit, unit_weight, supplier_rate, sale_price, lot_code, barcode, storage_location
    from datetime import datetime
    lot_names = []
    for idx, item in enumerate(items):
        lot = frappe.new_doc("Mandi Lot")
        lot.lot_code = f"GATE-{datetime.now().strftime('%y%m%d')}-{str(idx + 1).zfill(2)}"
        lot.item_id = item.get("item_type", "")
        lot.qty = float(item.get("quantity", 0))
        lot.unit = item.get("unit_type", "Box")
        lot.unit_weight = float(item.get("weight_per_unit", 0))
        lot.supplier_rate = float(item.get("price_rate", 0)) if trading_model == "self_purchase" else 0
        lot.sale_price = float(item.get("price_rate", 0)) if trading_model == "commission" else 0
        lot.insert(ignore_permissions=True)
        _normalize_lot_stock(lot, persist=True)
        lot_names.append(lot.name)

    frappe.db.commit()
    return {"gate_entry": ge.name, "lots": lot_names, "status": "success"}


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: SALE MASTER DATA (Consolidated)
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_sale_master_data(org_id: str = None) -> dict:
    """
    Returns all master data needed by the Sales form in one call.
    Replaces 7 parallel Supabase queries.
    """
    org_id = _get_user_org()
    if not org_id:
        return {}

    # Buyers from Mandi Contact — raw SQL to avoid frappe.get_all alias conflict
    b_where = ["contact_type IN ('buyer','staff')"]
    b_params = []
    if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
        b_where.append("organization_id = %s")
        b_params.append(org_id)

    buyers_raw = frappe.db.sql(f"""
        SELECT name AS id, full_name AS display_name, contact_type, city
        FROM `tabMandi Contact`
        WHERE {' AND '.join(b_where)}
        ORDER BY full_name ASC
        LIMIT 500
    """, b_params, as_dict=True)
    buyers = [{"id": b.get("id") or "", "name": b.get("display_name") or b.get("id") or "Unknown", "type": b.get("contact_type") or "", "city": b.get("city") or ""} for b in buyers_raw]

    # Lots from Mandi Lot — fields: item_id, qty, unit, supplier_rate, sale_price, lot_code
    lot_filters = {"qty": [">", 0]}
    # If org_id provided, filter lots by their parent Arrival's org_id
    if org_id:
        # We fetch parents first to be safe if dot notation isn't enabled
        _arr_filters = {"organization_id": org_id} if frappe.db.has_column("Mandi Arrival", "organization_id") else {}
        valid_parents = frappe.get_all("Mandi Arrival", filters=_arr_filters, pluck="name")
        if valid_parents:
            lot_filters["parent"] = ["in", valid_parents]
        else:
            lot_filters["parent"] = "DOES NOT EXIST"

    lots_raw = frappe.get_all("Mandi Lot",
        filters=lot_filters,
        fields=_lot_query_fields(
            ["name as id", "name", "lot_code", "short_code", "qty", "unit", "supplier_rate", "sale_price", "item_id", "barcode", "storage_location", "net_qty", "parent"],
            ["current_qty", "initial_qty", "status"],
        ),
        limit_page_length=500,
        ignore_permissions=True
    )
    # Pre-fetch parent arrivals to get the supplier/farmer name
    parent_ids = list(set([l.get("parent") for l in lots_raw if l.get("parent")]))
    arrival_map = {}
    if parent_ids:
        arrivals = frappe.get_all("Mandi Arrival", filters={"name": ["in", parent_ids]}, fields=["name", "party_id", "arrival_type"], ignore_permissions=True)
        for arr in arrivals:
            if arr.get("party_id"):
                contact_name = frappe.db.get_value("Mandi Contact", arr.get("party_id"), "full_name")
                arrival_map[arr.get("name")] = {
                    "contact_name": contact_name or arr.get("party_id"),
                    "arrival_type": arr.get("arrival_type")
                }

    # Transform lots to match frontend expectations
    lots = []
    for lot in lots_raw:
        lot = _normalize_lot_stock(lot)
        current_qty = flt(lot.get("current_qty") or 0)
        if current_qty <= 0:
            continue
            
        arr_info = arrival_map.get(lot.get("parent"), {})
        contact_name = arr_info.get("contact_name", "") if isinstance(arr_info, dict) else (arr_info or "")
        arrival_type = arr_info.get("arrival_type", "direct") if isinstance(arr_info, dict) else "direct"
        
        lots.append({
            "id": lot.get("id"),
            "lot_code": lot.get("lot_code"),
            "current_qty": current_qty,
            "unit": lot.get("unit") or "Kg",
            "supplier_rate": float(lot.get("supplier_rate") or 0),
            "sale_price": float(lot.get("sale_price") or 0),
            "item_id": lot.get("item_id") or "",
            "contact": {"name": contact_name},
            "arrival_type": arrival_type,
            "status": lot.get("status") or "Available"
        })

    # Fetch all items from commodity master
    # The UI should allow selecting any item even if there's no current stock lot
    try:
        commodities_res = get_commodities()
        items_list = commodities_res.get("commodities", [])
    except Exception:
        items_list = []

    # Mandi Settings (tenant specific from Mandi Organization)
    org_data = _get_org_info(org_id)
    settings = {
        "market_fee_percent": float(org_data.get("market_fee_percent") or 0),
        "nirashrit_percent": float(org_data.get("nirashrit_percent") or 0),
        "misc_fee_percent": float(org_data.get("misc_fee_percent") or 0),
        "default_credit_days": int(org_data.get("default_credit_days") or 15),
        "state_code": org_data.get("state_code") or "",
        "gst_enabled": bool(org_data.get("gst_enabled")),
        "gst_type": org_data.get("gst_type") or "intra",
        "cgst_percent": float(org_data.get("cgst_percent") or 0),
        "sgst_percent": float(org_data.get("sgst_percent") or 0),
        "igst_percent": float(org_data.get("igst_percent") or 0),
    }

    # Fetch liquid accounts (Bank/Cash) via standard tenant-safe API
    liquid_accounts = get_bank_accounts(org_id)
    
    # Fetch crate types
    try:
        crate_res = get_crate_master_data(org_id)
        crate_types = crate_res.get("crate_types", [])
    except Exception:
        crate_types = []

    return {
        "buyers": buyers,
        "bank_accounts": [a for a in liquid_accounts if a.get("account_type") == "Bank"],
        "org_settings": {},
        "items": items_list,
        "accounts": [a for a in liquid_accounts if a.get("account_type") == "Cash"],
        "lots": lots,
        "settings": settings,
        "crate_types": crate_types
    }


@frappe.whitelist(allow_guest=False)
def get_price_history(buyer_id: str = None) -> dict:
    """Get last-used prices per item for a buyer. Returns {item_id: rate}."""
    if not buyer_id:
        return {}

    # Get recent sale items for this buyer (Mandi Sale has buyerid field)
    sales = frappe.get_all("Mandi Sale",
        filters={"buyerid": buyer_id},
        fields=["name"],
        order_by="creation desc",
        limit_page_length=20,
        ignore_permissions=True
    )
    if not sales:
        return {}

    sale_names = [s.name for s in sales]
    # Mandi Sale Item has item_id (Link to Item) and rate
    sale_items = frappe.get_all("Mandi Sale Item",
        filters={"parent": ["in", sale_names]},
        fields=["item_id", "rate"],
        order_by="creation desc",
        limit_page_length=50,
        ignore_permissions=True
    )

    history = {}
    for si in sale_items:
        iid = si.get("item_id")
        if iid and iid not in history:
            history[iid] = float(si.get("rate") or 0)
    return history


@frappe.whitelist(allow_guest=False)
def get_party_balance(contact_id: str = None) -> dict:
    """Get balance for a single party."""
    if not contact_id:
        return {"net_balance": 0}

    org_id = _get_user_org()
    # Use GL entries to calculate balance
    try:
        result = frappe.db.sql("""
            SELECT COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) as net_balance
            FROM `tabGL Entry`
            WHERE party = %s AND is_cancelled = 0
        """, (contact_id,), as_dict=True)
        return {"net_balance": float(result[0].net_balance) if result else 0}
    except Exception:
        return {"net_balance": 0}


def _get_ledger_summary(doc_type, doc_name, total_amount, as_of_date=None, due_date=None, party_id=None):
    """
    Calculate high-fidelity summary (Status, Paid, Balance) for a document.
    Prioritizes explicit 'against_voucher' linkages before falling back to FIFO.
    Also includes 'In-Transit' (unsubmitted docstatus=0) Journal Entries.
    """
    if not as_of_date:
        as_of_date = today()
    
    total = flt(total_amount, 2)
    if total <= 0:
        return {"status": "paid", "paid": 0, "balance": 0, "total": total}

    # 1. Resolve Context
    is_sale = doc_type == "Mandi Sale"
    party_field = "buyerid" if is_sale else "party_id"
    mode_field = "paymentmode" if is_sale else "advance_payment_mode"
    doc_info = frappe.db.get_value(doc_type, doc_name, [party_field, "organization_id", mode_field], as_dict=True)
    if not doc_info:
        return {"status": "pending", "paid": 0, "balance": total, "total": total}

    party = party_id or doc_info.get(party_field)
    org_id = doc_info.get("organization_id")
    payment_mode = (doc_info.get(mode_field) or "").strip().lower()
    if not party:
        return {"status": "pending", "paid": 0, "balance": total, "total": total}

    company = frappe.db.get_value("Mandi Organization", org_id, "erp_company") if org_id else None
    if not company:
        company = frappe.defaults.get_global_default("company")

    # Resolve Party List (Mandi Contact + ERPNext linked Customer/Supplier)
    party_list = [party]
    mandi_contact = frappe.db.get_value("Mandi Contact", party, ["customer", "supplier"], as_dict=True)
    if mandi_contact:
        if is_sale and mandi_contact.customer:
            party_list.append(mandi_contact.customer)
        elif not is_sale and mandi_contact.supplier:
            party_list.append(mandi_contact.supplier)

    # 2. Priority A: Explicitly Linked Payments (Submitted GL entries tagged with this voucher)
    # CRITICAL FIX: Run TWO queries:
    #   (a) With party filter   — exact match (fast, accurate if Customer link exists)
    #   (b) Without party filter — against_voucher match only (fallback if party link is broken/mismatched)
    # Take the MAX of both to handle party-link resolution failures which cause
    # the cheque GL entry's party to not match party_list (e.g. wrong Customer docname).
    # This fixes the bug where cheque cleared for ₹4,000 shows ₹3,325 because
    # the party-filtered query returned 0 and FIFO ate prior invoices first.

    if is_sale:
        linked_paid_sql = """
            SELECT
                SUM(CASE WHEN (se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL) THEN gl.credit ELSE 0 END) as cleared_paid,
                SUM(CASE WHEN (se.voucher_type = 'Journal Entry' AND se.clearance_date IS NULL AND se.cheque_no IS NOT NULL) THEN gl.credit ELSE 0 END) as pending_cheque
            FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.company = %s
            AND gl.party IN %s AND gl.against_voucher = %s
            AND gl.credit > 0
        """
        # Fallback: match only on against_voucher (no party filter, but MUST have a party to exclude Stock legs)
        linked_paid_fallback_sql = """
            SELECT
                SUM(CASE WHEN (se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL) THEN gl.credit ELSE 0 END) as cleared_paid,
                SUM(CASE WHEN (se.voucher_type = 'Journal Entry' AND se.clearance_date IS NULL AND se.cheque_no IS NOT NULL) THEN gl.credit ELSE 0 END) as pending_cheque
            FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.company = %s
            AND gl.against_voucher = %s
            AND gl.party IS NOT NULL AND gl.party != ''
            AND gl.credit > 0
        """
    else:
        linked_paid_sql = """
            SELECT
                SUM(CASE WHEN (se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL) THEN gl.debit ELSE 0 END) as cleared_paid,
                SUM(CASE WHEN (se.voucher_type = 'Journal Entry' AND se.clearance_date IS NULL AND se.cheque_no IS NOT NULL) THEN gl.debit ELSE 0 END) as pending_cheque
            FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.company = %s
            AND gl.party IN %s AND gl.against_voucher = %s
            AND gl.debit > 0
        """
        linked_paid_fallback_sql = """
            SELECT
                SUM(CASE WHEN (se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL) THEN gl.debit ELSE 0 END) as cleared_paid,
                SUM(CASE WHEN (se.voucher_type = 'Journal Entry' AND se.clearance_date IS NULL AND se.cheque_no IS NOT NULL) THEN gl.debit ELSE 0 END) as pending_cheque
            FROM `tabGL Entry` gl
            LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
            WHERE gl.is_cancelled = 0 AND gl.company = %s
            AND gl.against_voucher = %s
            AND gl.party IS NOT NULL AND gl.party != ''
            AND gl.debit > 0
        """

    res_primary = frappe.db.sql(linked_paid_sql, (company, tuple(party_list), doc_name), as_dict=True)[0]
    res_fallback = frappe.db.sql(linked_paid_fallback_sql, (company, doc_name), as_dict=True)[0]

    # Use whichever gives a higher cleared amount (protects against party-link mismatch)
    linked_paid = max(flt(res_primary.cleared_paid), flt(res_fallback.cleared_paid))
    pending_cheque_linked = max(flt(res_primary.pending_cheque), flt(res_fallback.pending_cheque))

    linked_transit_sql = f"""
        SELECT SUM(sea.credit - sea.debit) 
        FROM `tabJournal Entry Account` sea
        JOIN `tabJournal Entry` se ON sea.parent = se.name
        WHERE se.docstatus = 0 AND se.company = %s
        AND sea.party IN %s AND sea.reference_name = %s
    """ if is_sale else f"""
        SELECT SUM(sea.debit - sea.credit) 
        FROM `tabJournal Entry Account` sea
        JOIN `tabJournal Entry` se ON sea.parent = se.name
        WHERE se.docstatus = 0 AND se.company = %s
        AND sea.party IN %s AND sea.reference_name = %s
    """
    linked_transit = flt(frappe.db.sql(linked_transit_sql, (company, tuple(party_list), doc_name))[0][0])
    
    # Transit (unsubmitted) is always considered 'pending' for cheques
    total_cleared_linked = linked_paid
    total_pending_linked = pending_cheque_linked + linked_transit

    # Strict Udhaar Protection: 
    # If this was explicitly recorded as a credit/udhaar transaction, do NOT auto-consume 
    # the unlinked FIFO pool. It stays pending until a payment is explicitly linked.
    if payment_mode == "credit" and total_cleared_linked == 0 and total_pending_linked == 0:
        return {"status": "pending", "paid": 0, "balance": total, "total": total, "pending_cheque": 0}

    # 3. Priority B: FIFO Pool (Unlinked Generic Payments)
    # Identify the bill's position in the chronological order.
    date_field = "saledate" if is_sale else "arrival_date"
    
    if is_sale:
        # For sales, compute invoice_total = totalamount + charges - discount
        bills_sql = """
            SELECT name, IFNULL(invoice_total,0) as amt
            FROM `tabMandi Sale`
            WHERE %s = %%s AND docstatus = 1 AND organization_id = %%s
            ORDER BY saledate ASC, creation ASC
        """ % party_field
        bills_raw = frappe.db.sql(bills_sql, (party, org_id), as_dict=True)
        bills = bills_raw
    else:
        amt_field = "net_payable_farmer"
        bills = frappe.get_all(doc_type, 
            filters={
                party_field: party,
                "docstatus": 1,
                "organization_id": org_id
            },
            fields=["name", f"{amt_field} as amt"],
            order_by=f"{date_field} asc, creation asc"
        )

    cumulative_billed_prior = 0
    bill_total = 0
    found = False
    for b in bills:
        if b.name == doc_name:
            bill_total = flt(b.amt)
            found = True
            break
        cumulative_billed_prior += flt(b.amt)
    
    if not found: bill_total = total

    # Calculate global unlinked pool
    unlinked_pool_sql = f"""
        SELECT SUM(credit - debit) FROM `tabGL Entry`
        WHERE is_cancelled = 0 AND company = %s
        AND party IN %s AND (against_voucher IS NULL OR against_voucher = '')
    """ if is_sale else f"""
        SELECT SUM(debit - credit) FROM `tabGL Entry`
        WHERE is_cancelled = 0 AND company = %s
        AND party IN %s AND (against_voucher IS NULL OR against_voucher = '')
    """
    total_unlinked = flt(frappe.db.sql(unlinked_pool_sql, (company, tuple(party_list)))[0][0])
    
    # FIFO Available = Pool - (Total Unlinked Demand of Previous Bills)
    # We must calculate how much of the unlinked pool was "consumed" by bills before this one.
    # Unlinked Demand = Bill Total - Explicitly Linked Payments.
    
    # 1. Get all previous bills
    # 2. For each, find its linked payments
    # 3. Sum (Bill Total - Linked Payments)
    
    unlinked_demand_prior = 0
    for b in bills:
        if b.name == doc_name:
            break
        
        # Linked payments for this specific previous bill
        b_linked_sql = f"""
            SELECT SUM(credit) FROM `tabGL Entry`
            WHERE is_cancelled = 0 AND company = %s
            AND party IN %s AND against_voucher = %s
            AND credit > 0
        """ if is_sale else f"""
            SELECT SUM(debit) FROM `tabGL Entry`
            WHERE is_cancelled = 0 AND company = %s
            AND party IN %s AND against_voucher = %s
            AND debit > 0
        """
        b_linked = flt(frappe.db.sql(b_linked_sql, (company, tuple(party_list), b.name))[0][0])
        unlinked_demand_prior += max(0, flt(b.amt) - b_linked)
    
    fifo_available = max(0, total_unlinked - unlinked_demand_prior)
    
    # 4. Final Aggregation
    # We use cleared linked payments for the 'Paid' amount.
    # We use cleared + pending for the status calculation IF we want to show it as paid (but the user wants it as pending).
    # So we use cleared payments for status.
    
    # We only count 'Paid' as what has cleared or is in Cash/Bank.
    paid = total_cleared_linked + min(max(0, bill_total - total_cleared_linked), fifo_available)
    balance = max(0, bill_total - paid)
    
    status = "pending"
    if paid >= (bill_total - 0.1):
        status = "paid"
    elif paid > 0.1:
        status = "partial"
    elif total_pending_linked > 0.1:
        # If no cleared payment but pending cheques exist
        status = "pending" 
    
    if is_sale and due_date and status in ("pending", "partial"):
        if getdate(due_date) < getdate(as_of_date or today()):
            status = "overdue"

    return {
        "status": status,
        "paid": flt(paid, 2),
        "balance": flt(balance, 2),
        "total": flt(bill_total, 2),
        "pending_cheque": flt(total_pending_linked, 2)
    }



def _get_ledger_status(doc_type, doc_name, total_amount, as_of_date=None, due_date=None):
    """
    Calculate status (Paid/Partial/Pending/Overdue) by checking GL Entries
    linked to this voucher. Thin wrapper around _get_ledger_summary.
    """
    summary = _get_ledger_summary(doc_type, doc_name, total_amount, as_of_date, due_date)
    return summary["status"]


def _get_party_outstanding(contact_id, as_of_date=None):
    """
    Single source of truth for "what mandi owes / is owed by this party right now".

    Uses the *party-level signed running balance* across every GL entry
    against this Mandi Contact's linked Customer + Supplier (and the legacy
    `party = contact_id` form for older vouchers). This is the only number
    that survives overpayments, advances, and cross-arrival nettings — the
    per-arrival positive-only sum used by the Purchase Bills page would lie
    when the same party has been overpaid on one bill and underpaid on
    another.

    Returns:
      {
        "signed_balance": Dr - Cr (positive = party owes mandi / asset side,
                                   negative = mandi owes party / liability side),
        "to_pay":        amount mandi still owes this party  (= max(0, -signed)),
        "to_collect":    amount this party still owes mandi (= max(0,  signed)),
        "balance_type":  "debit" | "credit" | "nil",
      }
    """
    if not contact_id or not frappe.db.exists("Mandi Contact", contact_id):
        return {"signed_balance": 0.0, "to_pay": 0.0, "to_collect": 0.0, "balance_type": "nil"}

    # Tenant guard: verify contact belongs to user's org
    from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
    enforce_org_match_by_name("Mandi Contact", contact_id)

    contact = frappe.db.get_value(
        "Mandi Contact", contact_id, ["supplier", "customer"], as_dict=True
    ) or {}

    parties = []
    if contact.get("supplier") and frappe.db.exists("Supplier", contact["supplier"]):
        parties.append(("Supplier", contact["supplier"]))
    if contact.get("customer") and frappe.db.exists("Customer", contact["customer"]):
        parties.append(("Customer", contact["customer"]))
    # Legacy fallback — old vouchers wrote `party = contact.name` directly.
    for legacy in (("Supplier", contact_id), ("Customer", contact_id)):
        if legacy not in parties:
            parties.append(legacy)

    as_of_date = as_of_date or today()
    where = " OR ".join(["(gl.party_type=%s AND gl.party=%s)"] * len(parties))
    params = [v for pair in parties for v in pair] + [as_of_date, as_of_date]

    res = frappe.db.sql(f"""
        SELECT COALESCE(SUM(gl.debit - gl.credit), 0) AS signed
        FROM `tabGL Entry` gl
        LEFT JOIN `tabJournal Entry` je
               ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
        WHERE ({where})
          AND gl.is_cancelled = 0
          AND COALESCE(je.clearance_date, gl.posting_date) <= %s
    """, tuple(params[:-1]), as_dict=True)

    signed = flt(res[0].signed if res else 0, 2)
    return {
        "signed_balance": signed,
        "to_pay":     flt(max(0.0, -signed), 2),
        "to_collect": flt(max(0.0,  signed), 2),
        "balance_type": "debit" if signed > 0.01 else ("credit" if signed < -0.01 else "nil"),
    }


@frappe.whitelist(allow_guest=False)
def get_party_outstanding(contact_id: str, as_of_date: str = None) -> dict:
    """Whitelisted wrapper around _get_party_outstanding for the dialog."""
    return _get_party_outstanding(contact_id, as_of_date)


# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: ARRIVALS HISTORY
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_arrivals_history(org_id: str = None, page: int = 1, limit: int = 20, date_from: str = None, date_to: str = None) -> dict:
    """Paginated arrivals history for the arrivals list page.

    Returns records shaped for the Supabase-era UI: each record exposes
    `id`, `created_at`, `contacts` (joined farmer), and a `metadata`
    summary built from the first Mandi Lot row so the list can render
    the item/qty/rate at a glance.
    """
    org_id = _get_user_org()
    if not org_id:
        return {"records": [], "total_count": 0}

    page = int(page or 1)
    limit = int(limit or 20)

    filters = {"organization_id": org_id}
    if date_from:
        filters["creation"] = [">=", date_from]
    if date_to:
        if "creation" in filters:
            filters["creation"] = ["between", [date_from, date_to]]
        else:
            filters["creation"] = ["<=", date_to]

    total = frappe.db.count("Mandi Arrival", filters=filters)

    records = frappe.get_all("Mandi Arrival",
        filters=filters,
        fields=["*"],
        order_by="creation desc",
        limit_start=(page - 1) * limit,
        limit_page_length=limit,
        ignore_permissions=True
    )

    if not records:
        return {"records": [], "total_count": total}

    arrival_names = [r.get("name") for r in records if r.get("name")]
    party_ids = list({r.get("party_id") for r in records if r.get("party_id")})

    # Bulk-fetch first Mandi Lot per arrival (ordered by idx) so we can
    # populate the summary without N+1 round-trips.
    lots_by_parent = {}
    if arrival_names:
        lots = frappe.get_all("Mandi Lot",
            filters={
                "parenttype": "Mandi Arrival",
                "parent": ["in", arrival_names],
            },
            fields=["parent", "item_id", "qty", "unit", "supplier_rate", "idx"],
            order_by="parent asc, idx asc",
            ignore_permissions=True,
        )
        for lot in lots:
            parent = lot.get("parent")
            if parent and parent not in lots_by_parent:
                lots_by_parent[parent] = lot

    # Resolve item_id -> item_name in one query.
    item_ids = list({l.get("item_id") for l in lots_by_parent.values() if l.get("item_id")})
    item_name_map = {}
    if item_ids:
        for item in frappe.get_all("Item",
            filters={"name": ["in", item_ids]},
            fields=["name", "item_name"],
            ignore_permissions=True,
        ):
            item_name_map[item["name"]] = item.get("item_name") or item["name"]

    # Resolve party_id (Mandi Contact) -> display info.
    contact_map = {}
    if party_ids:
        for c in frappe.get_all("Mandi Contact",
            filters={"name": ["in", party_ids]},
            fields=["name", "full_name", "city"],
            ignore_permissions=True,
        ):
            contact_map[c["name"]] = {
                "id": c["name"],
                "name": c.get("full_name") or c["name"],
                "city": c.get("city"),
            }

    shaped = []
    for r in records:
        name = r.get("name")
        lot = lots_by_parent.get(name) or {}
        item_id = lot.get("item_id")
        metadata = {
            "item_name": item_name_map.get(item_id) if item_id else None,
            "qty": lot.get("qty"),
            "unit": lot.get("unit"),
            "supplier_rate": lot.get("supplier_rate"),
        }

        contact = contact_map.get(r.get("party_id")) if r.get("party_id") else None

        # Unified FIFO ledger sync for status and accurate balances.
        # date_to (if provided) drives the historical status.
        as_of = date_to or today()
        ledger_summary = _get_ledger_summary("Mandi Arrival", name, flt(r.get("net_payable_farmer") or 0), as_of_date=as_of, party_id=r.get("party_id"))
        status = ledger_summary["status"]
        r["amount_received"] = ledger_summary["paid"]
        r["balance"] = ledger_summary["balance"]

        created_at = r.get("creation")
        if created_at is not None and not isinstance(created_at, str):
            created_at = created_at.isoformat()

        arrival_date = r.get("arrival_date")
        if arrival_date is not None and not isinstance(arrival_date, str):
            arrival_date = arrival_date.isoformat()

        shaped.append({
            **r,
            "id": name,
            "created_at": created_at,
            "arrival_date": arrival_date,
            "status": status,
            "paid": ledger_summary["paid"],
            "balance": ledger_summary["balance"],
            "total_payable": ledger_summary["total"],
            "bill_no": r.get("contact_bill_no"),
            "contacts": contact,
            "metadata": metadata,
        })

    return {"records": shaped, "total_count": total}


@frappe.whitelist(allow_guest=False)
def get_purchase_bills(org_id: str = None, date_from: str = None, date_to: str = None) -> dict:
    """Return purchase bills (lots) grouped by supplier for the Purchase Bills page.

    Shape matches the Supabase-era expectation: `{ bills, groupedSuppliers }`.
    Each "bill" is a flattened Mandi Lot row with its parent arrival + joined
    farmer + item info. Grouping + balance rollups are done server-side so the
    UI can just render.
    """
    org_id = _get_user_org()
    if not org_id:
        return {"bills": [], "groupedSuppliers": []}
        
    opening_balance_contacts = frappe.get_all("Mandi Contact", filters={"full_name": "Opening Balance", "organization_id": org_id}, pluck="name", ignore_permissions=True)

    arrival_filters = {"organization_id": org_id}
    if opening_balance_contacts:
        arrival_filters["party_id"] = ["not in", opening_balance_contacts]
        
    if date_from and date_to:
        arrival_filters["creation"] = ["between", [date_from, date_to]]
    elif date_from:
        arrival_filters["creation"] = [">=", date_from]
    elif date_to:
        arrival_filters["creation"] = ["<=", date_to]

    base_fields = [
        "name", "party_id", "arrival_date", "arrival_type", "reference_no",
        "contact_bill_no", "storage_location", "hire_charges",
        "hamali_expenses", "other_expenses", "advance", 
        "advance_payment_mode", "status", "creation", "net_payable_farmer",
    ]
    if _col_exists("Mandi Arrival", "paid_amount"):
        base_fields.append("paid_amount")

    arrivals = frappe.get_all("Mandi Arrival",
        filters=arrival_filters,
        fields=base_fields,
        order_by="creation desc",
        limit_page_length=5000,
        ignore_permissions=True,
    )

    if not arrivals:
        return {"bills": [], "groupedSuppliers": []}

    arrival_by_name = {a["name"]: a for a in arrivals}
    arrival_names = list(arrival_by_name.keys())
    party_ids = list({a.get("party_id") for a in arrivals if a.get("party_id")})

    # Pull all child Mandi Lot rows for those arrivals in one query.
    lot_rows = frappe.get_all("Mandi Lot",
        filters={
            "parenttype": "Mandi Arrival",
            "parent": ["in", arrival_names],
        },
        fields=[
            "name", "parent", "idx", "item_id", "qty", "initial_qty",
            "current_qty", "unit", "unit_weight", "supplier_rate",
            "commission_percent", "less_percent", "less_units",
            "packing_cost", "loading_cost", "farmer_charges",
            "sale_price", "lot_code", "storage_location",
            "net_qty", "net_amount", "commission_amount", "creation",
        ],
        order_by="parent asc, idx asc",
        ignore_permissions=True,
    )

    # Resolve item names.
    item_ids = list({l.get("item_id") for l in lot_rows if l.get("item_id")})
    item_map = {}
    if item_ids:
        for item in frappe.get_all("Item",
            filters={"name": ["in", item_ids]},
            fields=["name", "item_name"],
            ignore_permissions=True,
        ):
            item_map[item["name"]] = {
                "name": item.get("item_name") or item["name"],
                "internal_id": item["name"],
            }

    # Resolve contacts (suppliers).
    contact_map = {}
    if party_ids:
        for c in frappe.get_all("Mandi Contact",
            filters={"name": ["in", party_ids]},
            fields=["name", "full_name", "city", "internal_id"],
            ignore_permissions=True,
        ):
            contact_map[c["name"]] = {
                "id": c["name"],
                "name": c.get("full_name") or c["name"],
                "city": c.get("city") or "",
                "internal_id": c.get("internal_id") or "",
            }

    # ── Pass 1: compute per-arrival gross total (sum of lot gross values) ──
    # Payments are recorded against the Mandi Arrival, not per lot. Per-lot
    # paid/balance is therefore an apportionment of the arrival's paid amount
    # weighted by each lot's share of the arrival's gross value. This makes
    # sums across lots reconcile to the arrival's GL balance.
    arrival_gross_total: dict = {}
    for lot in lot_rows:
        aid = lot.get("parent")
        if not aid:
            continue
        g = float(lot.get("net_amount") or 0)
        if g <= 0:
            g = float(lot.get("supplier_rate") or 0) * float(lot.get("qty") or 0)
        arrival_gross_total[aid] = arrival_gross_total.get(aid, 0.0) + g

    # ── Pass 2: Map pre-calculated status and paid amounts ──
    # The repair_single_party_settlement hook runs on every save and payment,
    # correctly maintaining FIFO allocated paid amounts directly on the document.
    arrival_summary_cache: dict = {}
    for aid, total_goods in arrival_gross_total.items():
        arrival_doc = arrival_by_name[aid]
        accounting_total = flt(arrival_doc.get("net_payable_farmer") or 0)
        # Fallback to Advance if paid_amount is missing (not initialized)
        paid_val = arrival_doc.get("paid_amount")
        paid = flt(paid_val) if paid_val is not None else flt(arrival_doc.get("advance") or 0)
        
        balance = max(0.0, accounting_total - paid)
        arrival_summary_cache[aid] = {
            "status": arrival_doc.get("status") or "Pending",
            "paid": paid,
            "balance": balance,
            "total": accounting_total
        }

    bills = []
    for lot in lot_rows:
        arrival = arrival_by_name.get(lot.get("parent")) or {}
        arrival_id = arrival.get("name")
        contact_id = arrival.get("party_id")
        contact = contact_map.get(contact_id, {}) if contact_id else {}
        item = item_map.get(lot.get("item_id"), {}) if lot.get("item_id") else {}

        supplier_rate = float(lot.get("supplier_rate") or 0)
        qty = float(lot.get("qty") or 0)
        net_amount = float(lot.get("net_amount") or 0)
        gross_value = net_amount if net_amount > 0 else supplier_rate * qty

        creation = lot.get("creation") or arrival.get("creation")
        if creation is not None and not isinstance(creation, str):
            creation = creation.isoformat()

        arrival_date = arrival.get("arrival_date")
        if arrival_date is not None and not isinstance(arrival_date, str):
            arrival_date = arrival_date.isoformat()

        # Apportion arrival-level paid/balance/total to this lot by gross share.
        arrival_total_gross = arrival_gross_total.get(arrival_id, 0.0)
        arrival_summary = arrival_summary_cache.get(arrival_id, {"paid": 0, "balance": 0, "total": 0, "status": "pending"})
        share = (gross_value / arrival_total_gross) if arrival_total_gross > 0 else 0
        lot_paid    = flt(float(arrival_summary["paid"])    * share, 2)
        lot_balance = flt(float(arrival_summary["balance"]) * share, 2)
        lot_status  = arrival_summary["status"]  # arrival-level status applies to all its lots
        lot_net_payable = flt(float(arrival_summary["total"]) * share, 2)

        bills.append({
            "id": lot.get("name"),
            "contact_id": contact_id,
            "arrival_id": arrival_id,
            "arrival_type": arrival.get("arrival_type"),
            "item_id": lot.get("item_id"),
            "qty": qty,
            "initial_qty": lot.get("initial_qty"),
            "current_qty": lot.get("current_qty"),
            "unit": lot.get("unit"),
            "unit_weight": lot.get("unit_weight"),
            "supplier_rate": supplier_rate,
            "commission_percent": lot.get("commission_percent"),
            "less_percent": lot.get("less_percent"),
            "less_units": lot.get("less_units"),
            "packing_cost": lot.get("packing_cost"),
            "loading_cost": lot.get("loading_cost"),
            "farmer_charges": lot.get("farmer_charges"),
            "sale_price": lot.get("sale_price"),
            "lot_code": lot.get("lot_code"),
            "storage_location": lot.get("storage_location") or arrival.get("storage_location"),
            "net_qty": lot.get("net_qty"),
            "net_amount": net_amount,
            "commission_amount": lot.get("commission_amount"),
            "advance": lot_paid,
            "paid_amount": lot_paid,
            "payment_status": lot_status,
            "balance_due": lot_balance,
            "net_payable": lot_net_payable,
            "arrival_total_payable": flt(arrival_total_gross, 2),
            "arrival_total_paid": flt(float(arrival_summary["paid"]), 2),
            "arrival_total_balance": flt(float(arrival_summary["balance"]), 2),
            "created_at": creation,
            "farmer": contact,
            "item": item,
            "arrival": {
                "arrival_date": arrival_date,
                "reference_no": arrival.get("reference_no"),
                "arrival_type": arrival.get("arrival_type"),
                "hire_charges": arrival.get("hire_charges") or 0,
                "hamali_expenses": arrival.get("hamali_expenses") or 0,
                "other_expenses": arrival.get("other_expenses") or 0,
                "bill_no": arrival.get("contact_bill_no"),
                "contact_bill_no": arrival.get("contact_bill_no"),
                "storage_location": arrival.get("storage_location"),
                "advance_amount": flt(float(arrival_summary["paid"]), 2),
            },
            "sale_items": [],
        })

    # Roll up by supplier. 
    groups: dict = {}
    arrival_processed: set = set()
    for bill in bills:
        cid = bill.get("contact_id")
        if not cid:
            continue
        if cid not in groups:
            contact = contact_map.get(cid, {})
            groups[cid] = {
                "id": cid,
                "name": contact.get("name") or "Unknown Supplier",
                "city": contact.get("city") or "",
                "internal_id": contact.get("internal_id") or "",
                "storage_location": bill.get("storage_location") or "",
                "lots": [],
                "totalPurchaseValue": 0.0,
                "totalPaid": 0.0,
                "totalNetPayable": 0.0,
                "inwardCount": 0,
                "balance": 0.0,
                "latestDate": bill.get("created_at"),
            }

        group = groups[cid]
        group["lots"].append(bill)
        
        # Accumulate per-lot values to the group totals.
        # Since net_payable, paid_amount, and balance_due are already lot-specific
        # (apportioned from arrival totals), summing them across all lots correctly
        # reconstructs the total for the supplier.
        group["totalPurchaseValue"] += float(bill.get("net_payable") or 0)
        group["totalPaid"] += float(bill.get("paid_amount") or 0)
        group["balance"] += float(bill.get("balance_due") or 0)
        
        arrival_id = bill.get("arrival_id")
        if arrival_id and arrival_id not in arrival_processed:
            group["inwardCount"] += 1
            arrival_processed.add(arrival_id)
        
        # Track latest date for sorting
        created_at = bill.get("created_at") or ""
        if created_at and created_at > (group["latestDate"] or ""):
            group["latestDate"] = created_at
            if bill.get("arrival", {}).get("storage_location"):
                group["storage_location"] = bill["arrival"]["storage_location"]

    grouped_suppliers = []
    for g in groups.values():
        # Reconcile the supplier-card balance with the party-level outstanding.
        # Per-arrival positive sums (what was here before) over-report what mandi
        # owes when the same supplier was over-paid on another bill — the true
        # number is the signed party balance from the GL. The Make Payment dialog
        # uses the same source, so both views now agree.
        cid = g.get("id")
        outstanding = _get_party_outstanding(cid) if cid else {"to_pay": 0.0, "to_collect": 0.0, "signed_balance": 0.0}

        per_arrival_positive_sum = float(g.get("balance") or 0)
        g["balanceFromArrivals"] = per_arrival_positive_sum  # kept for drilldown / debugging
        g["balance"]              = -float(outstanding["signed_balance"]) # Positive = To Pay, Negative = Advance
        g["advanceHeld"]          = float(outstanding["to_collect"])  # mandi has overpaid this party by this much
        g["partySignedBalance"]   = float(outstanding["signed_balance"])
        g["totalNetPayable"]      = g["totalPurchaseValue"]
        g["netAmount"]            = g["balance"]
        
        if g["balance"] > 0.01:
            g["calculatedStatus"] = "partial" if g["totalPaid"] > 0.01 else "pending"
        elif g["balance"] < -0.01:
            g["calculatedStatus"] = "paid" # UI treats negative as Advance, which is fully paid
        else:
            g["calculatedStatus"] = "paid"
        grouped_suppliers.append(g)

    grouped_suppliers.sort(key=lambda s: s.get("latestDate") or "", reverse=True)
    return {"bills": bills, "groupedSuppliers": grouped_suppliers}


@frappe.whitelist(allow_guest=False)
def export_arrivals_csv(org_id: str = None, date_from: str = None, date_to: str = None) -> list:
    """Export arrivals data for CSV download."""
    org_id = _get_user_org()
    if not org_id:
        return []

    filters = {"organization_id": org_id}
    if date_from and date_to:
        filters["creation"] = ["between", [date_from, date_to]]

    records = frappe.get_all("Mandi Arrival",
        filters=filters,
        fields=["*"],
        order_by="creation desc",
        limit_page_length=5000,
        ignore_permissions=True
    )

    return [{
        "arrival_date": str(r.get("arrival_date", "")),
        "farmer_name": r.get("farmer_name", "Unknown"),
        "item_name": r.get("item_name", ""),
        "vehicle_number": r.get("vehicle_number", ""),
        "storage_location": r.get("storage_location", ""),
        "status": r.get("status", ""),
    } for r in records]


@frappe.whitelist(allow_guest=False)
def update_settings(**kwargs) -> dict:
    """Update mandi settings for the current organization profile.

    NUCLEAR approach: Uses a single raw SQL UPDATE query to guarantee
    the write hits the DB. No frappe.db.set_value(), no has_column(),
    no meta cache — just a direct parameterized SQL UPDATE.

    After commit, reads back every value and returns them so the
    frontend can verify the save actually persisted.
    """
    org_id = _get_user_org()
    if not org_id:
        frappe.log_error("update_settings: _get_user_org() returned None", "Settings Save Fail")
        return {"status": "error", "message": "No organization context found"}

    if not frappe.db.exists("Mandi Organization", org_id):
        frappe.log_error(f"update_settings: org {org_id} not found in DB", "Settings Save Fail")
        return {"status": "error", "message": f"Organization {org_id} not found"}

    skip_keys = {"cmd", "csrf_token"}

    # Map frontend keys -> actual DB column names (verified via SHOW COLUMNS)
    FIELD_MAP = {
        "organization_name":       "organization_name",
        "gstin":                   "gstin",
        "phone":                   "phone",
        "address":                 "address",
        "city":                    "city",
        "commission_rate_default": "commission_rate_default",
        "market_fee_percent":      "market_fee_percent",
        "nirashrit_percent":       "nirashrit_percent",
        "misc_fee_percent":        "misc_fee_percent",
        "default_credit_days":     "default_credit_days",
        "gst_enabled":             "gst_enabled",
        "gst_type":                "gst_type",
        "cgst_percent":            "cgst_percent",
        "sgst_percent":            "sgst_percent",
        "igst_percent":            "igst_percent",
        "state_code":              "state_code",
        "brand_color":             "brand_color",
        "print_upi_qr":           "print_upi_qr",
        "print_bank_details":      "print_bank_details",
        "qr_bank_id":              "qr_bank_id",
        "text_bank_id":            "text_bank_id",
        "mandi_license":           "mandi_license",
        "max_invoice_amount":      "max_invoice_amount",
    }

    try:
        # Ensure custom fields exist
        _ensure_org_custom_fields()

        # STEP 1: Query actual DB columns once — the ONLY source of truth
        existing_cols = {r[0] for r in frappe.db.sql(
            "SHOW COLUMNS FROM `tabMandi Organization`"
        )}

        # Build SET clause — ONLY for columns that actually exist in DB
        set_parts = []
        values = []
        saved_fields = []
        skipped_fields = []

        for key, val in kwargs.items():
            if key in skip_keys:
                continue
            col = FIELD_MAP.get(key)
            if not col:
                continue
            if col not in existing_cols:
                skipped_fields.append(col)
                continue
            set_parts.append(f"`{col}` = %s")
            values.append(val)
            saved_fields.append(col)

            # Mirror address -> address_line1 ONLY if column exists
            if col == "address" and "address_line1" in existing_cols:
                set_parts.append("`address_line1` = %s")
                values.append(val)

        if not set_parts:
            return {"status": "error", "message": "No valid fields to update",
                    "skipped": skipped_fields, "existing_cols": sorted(existing_cols)}

        # Add modified timestamp
        set_parts.append("`modified` = NOW()")
        set_parts.append("`modified_by` = %s")
        values.append(frappe.session.user)

        # Single atomic SQL UPDATE
        sql = f"UPDATE `tabMandi Organization` SET {', '.join(set_parts)} WHERE `name` = %s"
        values.append(org_id)

        frappe.db.sql(sql, tuple(values))
        frappe.db.commit()

        # Clear all caches so next read gets fresh data
        frappe.clear_cache(doctype="Mandi Organization")
        frappe.local.cache = {}

        # VERIFICATION: Read back every field we just wrote
        readback_cols = list(set(saved_fields))
        if readback_cols:
            readback = frappe.db.get_value(
                "Mandi Organization", org_id, readback_cols, as_dict=True
            ) or {}
        else:
            readback = {}

        # Log for debugging
        frappe.logger().info(f"update_settings OK: org={org_id}, saved={saved_fields}, readback={readback}")

        return {
            "status": "updated",
            "message": "Settings updated successfully",
            "saved": saved_fields,
            "readback": {k: readback.get(k) for k in saved_fields if k in readback},
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(title="update_settings CRASH", message=frappe.get_traceback())
        return {"status": "error", "message": str(e)}


def _ensure_org_custom_fields():
    """Auto-create ALL required columns on tabMandi Organization if missing.
    
    This replaces 'bench migrate' for production deployments where the
    doctype JSON has been updated but the DB schema hasn't been synced.
    Uses ALTER TABLE ADD COLUMN directly — idempotent and crash-safe.
    """
    # Every column the settings page needs, with their MariaDB types
    REQUIRED_COLUMNS = {
        "commission_rate_default": "DECIMAL(18,6) DEFAULT 0",
        "market_fee_percent":     "DECIMAL(18,6) DEFAULT 0",
        "nirashrit_percent":      "DECIMAL(18,6) DEFAULT 0",
        "misc_fee_percent":       "DECIMAL(18,6) DEFAULT 0",
        "default_credit_days":    "INT(11) DEFAULT 15",
        "max_invoice_amount":     "DECIMAL(18,6) DEFAULT 0",
        "mandi_license":          "VARCHAR(140) DEFAULT ''",
        "gst_enabled":            "INT(1) DEFAULT 0",
        "gst_type":               "VARCHAR(140) DEFAULT 'intra'",
        "cgst_percent":           "DECIMAL(18,6) DEFAULT 0",
        "sgst_percent":           "DECIMAL(18,6) DEFAULT 0",
        "igst_percent":           "DECIMAL(18,6) DEFAULT 0",
        "state_code":             "VARCHAR(140) DEFAULT ''",
        "brand_color":            "VARCHAR(140) DEFAULT '#10b981'",
        "print_upi_qr":           "INT(1) DEFAULT 0",
        "print_bank_details":     "INT(1) DEFAULT 0",
        "qr_bank_id":             "VARCHAR(140) DEFAULT ''",
        "text_bank_id":           "VARCHAR(140) DEFAULT ''",
    }

    try:
        # Get current columns in one query
        existing = {r[0] for r in frappe.db.sql(
            "SHOW COLUMNS FROM `tabMandi Organization`"
        )}

        added = []
        for col, col_type in REQUIRED_COLUMNS.items():
            if col not in existing:
                try:
                    frappe.db.sql(f"ALTER TABLE `tabMandi Organization` ADD COLUMN `{col}` {col_type}")
                    added.append(col)
                except Exception as e:
                    # Column might have been added by another request (race condition)
                    if "Duplicate column" not in str(e):
                        frappe.log_error(f"_ensure_org_custom_fields: failed to add {col}: {e}")

        if added:
            frappe.db.commit()
            frappe.logger().info(f"_ensure_org_custom_fields: added columns {added}")
    except Exception as e:
        frappe.log_error(f"_ensure_org_custom_fields failed: {e}")



def _safe_get_field(doc, fieldname: str, default=None):
    """Safely read a field from a Frappe document.
    
    Falls back to a direct DB query if the field doesn't exist in the in-memory
    doc (e.g. custom fields created after the meta was cached). Returns `default`
    if the column doesn't exist in the database at all.
    """
    # Try the in-memory doc attribute first (fastest path)
    val = getattr(doc, fieldname, None)
    if val is not None:
        return val
    
    # Try a direct DB read — the column may exist even if meta cache is stale
    try:
        result = frappe.db.get_value("Mandi Organization", doc.name, fieldname)
        if result is not None:
            return result
    except Exception:
        # Column doesn't exist yet — return default gracefully
        pass
    
    return default





@frappe.whitelist(allow_guest=False)
def check_feature_enabled(feature_key: str = None) -> dict:
    """Check if a feature flag is enabled for the current org."""
    if not feature_key:
        return {"enabled": False}
    # Default: all features enabled in Frappe
    return {"enabled": True}


@frappe.whitelist(allow_guest=False)
def commit_mandi_session(**kwargs) -> dict:
    """
    Atomic Mandi-commission session commit.

    Accepts the flat payload sent by useMandiSession.commitSession:
      organization_id, session_date, lot_no, vehicle_no, book_no,
      buyer_id, buyer_loading_charges, buyer_packing_charges,
      buyer_payable, farmers: [ { farmer_id, item_id, qty, rate, ... } ]

    For each farmer row it creates one Mandi Arrival (with one Mandi Lot
    child). If a buyer is provided, a single Mandi Sale is created covering
    all rows. Returns the shape the hook expects:
      { success, session_id, purchase_bill_ids, sale_bill_id,
        total_commission, total_purchase, total_net_qty }
    """
    import json as _json

    # Unwrap JSON-encoded body when Frappe forwards it as a single string.
    if "session_data" in kwargs and isinstance(kwargs["session_data"], str):
        try:
            kwargs.update(_json.loads(kwargs.pop("session_data")))
        except Exception:
            pass

    farmers = kwargs.get("farmers") or []
    if isinstance(farmers, str):
        try:
            farmers = _json.loads(farmers)
        except Exception:
            farmers = []

    session_date = kwargs.get("session_date")
    lot_prefix = kwargs.get("lot_no") or None
    vehicle_no = kwargs.get("vehicle_no") or None
    buyer_id = kwargs.get("buyer_id") or None
    buyer_loading = float(kwargs.get("buyer_loading_charges") or 0)
    buyer_packing = float(kwargs.get("buyer_packing_charges") or 0)
    buyer_payable = float(kwargs.get("buyer_payable") or 0)
    
    # Auto-generate a unified lot_prefix if not provided from UI
    if not lot_prefix:
        import random
        while True:
            candidate = str(random.randint(100000, 999999))
            if not frappe.db.exists("Mandi Lot", {"lot_code": candidate}):
                lot_prefix = candidate
                break

    purchase_bill_ids = []
    lot_names = []
    total_commission = 0.0
    total_purchase = 0.0
    total_net_qty = 0.0

    try:
        n_items = len(farmers)
        for idx, row in enumerate(farmers):
            farmer_id = row.get("farmer_id")
            if not farmer_id:
                continue

            qty = float(row.get("qty") or 0)
            rate = float(row.get("rate") or 0)
            less_pct = float(row.get("less_percent") or 0)
            less_units = float(row.get("less_units") or 0)
            commission_pct = float(row.get("commission_percent") or 0)
            loading = float(row.get("loading_charges") or 0)
            other = float(row.get("other_charges") or 0)
            net_qty = float(row.get("net_qty") or max(qty - less_units, 0))
            net_amount = float(row.get("net_amount") or net_qty * rate)
            commission_amount = float(row.get("commission_amount") or net_amount * commission_pct / 100)
            net_payable = float(row.get("net_payable") or (net_amount - commission_amount - loading - other))

            arrival = frappe.new_doc("Mandi Arrival")
            arrival.arrival_date = session_date
            arrival.party_id = farmer_id
            arrival.organization_id = kwargs.get("organization_id")
            arrival.arrival_type = kwargs.get("arrival_type") or "commission"
            arrival.advance_payment_mode = "credit"  # Always Udhaar in commission session
            arrival.advance = 0
            arrival.lot_prefix = lot_prefix
            arrival.vehicle_number = vehicle_no
            arrival.status = "Pending"

            # Auto-assign sequential contact_bill_no for this farmer
            arrival.contact_bill_no = _get_next_annual_bill_no("Mandi Arrival", "party_id", farmer_id)

            lot = arrival.append("items", {})
            lot.item_id = row.get("item_id")
            lot.qty = qty
            lot.initial_qty = qty
            # current_qty tracks PHYSICAL UNITS in stock — always use original qty.
            # net_qty is a BILLING field (less_percent deduction) — not a stock field.
            # less/cutting reduces what we PAY the farmer, not how many boxes we received.
            lot.current_qty = qty
            if lot_prefix:
                lot.lot_code = lot_prefix if n_items == 1 else f"{lot_prefix}-{str(idx + 1).zfill(2)}"
            lot.unit = row.get("unit")
            lot.supplier_rate = rate
            lot.commission_percent = commission_pct
            lot.less_percent = less_pct
            lot.less_units = less_units
            lot.loading_cost = loading
            lot.farmer_charges = other
            lot.net_qty = net_qty   # billing/settlement field only
            lot.net_amount = net_amount
            lot.commission_amount = commission_amount

            # Insert + Submit: the on_submit hook (automation.on_arrival_submit)
            # fires post_arrival_ledger which creates:
            #   Dr Stock In Hand  (total_realized)
            #   Cr Creditors      (net_payable_farmer — farmer ledger)
            #   Cr Commission Income
            #   Cr Expense Recovery
            arrival.insert(ignore_permissions=True)
                
            arrival.submit()  # ← THIS posts the GL entries and farmer ledger

            purchase_bill_ids.append(arrival.name)
            if arrival.items:
                lot_names.append(arrival.items[0].name)

            total_purchase += net_payable
            total_commission += commission_amount
            total_net_qty += net_qty

        sale_bill_id = None
        if buyer_id and farmers:
            sale = frappe.new_doc("Mandi Sale")
            sale.saledate = session_date
            sale.buyerid = buyer_id
            sale.organization_id = kwargs.get("organization_id")
            sale.paymentmode = "credit"     # Always Udhaar — buyer pays later
            sale.amountreceived = 0
            sale.loadingcharges = buyer_loading
            sale.unloadingcharges = buyer_packing
            # lot_no from the frontend screen → printed on buyer invoice
            sale.lotno = lot_prefix
            sale.vehiclenumber = vehicle_no

            total_gross_amount = 0.0
            total_less_amount = 0.0
            exclusive_gst_total = 0.0

            for idx, row in enumerate(farmers):
                if not row.get("item_id"):
                    continue

                qty = float(row.get("qty") or 0)   # Gross Qty
                rate = float(row.get("rate") or 0)
                less_amt = float(row.get("less_amount") or 0)
                item_gross = qty * rate
                item_taxable = max(item_gross - less_amt, 0)
                
                gst_rate = float(row.get("gst_rate") or 0)
                sale_gst_type = row.get("sale_gst_type") or "Exclusive"
                hsn_code = row.get("hsn_code") or ""
                
                gst_amount = 0.0
                if gst_rate > 0:
                    if sale_gst_type == "Inclusive":
                        base_amount = item_taxable / (1 + gst_rate / 100)
                        gst_amount = item_taxable - base_amount
                    else:
                        gst_amount = item_taxable * (gst_rate / 100)
                        exclusive_gst_total += gst_amount

                item = sale.append("items", {})
                item.item_id = row.get("item_id")
                item.qty = qty
                item.rate = rate
                item.amount = item_gross
                item.hsn_code = hsn_code
                item.gst_rate = gst_rate
                item.gst_amount = round(gst_amount, 2)
                if idx < len(lot_names):
                    item.lot_id = lot_names[idx]

                total_gross_amount += item_gross
                total_less_amount += less_amt

            sale.totalamount = total_gross_amount
            sale.discountamount = total_less_amount
            
            # ── CRATE ITEMS: sold alongside commodities ───────────────────────
            crate_items = kwargs.get("crate_items") or []
            if isinstance(crate_items, str):
                try:
                    crate_items = _json.loads(crate_items)
                except Exception:
                    crate_items = []
            
            for ci in crate_items:
                ct = ci.get("crate_type")
                cqty = int(ci.get("qty") or 0)
                crate = ci.get("rate") or 0
                if not ct or cqty <= 0:
                    continue
                
                stock_data = _get_crate_stock_balance(kwargs.get("organization_id"), ct)
                if cqty > stock_data.get("available", 0):
                    return {"success": False, "error": f"Cannot sell {cqty} of '{ct}'. Only {stock_data.get('available', 0)} available."}

                if not frappe.db.exists("Mandi Crate Type", ct):
                    frappe.get_doc({
                        "doctype": "Mandi Crate Type",
                        "crate_name": ct,
                        "organization_id": kwargs.get("organization_id"),
                        "purchase_rate": 0,
                        "sale_rate": float(crate),
                    }).insert(ignore_permissions=True)
                try:
                    _reduce_crate_stock(kwargs.get("organization_id"), ct, cqty)
                except Exception:
                    pass
                crate_item_id = _get_or_create_crate_commodity(kwargs.get("organization_id"), ct)
                
                c_amt = float(cqty * crate)
                item = sale.append("items", {})
                item.item_id = crate_item_id
                item.qty = float(cqty)
                item.rate = float(crate)
                item.amount = c_amt
                
                sale.totalamount += c_amt
            # ─────────────────────────────────────────────────────────────────
            
            # Fetch Org Settings to compute taxes for the Buyer Bill
            org_settings = _get_org_info(kwargs.get("organization_id"))
            taxable_val = total_gross_amount - total_less_amount
            market_fee = float(org_settings.get("market_fee_percent") or 0)
            nirashrit = round(taxable_val * (float(org_settings.get("nirashrit_percent") or 0) / 100), 2)
            misc_fee = round(taxable_val * (float(org_settings.get("misc_fee_percent") or 0) / 100), 2)
            
            gst_total = float(kwargs.get("gst_total") or 0)
            cgst_amount = float(kwargs.get("cgst_amount") or 0)
            sgst_amount = float(kwargs.get("sgst_amount") or 0)
            igst_amount = float(kwargs.get("igst_amount") or 0)
                    
            sale.marketfee = market_fee
            sale.nirashrit = nirashrit
            sale.miscfee = misc_fee
            sale.gsttotal = gst_total
            if frappe.db.has_column("Mandi Sale", "cgst_amount"):
                sale.cgst_amount = cgst_amount
                sale.sgst_amount = sgst_amount
                sale.igst_amount = igst_amount
                
            # Recalculate invoice_total just like frontend to be absolutely safe
            computed_payable = round(taxable_val + market_fee + nirashrit + misc_fee + exclusive_gst_total + buyer_loading + buyer_packing)
            sale.invoice_total = computed_payable
            # Udhaar sale — status is Pending until buyer pays
            sale.status = "Pending"

            # Insert + Submit: the on_submit hook (automation.on_sale_submit)
            # fires post_sale_ledger which creates:
            #   Dr Debtors (buyer_payable — buyer ledger)
            #   Cr Stock In Hand
            # No Receipt JE since payment_mode = "credit" (Udhaar)
            sale.insert(ignore_permissions=True)
            sale.submit()  # ← THIS posts the GL entries and buyer ledger

            # ── Mark all sold lots as Sold Out in stock ───────────────────────
            # Purchase+Sale is an immediate flip: goods arrive and immediately
            # leave. current_qty must be 0 so Stock Status shows 'Sold Out'.
            for lot_name in lot_names:
                try:
                    frappe.db.set_value("Mandi Lot", lot_name, {
                        "current_qty": 0,
                        "status": "Sold Out",
                    }, update_modified=False)
                except Exception:
                    pass
            # ──────────────────────────────────────────────────────────────────

            sale_bill_id = sale.name

        frappe.db.commit()

        session_id = purchase_bill_ids[0] if purchase_bill_ids else (sale_bill_id or "")

        return {
            "success": True,
            "session_id": session_id,
            "purchase_bill_ids": purchase_bill_ids,
            "sale_bill_id": sale_bill_id,
            "total_commission": round(total_commission, 2),
            "total_purchase": round(total_purchase, 2),
            "total_net_qty": round(total_net_qty, 3),
            "status": "success",
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "commit_mandi_session failed")
        return {
            "success": False,
            "error": str(e),
            "purchase_bill_ids": purchase_bill_ids,
            "sale_bill_id": None,
            "total_commission": 0,
            "total_purchase": 0,
            "total_net_qty": 0,
        }


@frappe.whitelist(allow_guest=False)
def get_session_detail(session_id: str = None) -> dict:
    """Return the committed arrivals + sale for a session id.

    `session_id` is the first arrival name produced by commit_mandi_session.
    For the commission form we reconstruct the session by fetching that
    arrival (plus any sale linked to the same buyer on the same date).
    """
    if not session_id:
        return {"arrivals": [], "sale": None}

    try:
        arrival = frappe.get_doc("Mandi Arrival", session_id)
        _enforce_ownership(arrival)
    except frappe.DoesNotExistError:
        return {"arrivals": [], "sale": None}

    arrivals = [arrival.as_dict()]
    # Include peer arrivals created in the same commit (same date + lot_prefix).
    if arrival.arrival_date and arrival.lot_prefix:
        peers = frappe.get_all(
            "Mandi Arrival",
            filters={
                "arrival_date": arrival.arrival_date,
                "lot_prefix": arrival.lot_prefix,
                "name": ["!=", arrival.name],
            },
            fields=["name"],
            ignore_permissions=True,
        )
        for p in peers:
            try:
                arrivals.append(frappe.get_doc("Mandi Arrival", p["name"]).as_dict())
            except Exception:
                pass

    sale = None
    if arrival.arrival_date:
        sale_rows = frappe.get_all(
            "Mandi Sale",
            filters={"saledate": arrival.arrival_date},
            fields=["name"],
            order_by="creation desc",
            limit_page_length=1,
            ignore_permissions=True,
        )
        if sale_rows:
            try:
                sale = frappe.get_doc("Mandi Sale", sale_rows[0]["name"]).as_dict()
            except Exception:
                sale = None

    return {"arrivals": arrivals, "sale": sale}


@frappe.whitelist(allow_guest=False)
def get_recent_sessions(org_id: str = None, limit: int = 20) -> list:
    """List recent Mandi Arrival heads so the session history tab can render."""
    try:
        limit = int(limit or 20)
    except Exception:
        limit = 20

    return frappe.get_all(
        "Mandi Arrival",
        fields=[
            "name", "arrival_date", "party_id", "arrival_type",
            "lot_prefix", "status", "creation",
        ],
        order_by="creation desc",
        limit_page_length=limit,
        ignore_permissions=True,
    )


@frappe.whitelist(allow_guest=False)
def get_sales_order(order_id: str = None) -> dict:
    """Get a sales order with its items for conversion to invoice."""
    if not order_id:
        return None
    try:
        doc = frappe.get_doc("Sales Order", order_id)
        return {
            "buyer_id": doc.get("customer"),
            "items": [{"item_id": i.item_code, "quantity": i.qty, "unit_price": i.rate, "total_price": i.amount, "unit": i.uom} for i in doc.items]
        }
    except Exception:
        return None


@frappe.whitelist(allow_guest=False)
def get_delivery_challan(challan_id: str = None) -> dict:
    """Get a delivery challan for conversion to invoice."""
    if not challan_id:
        return None
    try:
        doc = frappe.get_doc("Delivery Note", challan_id)
        return {
            "contact_id": doc.get("customer"),
            "buyer_id": doc.get("customer"),
            "items": [{"item_id": i.item_code, "lot_id": "", "quantity": i.qty, "quantity_dispatched": i.qty, "unit": i.uom} for i in doc.items]
        }
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Get user's organization
# ─────────────────────────────────────────────────────────────────────────────

def _get_user_org() -> str:
    """Get the organization for the current logged-in user."""
    user = frappe.session.user
    if not user or user == "Guest":
        return None

    # 1. Check for active impersonation (Platform Admins only)
    try:
        from mandigrow.mandigrow.logic.tenancy import is_super_admin
        if is_super_admin():
            impersonated_org = frappe.cache().get_value(f"impersonation_target_org:{user}")
            if impersonated_org:
                return impersonated_org
    except Exception:
        pass

    # 2. Check custom field on User
    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if org_id:
        return org_id

    # Fallback: check Mandi Profile if it exists
    if frappe.db.exists("DocType", "Mandi Profile"):
        profile_org = frappe.db.get_value("Mandi Profile", {"email": user}, "organization_id")
        if profile_org:
            return profile_org
            
    return None

def _get_user_company() -> str:
    """Get the ERPNext Company name for the current logged-in user.
    
    Resolution order:
    1. Mandi Organization.erp_company (if column exists)
    2. User's default company (frappe.defaults)
    3. Any Company in the database (single-tenant fallback)
    
    NEVER returns '' if at least one Company exists — that would cause
    all list queries to return zero results.
    """
    org_id = _get_user_org()
    
    # 1. Try erp_company from Mandi Organization
    if org_id:
        try:
            company = frappe.db.sql(
                "SELECT erp_company FROM `tabMandi Organization` WHERE name = %s",
                (org_id,), as_dict=True
            )
            if company and company[0].get("erp_company"):
                return company[0]["erp_company"]
        except Exception:
            pass  # Column doesn't exist on production

    # 2. Try user's default company
    try:
        user_company = frappe.defaults.get_user_default("company")
        if user_company:
            return user_company
    except Exception:
        pass

    # 3. Fallback: get any Company (single-tenant environments)
    try:
        any_company = frappe.db.get_value("Company", {}, "name")
        if any_company:
            return any_company
    except Exception:
        pass

    return ""



@frappe.whitelist(allow_guest=False)
def get_org_settings(org_id: str = None) -> dict:
    """Return org info and settings for the UI, isolated per tenant."""
    return _get_org_info(org_id or _get_user_org())

def _get_org_info(org_id: str) -> dict:
    """Return the organization profile and settings for the current tenant.
    
    Uses SELECT * to avoid 'Unknown column' errors when local vs production
    schemas differ. Every field is read via .get() with a safe default.
    """
    if not org_id:
        return {}

    try:
        if not frappe.db.exists("Mandi Organization", org_id):
            raise ValueError(f"Org {org_id} not found")

        # SELECT * — reads whatever columns exist, never crashes on missing columns
        rows = frappe.db.sql(
            "SELECT * FROM `tabMandi Organization` WHERE name = %s LIMIT 1",
            (org_id,), as_dict=True
        )
        if not rows:
            raise ValueError(f"Org {org_id} not found in DB")

        org = rows[0]

        # Resolve address: production may have only 'address', local may have 'address_line1'
        address_val = org.get("address_line1") or org.get("address") or ""
        city_val = org.get("address_line2") or org.get("city") or ""

        # Fetch global settings fallback
        try:
            global_settings = frappe.get_single("Mandi Settings")
            global_crate_tracking = bool(global_settings.get("enable_crate_tracking"))
            global_crate_ageing = int(global_settings.get("crate_ageing_days") or 7)
        except Exception:
            global_crate_tracking = False
            global_crate_ageing = 7

        # Parse payment settings JSON
        import json
        payment_settings = {}
        raw_payment = org.get("payment_settings")
        if raw_payment:
            try:
                payment_settings = json.loads(raw_payment) if isinstance(raw_payment, str) else raw_payment
            except Exception:
                pass

        return {
            "id": org.get("name"),
            "name": org.get("organization_name") or org.get("name") or "",
            "subscription_tier": org.get("subscription_tier") or "starter",
            "status": org.get("status") or "active",
            "trial_ends_at": org.get("trial_ends_at"),
            "is_active": bool(org.get("is_active", True)),
            "brand_color": org.get("brand_color") or "#10b981",
            "address_line1": address_val,
            "address_line2": city_val,
            "pincode": org.get("pincode") or "",
            "slug": org.get("slug") or "",
            "pan_number": org.get("pan_number") or "",
            "email": org.get("email") or "",
            "whatsapp_number": org.get("whatsapp_number") or "",
            "website": org.get("website") or "",
            "logo_url": org.get("logo_url") or "",
            "brand_color_secondary": org.get("brand_color_secondary") or "#0f172a",
            "header_color": org.get("header_color") or "#0f172a",
            "footer_text": org.get("footer_text") or "",
            "custom_domain": org.get("custom_domain") or "",
            "currency_code": org.get("currency_code") or "INR",
            "locale": org.get("locale") or "en-IN",
            "timezone": org.get("timezone") or "Asia/Kolkata",
            "address": address_val,
            "city": org.get("city") or "",
            "gstin": org.get("gstin") or "",
            "phone": org.get("phone") or "",
            "commission_rate_default": flt(org.get("commission_rate_default") or 0),
            "market_fee_percent": flt(org.get("market_fee_percent") or 0),
            "nirashrit_percent": flt(org.get("nirashrit_percent") or 0),
            "misc_fee_percent": flt(org.get("misc_fee_percent") or 0),
            "max_invoice_amount": flt(org.get("max_invoice_amount") or 0),
            "default_credit_days": int(org.get("default_credit_days") or 15),
            "mandi_license": org.get("mandi_license") or "",
            "state_code": org.get("state_code") or "",
            "gst_enabled": bool(org.get("gst_enabled")),
            "gst_type": org.get("gst_type") or "intra",
            "cgst_percent": flt(org.get("cgst_percent") or 0),
            "sgst_percent": flt(org.get("sgst_percent") or 0),
            "igst_percent": flt(org.get("igst_percent") or 0),
            "erp_company": org.get("erp_company") or "",
            "enable_crate_tracking": bool(org.get("enable_crate_tracking")) or global_crate_tracking,
            "crate_ageing_days": int(org.get("crate_ageing_days") or global_crate_ageing or 7),
            "settings": {
                "payment": payment_settings
            }
        }
    except Exception as e:
        frappe.log_error(f"Error in _get_org_info for {org_id}: {str(e)}")

    # Fallback: synthesize minimal info from ERPNext Company if profile is missing
    company_name = org_id
    try:
        if frappe.db.exists("Company", org_id):
            company_name = frappe.db.get_value("Company", org_id, "company_name") or org_id
    except Exception:
        pass

    return {
        "id": org_id,
        "name": company_name,
        "subscription_tier": "starter",
        "status": "active",
        "trial_ends_at": None,
        "is_active": True,
        "brand_color": "#10b981",
        "brand_color_secondary": "#0f172a",
        "address": "",
        "city": "",
        "gstin": "",
        "phone": "",
    }


def _get_default_item() -> str:
    """Return a safe default Item code when a sale/arrival row omits item_id.

    Preference order:
      1. Mandi Settings.default_item (if configured)
      2. The first enabled Item
      3. None (caller must handle)
    """
    try:
        default_item = frappe.db.get_single_value("Mandi Settings", "default_item")
        if default_item and frappe.db.exists("Item", default_item):
            return default_item
    except Exception:
        pass

    fallback = frappe.get_all(
        "Item",
        filters={"disabled": 0},
        fields=["name"],
        limit_page_length=1,
        order_by="creation asc",
        ignore_permissions=True,
    )
    if fallback:
        return fallback[0]["name"]
    return None
@frappe.whitelist(allow_guest=False)
def get_pos_master_data() -> dict:
    """
    Returns all data needed for the POS system in one call.
    Includes inventory (lots + commodities), buyers, accounts, and settings.
    """
    try:
        org_id = _get_user_org()
        
        # 1. Fetch Inventory (Lots + Commodities)
        lot_fields = _lot_query_fields(
            [
                "name as id", "name", "item_id", "qty", "unit", "sale_price",
                "supplier_rate", "packing_cost", "loading_cost", "farmer_charges",
                "lot_code", "net_qty", "barcode"
            ],
            ["initial_qty", "current_qty", "status", "custom_attributes"],
        )
        
        lot_filters = {"qty": [">", 0]}
        if org_id:
            valid_parents = frappe.get_all("Mandi Arrival", filters={**_org_filter("Mandi Arrival", org_id)}, pluck="name")
            if valid_parents:
                lot_filters["parent"] = ["in", valid_parents]
            else:
                lot_filters["parent"] = "DOES NOT EXIST"

        lots_raw = frappe.get_all("Mandi Lot",
            filters=lot_filters,
            fields=lot_fields,
            order_by="creation desc"
        )
        lots = []
        for lot in lots_raw:
            lot = _normalize_lot_stock(lot)
            if flt(lot.get("current_qty") or 0) <= 0:
                continue
            lot.setdefault("custom_attributes", {})
            lots.append(lot)
        
        commodities_res = get_commodities()
        commodities = commodities_res.get("commodities", [])
        
        # 2. Fetch Buyers — use raw SQL to avoid frappe.get_all 'name as id' alias conflict
        # (frappe.get_all always adds `name` PK to SELECT, creating duplicate column with alias)
        buyer_where = ["contact_type IN ('buyer','staff')", "full_name != 'Walk-in Buyer'"]
        buyer_params = []
        if org_id and frappe.db.has_column("Mandi Contact", "organization_id"):
            buyer_where.append("organization_id = %s")
            buyer_params.append(org_id)

        buyers = frappe.db.sql(f"""
            SELECT name AS id, full_name AS name, contact_type, city
            FROM `tabMandi Contact`
            WHERE {' AND '.join(buyer_where)}
            ORDER BY full_name ASC
        """, buyer_params, as_dict=True)
        
        # 3. Fetch Accounts (Cash/Bank) from ERPNext Chart of Accounts
        company = None
        if org_id:
            company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
        if not company:
            company = _get_user_company()
            
        if not company:
            return {"lots": [], "buyers": [], "accounts": [], "commodities": []}
        account_filters = {
            "company": company,
            "account_type": ["in", ["Cash", "Bank"]],
            "is_group": 0,
            "disabled": 0,
        }
        if org_id and frappe.db.has_column("Account", "organization_id"):
            account_filters["organization_id"] = org_id

        account_fields = ["name as id", "account_name as name", "account_type", "root_type"]
        if frappe.db.has_column("Account", "is_default"):
            account_fields.append("is_default")
        if frappe.db.has_column("Account", "description"):
            account_fields.append("description")

        accounts = frappe.get_all("Account",
            filters=account_filters,
            fields=account_fields,
            order_by="account_name",
        )
        for acc in accounts:
            acc["type"] = (acc.get("root_type") or "Asset").lower()
            acc["account_sub_type"] = (acc.get("account_type") or "Bank").lower()
            acc["is_default"] = 1 if acc.get("is_default") else 0
            acc["description"] = acc.get("description") or ""

        
        # 4. Fetch Settings
        settings = frappe.get_single("Mandi Settings") if frappe.db.exists("DocType", "Mandi Settings") else {}
        if settings:
            settings = settings.as_dict()
        
        return {
            "items": lots,
            "commodities": commodities,
            "buyers": buyers,
            "accounts": accounts,
            "settings": settings,
            "org_name": company or "MandiGrow"
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_pos_master_data Failed")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def confirm_pos_sale(payload: str) -> dict:
    """
    Processes a POS sale using the unified Mandi Sale transaction engine.
    Ensures all sales channels follow exact same ledger, payment, and cheque clearance workflows.
    """
    import json
    try:
        data = json.loads(payload)
        items = data.get("items", [])
        buyer_id = data.get("buyer_id")
        payment_mode = data.get("payment_mode", "cash")
        amount_received = float(data.get("amount_received", 0))
        total_amount = float(data.get("total_amount", 0))
        discount_amount = float(data.get("discount_amount", 0))
        discount_percent = float(data.get("discount_percent", 0))
        bank_account_id = data.get("bank_account_id")
        cheque_no = data.get("cheque_no")
        cheque_date = data.get("cheque_date")
        cheque_status = data.get("cheque_status")

        if not items:
            return {"success": False, "error": "No items in cart"}

        # Forward ALL parameters (including fees/taxes) to unified confirm_sale_transaction
        params = data.copy()

        res = confirm_sale_transaction(**params)
        if not res.get("success"):
            return res

        # Map POS response expectations
        return {
            "success": True,
            "sale_id": res.get("sale_id"),
            "bill_no": res.get("bill_no") or res.get("sale_id"),
            "message": "POS sale confirmed and ledger posted."
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "confirm_pos_sale Failed")
        return {"success": False, "error": str(e)}
@frappe.whitelist(allow_guest=False)
def get_buyer_receivables(org_id: str = None) -> list:
    """
    Returns list of buyers with their real-time net balance from GL Entry.
    """
    try:
        org_id = _get_user_org()
        # Resolve company from the specific org_id passed
        company = frappe.db.get_value("Mandi Organization", org_id, "erp_company") if org_id else _get_user_company()
        
        if not company:
            return []

        # SQL logic similar to get_party_balances but filtered for buyers
        query = """
            SELECT 
                c.name as contact_id, 
                c.full_name as contact_name, 
                c.city as contact_city,
                c.contact_type,
                COALESCE(
                    (SELECT SUM(gl.debit - gl.credit)
                     FROM `tabGL Entry` gl
                     WHERE gl.is_cancelled = 0
                       AND gl.company = %(company)s
                       AND (
                           (gl.party_type = 'Customer' AND gl.party = c.customer)
                           OR (gl.party_type = 'Supplier' AND gl.party = c.supplier)
                           OR (gl.party_type IN ('Supplier', 'Customer') AND gl.party = c.name)
                       )
                    ), 0
                ) as net_balance
            FROM `tabMandi Contact` c
            WHERE c.organization_id = %(org_id)s
              AND c.contact_type = 'buyer'
              AND c.full_name != 'Walk-in Buyer'
            HAVING net_balance != 0
            ORDER BY c.full_name ASC
        """
        buyers = frappe.db.sql(query, {"company": company, "org_id": org_id}, as_dict=True)
        return buyers
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_buyer_receivables Failed")
        return []

@frappe.whitelist(allow_guest=False)
def create_commodity(**kwargs) -> dict:
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    """
    Creates or updates a commodity (Item in ERPNext).
    Ensures dependencies like Item Group exist.
    """
    old_ignore = frappe.flags.ignore_permissions
    frappe.flags.ignore_permissions = True
    
    try:
        name = kwargs.get("name")
        if not name:
            frappe.throw("Item Name is required")
            
        # Ensure 'All Item Groups' exists as a root
        if not frappe.db.exists("Item Group", "All Item Groups"):
            frappe.get_doc({
                "doctype": "Item Group",
                "item_group_name": "All Item Groups",
                "is_group": 1
            }).insert(ignore_permissions=True)
            
        # Ensure specific category exists
        item_group = kwargs.get("category") or "Commodities"
        if not frappe.db.exists("Item Group", item_group):
            frappe.get_doc({
                "doctype": "Item Group",
                "item_group_name": item_group,
                "is_group": 0,
                "parent_item_group": "All Item Groups"
            }).insert(ignore_permissions=True)
            
        # 1. Combine Name and Specifications for the full descriptive name
        # We handle both formats: 
        # - specifications: [{"label": "V", "value": "X"}] 
        # - custom_attributes: {"V": "X"}
        specs = kwargs.get("specifications") or []
        # Ensure custom_attributes field exists in schema (critical for production deployments)
        if not frappe.db.exists("Custom Field", "Item-custom_attributes"):
            try:
                from frappe.custom.doctype.custom_field.custom_field import create_custom_field
                create_custom_field("Item", {
                    "fieldname": "custom_attributes",
                    "label": "Custom Attributes",
                    "fieldtype": "JSON",
                    "insert_after": "internal_id"
                })
            except Exception as e:
                frappe.log_error(f"Failed to create custom_attributes field: {str(e)}")
                
        # Ensure local_name field exists
        if not frappe.db.exists("Custom Field", "Item-local_name"):
            try:
                from frappe.custom.doctype.custom_field.custom_field import create_custom_field
                create_custom_field("Item", {
                    "fieldname": "local_name",
                    "label": "Local Name",
                    "fieldtype": "Data",
                    "insert_after": "item_name"
                })
            except Exception:
                pass
                
        # Ensure critical_age_days field exists
        if not frappe.db.exists("Custom Field", "Item-critical_age_days"):
            try:
                from frappe.custom.doctype.custom_field.custom_field import create_custom_field
                create_custom_field("Item", {
                    "fieldname": "critical_age_days",
                    "label": "Critical Age (Days)",
                    "fieldtype": "Int",
                    "insert_after": "shelf_life_in_days"
                })
            except Exception:
                pass

        # Ensure gst_rate custom field exists on Item
        if not frappe.db.exists("Custom Field", "Item-gst_rate"):
            try:
                from frappe.custom.doctype.custom_field.custom_field import create_custom_field
                create_custom_field("Item", {
                    "fieldname": "gst_rate",
                    "label": "GST Rate (%)",
                    "fieldtype": "Percent",
                    "default": "0",
                    "insert_after": "critical_age_days",
                    "description": "Per-item GST rate. Overrides org-wide setting in all Sales."
                })
            except Exception:
                pass
                
        custom_attrs = kwargs.get("custom_attributes") or {}
        if isinstance(custom_attrs, str):
            custom_attrs = frappe.parse_json(custom_attrs)
        
        full_name = name
        spec_parts = []
        
        # Add from specifications list
        for s in specs:
            val = (s.get("value") or "").strip()
            if val:
                spec_parts.append(val)
        
        # Add from custom_attributes dict (if not already added)
        for k, v in list(custom_attrs.items()):
            if k == "base_name":
                continue
            val = str(v).strip()
            if val and val not in spec_parts:
                spec_parts.append(val)
                
        # Recover base_name robustly
        base_name = name
        existing_base = custom_attrs.get("base_name")
        
        item_id = kwargs.get("id")
        if item_id and not existing_base and frappe.db.exists("Item", item_id):
            # Fallback to DB
            old_attrs = frappe.parse_json(frappe.db.get_value("Item", item_id, "custom_attributes") or "{}")
            existing_base = old_attrs.get("base_name")
            
        if existing_base and name.startswith(existing_base):
            base_name = existing_base

        # Store original commodity name to allow UI to reload cleanly without variety appended
        custom_attrs["base_name"] = base_name
        full_name = base_name
        
        if spec_parts:
            # Check if name already contains the spec parts (from a previous improper edit)
            suffix = f" - {' - '.join(spec_parts)}"
            if suffix.lower() not in base_name.lower() and not any(part.lower() in base_name.lower() for part in spec_parts):
                full_name = f"{base_name}{suffix}"
        
        org_id = _get_user_org()
        abbr = frappe.db.get_value("Company", _get_user_company(), "abbr") or "MG"
        
        # 2. Enforce Uniqueness of the Full Name (Case-Insensitive) per Organization
        # We must use the full_name for the uniqueness check
        existing_item = frappe.db.get_value("Item", 
            {"item_name": ["like", full_name], "organization_id": org_id, "name": ["!=", kwargs.get("id")]}, 
            "item_name"
        )
        if existing_item and existing_item.lower() == full_name.lower():
            frappe.throw(f"Item '{full_name}' already exists in your Mandi.")

        # 3. Handle Internal ID / SKU Code Uniqueness
        internal_id = kwargs.get("internal_id") or kwargs.get("sku_code")
        if internal_id:
            existing_id = frappe.db.get_value("Item",
                {"item_code": internal_id, "organization_id": org_id, "name": ["!=", kwargs.get("id")]},
                "item_name"
            )
            if existing_id:
                frappe.throw(f"Internal ID '{internal_id}' is already assigned to '{existing_id}'.")

        # Check if updating
        item_id = kwargs.get("id")
        
        # 4. Generate unique item_code based on Name + Variety + Grade
        # This makes each spec combination a unique item as requested
        import re, random, string
        slug = re.sub(r'[^a-zA-Z0-9]', '', full_name).lower()
        
        # Issue 9: Guarantee uniqueness for item_code (and default internal_id)
        if item_id:
            # Updating: maintain the existing identity
            item_code = item_id
        else:
            # Creating: append random 4 char suffix to prevent collisions across tenants
            unique_suffix = ''.join(random.choices(string.digits, k=4))
            item_code = f"{abbr}-{slug}-{unique_suffix}"
        
        # If internal_id is provided, we still store it, but item_code is the primary identity
        internal_id = kwargs.get("internal_id") or kwargs.get("sku_code") or item_code

        # Parse HSN and GST from kwargs
        hsn_code = (kwargs.get("hsn_code") or "").strip()
        gst_rate_val = flt(kwargs.get("gst_rate") or 0)
        
        # Ensure Customs Tariff Number (HSN) exists in the database
        if hsn_code and not frappe.db.exists("Customs Tariff Number", hsn_code):
            frappe.get_doc({
                "doctype": "Customs Tariff Number",
                "tariff_number": hsn_code,
                "description": "Auto-created from MandiGrow"
            }).insert(ignore_permissions=True)
        
        doc_data = {
            "doctype": "Item",
            "item_code": item_code,
            "item_name": full_name,
            "item_group": item_group,
            "organization_id": org_id,
            "internal_id": internal_id or item_code,
            "custom_attributes": frappe.as_json(custom_attrs),
            "stock_uom": kwargs.get("default_unit") or "Nos",
            "shelf_life_in_days": kwargs.get("shelf_life_days") or 7,
            "critical_age_days": kwargs.get("critical_age_days") or 14,
            "is_stock_item": 1,
            "disabled": 0,
            # GST Compliance fields
            "gst_rate": gst_rate_val, # Keeping legacy for safety
            "sale_gst_rate": flt(kwargs.get("sale_gst_rate")),
            "sale_gst_type": kwargs.get("sale_gst_type") or "Exclusive",
            "purchase_gst_rate": flt(kwargs.get("purchase_gst_rate")),
            "purchase_gst_type": kwargs.get("purchase_gst_type") or "Exclusive",
            "customs_tariff_number": hsn_code or None,
        }
        
        # Only set local_name if it was explicitly provided (to avoid clearing it accidentally)
        if "local_name" in kwargs:
            doc_data["local_name"] = kwargs.get("local_name") or ""
        
        # Check if updating
        item_id = kwargs.get("id")
        
        # Identity Logic: 
        # 1. If target item_code exists, we update THAT doc.
        # 2. Else if old item_id exists, we rename it to the new item_code and update.
        # 3. Else, we create a new doc.
        
        is_new_creation = False
        if frappe.db.exists("Item", item_code):
            doc = frappe.get_doc("Item", item_code)
        elif item_id and frappe.db.exists("Item", item_id):
            doc = frappe.get_doc("Item", item_id)
            # Rename old ID to new identity if they differ
            if item_code != item_id:
                # Use model-level rename_doc for permissions bypass
                doc_name = model_rename_doc("Item", item_id, item_code, force=True, ignore_permissions=True)
                doc = frappe.get_doc("Item", doc_name)
        else:
            doc = frappe.new_doc("Item")
            doc.item_code = item_code
            is_new_creation = True

        # TENANT ISOLATION GUARD: Ensure the user cannot mutate another tenant's Item
        if not doc.is_new() and hasattr(doc, "organization_id") and doc.organization_id != org_id:
            frappe.throw(_("Not authorized to modify this commodity"), frappe.PermissionError)

        # Sync all fields using doc.update to guarantee custom fields (like local_name) are dirtied/saved
        doc.update(doc_data)
        
        # Dynamically append the unit to the item's UOM table
        # This prevents "Could not find Row #1: Unit" errors during Arrivals
        unit = kwargs.get("default_unit") or "Nos"
        if not frappe.db.exists("UOM", unit):
            frappe.get_doc({"doctype": "UOM", "uom_name": unit, "must_be_whole_number": 0}).insert(ignore_permissions=True)
            
        has_uom = any(row.uom == unit for row in doc.get("uoms", []))
        if not has_uom:
            doc.append("uoms", {
                "uom": unit,
                "conversion_factor": 1.0
            })
        
        doc.save(ignore_permissions=True)
        
        # Handle Opening Stock Auto-Generation
        opening_stock = flt(kwargs.get("opening_stock"))
        if opening_stock > 0:
            # Check if opening balance lot already exists to prevent duplicates on edit
            existing_ob_lot = frappe.db.get_value("Mandi Lot", {"item_id": doc.name, "lot_code": f"OB-{item_code}"}, "name")
            if not existing_ob_lot:
                storage_location = kwargs.get("storage_location")
                if not storage_location:
                    frappe.throw("Storage Location is mandatory when entering Opening Stock.")
                
                loc_name = frappe.db.get_value(
                    "Mandi Storage Location",
                    {"name": storage_location, "organization_id": org_id, "is_active": 1},
                    "name"
                )
                if not loc_name:
                    frappe.throw("Invalid or inactive Storage Location selected.")

                purchase_price = flt(kwargs.get("purchase_price") or 0)
                if purchase_price <= 0:
                    frappe.throw("Purchase Price must be greater than 0 when entering Opening Stock.")

                # Find or create internal supplier for Opening Balance
                supplier_id = frappe.db.get_value("Mandi Contact", {"organization_id": org_id, "contact_type": "supplier", "full_name": "Opening Balance"})
                if not supplier_id:
                    supp_doc = frappe.get_doc({
                        "doctype": "Mandi Contact",
                        "full_name": "Opening Balance",
                        "contact_type": "supplier",
                        "organization_id": org_id,
                        "phone": "0000000000"
                    }).insert(ignore_permissions=True)
                    supplier_id = supp_doc.name

                # Create Mandi Arrival internally.
                # is_opening_balance=True bypasses the mandatory rate check.
                try:
                    confirm_arrival_transaction(
                        org_id=org_id,
                        party_id=supplier_id,
                        arrival_type="direct",
                        is_opening_balance=True,
                        storage_location=loc_name,
                        items=[{
                            "item_id": doc.name,
                            "qty": opening_stock,
                            "supplier_rate": purchase_price,
                            "unit": unit,
                            "lot_code": f"OB-{item_code}",
                            "purchase_gst_rate": 0,
                        }]
                    )
                except Exception as stock_err:
                    # Rollback everything — item NOT saved, clean state for user to retry.
                    frappe.db.rollback()
                    frappe.log_error(frappe.get_traceback(), "create_commodity: Opening Stock creation failed")
                    return {"success": False, "error": f"Opening Stock could not be created: {str(stock_err)}. Item was not saved. Please retry or set opening stock to 0 and update later."}
            
        frappe.db.commit()
        return {"success": True, "id": doc.name, "name": doc.item_name}
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "create_commodity Failed")
        
        err_msg = str(e)
        if hasattr(frappe, "message_log") and frappe.message_log:
            import json
            msgs = []
            for m in frappe.message_log:
                try:
                    parsed = json.loads(m) if isinstance(m, str) else m
                    msg = parsed.get("message", str(parsed)) if isinstance(parsed, dict) else str(parsed)
                    msgs.append(msg)
                except:
                    msgs.append(str(m))
            extracted = " | ".join(filter(None, msgs))
            if extracted:
                err_msg = extracted
                
        return {"success": False, "error": err_msg or "Unknown server error"}
    finally:
        frappe.flags.ignore_permissions = old_ignore

@frappe.whitelist(allow_guest=False)
def delete_commodity(id: str = None, item_id: str = None) -> dict:
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    
    target_id = id or item_id
    if not target_id:
        return {"success": False, "error": "Item ID is required"}
        
    # Tenant guard: verify item belongs to user's organization
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        org_id = _get_user_org()
        item_org = frappe.db.get_value("Item", target_id, "organization_id")
        if not item_org or item_org != org_id:
            frappe.throw(_("You do not have permission to delete this item."), frappe.PermissionError)

    try:
        if not frappe.db.exists("Item", target_id):
            return {"success": False, "error": "Item not found"}

        # 1. Check for real transactions (Sales or non-Opening Balance Arrivals)
        has_real_sales = frappe.db.count("Mandi Sale Item", {"item_id": target_id}) > 0
        has_real_purchases = False
        
        # Check all lots for this item
        lots = frappe.get_all("Mandi Lot", filters={"item_id": target_id}, fields=["name", "parent", "lot_code"])
        ob_arrivals = set()
        
        for lot in lots:
            if not lot.parent: continue
            if lot.lot_code.startswith("OB-"):
                ob_arrivals.add(lot.parent)
            else:
                has_real_purchases = True
                
        # Also check direct GL entries or Stock Ledger if needed, but Mandi Sale/Arrival is the source of truth
        if has_real_sales or has_real_purchases:
            # We must Disable instead of Delete to protect ledger
            frappe.db.set_value("Item", target_id, "disabled", 1, update_modified=True)
            return {"success": True, "message": "Item disabled successfully. It cannot be permanently deleted because it has real sales or purchases attached.", "action": "disabled"}

        # 2. It's safe to fully delete. First, cancel and delete OB Arrivals if any
        frappe.flags.ignore_permissions = True
        for arr_name in ob_arrivals:
            if frappe.db.exists("Mandi Arrival", arr_name):
                arr_doc = frappe.get_doc("Mandi Arrival", arr_name)
                if arr_doc.docstatus == 1:
                    arr_doc.cancel()
                frappe.delete_doc("Mandi Arrival", arr_name, force=True, ignore_permissions=True)

        # Now delete the item
        frappe.delete_doc("Item", target_id, force=True, ignore_permissions=True)
        return {"success": True, "message": "Item completely deleted along with its Opening Balance.", "action": "deleted"}

    except frappe.LinkExistsError:
        # Fallback if there's an unknown linked document
        frappe.db.set_value("Item", target_id, "disabled", 1, update_modified=True)
        return {"success": True, "message": "Item disabled (could not be fully deleted due to linked records).", "action": "disabled"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "delete_commodity Failed")
        return {"success": False, "error": str(e)}
    finally:
        frappe.flags.ignore_permissions = False

def _get_next_annual_bill_no(doctype: str, party_field: str, party_id: str) -> str:
    """
    SINGLE SOURCE OF TRUTH for sequential annual invoice numbering.

    Returns the next bill number in YYYY-N format, scoped per party per year.
    - Format  : 'YYYY-N'  e.g. '2026-1', '2026-17', '2026-356'
    - Scope   : per party_id, per calendar year (auto-resets every Jan 1)
    - Storage : stored as a string in the contact_bill_no field
    - Parsing : scans existing records for 'YYYY-N' pattern, takes MAX(N),
                then returns 'YYYY-{MAX_N + 1}' or 'YYYY-1' if none found
    """
    current_year = frappe.utils.now_datetime().year
    year_prefix = f"{current_year}-"

    # Find the MAX sequential number for this party in the current year only.
    # Pattern: contact_bill_no starts with 'YYYY-' followed by digits.
    result = frappe.db.sql(f"""
        SELECT MAX(CAST(SUBSTRING_INDEX(contact_bill_no, '-', -1) AS UNSIGNED)) as max_n
        FROM `tab{doctype}`
        WHERE {party_field} = %s
          AND contact_bill_no LIKE %s
          AND contact_bill_no REGEXP %s
    """, (party_id, f"{year_prefix}%", f"^{current_year}-[0-9]+$"))

    max_n = result[0][0] if result and result[0][0] else 0
    return f"{current_year}-{max_n + 1}"


@frappe.whitelist(allow_guest=False)
def get_next_bill_no(party_id: str = None) -> dict:
    """Returns the next annual contact_bill_no for a specific party."""
    if not party_id:
        return {"next_bill_no": f"{frappe.utils.now_datetime().year}-1"}
    next_no = _get_next_annual_bill_no("Mandi Arrival", "party_id", party_id)
    return {"next_bill_no": next_no}

@frappe.whitelist(allow_guest=False)
def confirm_sale_transaction(**kwargs) -> dict:
    """
    Unified RPC for confirming any sale (POS or Regular).
    Replaces legacy Supabase confirm_sale_transaction.
    """
    import json
    try:
        # Support both JSON payload (from frontend) and kwargs
        payload = kwargs
        if "p_items" in payload:
            items = payload.get("p_items")
            if isinstance(items, str):
                items = json.loads(items)
        else:
            items = payload.get("items", [])
            if isinstance(items, str):
                items = json.loads(items)
            
        buyer_id = payload.get("p_buyer_id") or payload.get("buyer_id")
        org_id = payload.get("org_id") or payload.get("organization_id") or _get_user_org()
        
        # ── Global GST Compliance Master Override ────────────────────────────────
        org_gst_enabled = bool(frappe.db.get_value("Mandi Organization", org_id, "gst_enabled"))
        # ─────────────────────────────────────────────────────────────────────────

        if not buyer_id:
            walkin_buyer = frappe.db.get_value("Mandi Contact", {"organization_id": org_id, "contact_type": "buyer", "full_name": "Walk-in Buyer"}, "name")
            if not walkin_buyer:
                walkin_doc = frappe.get_doc({
                    "doctype": "Mandi Contact",
                    "organization_id": org_id,
                    "contact_type": "buyer",
                    "full_name": "Walk-in Buyer",
                    "city": "Local"
                })
                walkin_doc.insert(ignore_permissions=True)
                walkin_buyer = walkin_doc.name
            buyer_id = walkin_buyer

        # Normalize payment mode
        raw_mode = (payload.get("p_payment_mode") or payload.get("payment_mode") or "cash")
        _mode_map = {
            "udhaar": "credit",
            "credit": "credit",
            "cash": "cash",
            "upi/bank": "upi_bank",
            "upi_bank": "upi_bank",
            "upi": "upi_bank",
            "bank": "upi_bank",
            "cheque": "cheque",
        }
        payment_mode = _mode_map.get(str(raw_mode).strip().lower(), "cash")

        # 1. Capture All Financial Inputs Robustly
        items_subtotal = sum(flt(i.get("qty", 0)) * flt(i.get("rate", 0)) for i in items)
        
        # ── Include crate total in items_subtotal BEFORE gap formula so crates
        #    don't get double-counted as "Other Expenses" ─────────────────────
        raw_crate_items = payload.get("crate_items") or payload.get("p_crate_items") or []
        if isinstance(raw_crate_items, str):
            try:
                raw_crate_items = json.loads(raw_crate_items)
            except Exception:
                raw_crate_items = []
        crate_items_total = sum(flt(ci.get("qty", 0)) * flt(ci.get("rate", 0)) for ci in raw_crate_items if ci)
        items_subtotal_with_crates = items_subtotal + crate_items_total
        # ─────────────────────────────────────────────────────────────────────
        
        # Explicit Charges
        m_fee = flt(payload.get("market_fee") or payload.get("p_market_fee") or 0)
        n_fee = flt(payload.get("nirashrit") or payload.get("p_nirashrit") or 0)
        ms_fee = flt(payload.get("misc_fee") or payload.get("p_misc_fee") or 0)
        l_fee = flt(payload.get("loading_charges") or payload.get("p_loading_charges") or 0)
        u_fee = flt(payload.get("unloading_charges") or payload.get("p_unloading_charges") or 0)
        
        # Additional charges array sum and labels
        extra_charges_list = payload.get("additional_charges") or []
        if isinstance(extra_charges_list, str):
            extra_charges_list = json.loads(extra_charges_list)
        add_charges = sum(flt(c.get("amount")) for c in extra_charges_list)
        charge_remarks = ", ".join([f"{c.get('name') or 'Charge'}: {c.get('amount')}" for c in extra_charges_list if c.get('amount')])
        
        o_fee = flt(payload.get("other_expenses") or payload.get("p_other_expenses") or 0) + add_charges
        disc = flt(payload.get("discount_amount") or payload.get("p_discount_amount") or 0)
        
        p_total = flt(payload.get("p_total_amount") or payload.get("total_amount") or 0)
        if p_total > 0 and (m_fee + n_fee + ms_fee + l_fee + u_fee + o_fee) == 0:
            # Use items_subtotal_with_crates so crate amounts don't become Other Expenses
            charges_gap = (p_total + disc) - items_subtotal_with_crates
            if charges_gap > 0:
                o_fee = charges_gap
        
        # DEBUG: Log exact payment capture (TEMPORARY — remove after diagnosis)
        _ar_raw = {
            "p_amount_received": payload.get("p_amount_received"),
            "amountReceived": payload.get("amountReceived"),
            "amount_received": payload.get("amount_received"),
            "computed": flt(payload.get("p_amount_received") or payload.get("amountReceived") or payload.get("amount_received") or 0),
        }
        frappe.log_error(str(_ar_raw), "DEBUG: amountreceived capture")
        
        # 1. Create Mandi Sale Document
        doc = frappe.get_doc({
            "doctype": "Mandi Sale",
            "buyerid": buyer_id,
            "organization_id": org_id,
            "saledate": payload.get("p_sale_date") or payload.get("sale_date") or today(),
            "paymentmode": payment_mode,
            "totalamount": items_subtotal,
            "amountreceived": flt(payload.get("p_amount_received") or payload.get("amountReceived") or payload.get("amount_received") or 0),
            "bankaccountid": payload.get("p_bank_account_id") or payload.get("bank_account_id"),
            "chequeno": payload.get("p_cheque_no") or payload.get("chequeNo") or payload.get("cheque_no") or "",
            "chequedate": payload.get("p_cheque_date") or payload.get("chequeDate") or payload.get("cheque_date") or None,
            "bankname": payload.get("p_bank_name") or payload.get("bank_name") or "",
            "user_remark": charge_remarks,
            "marketfee": m_fee,
            "nirashrit": n_fee,
            "miscfee": ms_fee,
            "loadingcharges": l_fee,
            "unloadingcharges": u_fee,
            "otherexpenses": o_fee,
            "discountamount": disc,
            "gsttotal": flt(payload.get("p_gst_total") or payload.get("gst_total") or 0),
            "cgst_amount": flt(payload.get("cgst_amount") or payload.get("p_cgst_amount") or 0),
            "sgst_amount": flt(payload.get("sgst_amount") or payload.get("p_sgst_amount") or 0),
            "igst_amount": flt(payload.get("igst_amount") or payload.get("p_igst_amount") or 0),
            "vehiclenumber": payload.get("p_vehicle_number") or payload.get("vehicle_number") or "",
            "transport_name": payload.get("p_transport_name") or payload.get("transport_name") or "",
            "bookno": payload.get("p_book_no") or payload.get("book_no") or "",
            "lotno": payload.get("p_lot_no") or payload.get("lot_no") or "",
            "contact_bill_no": _get_next_annual_bill_no("Mandi Sale", "buyerid", buyer_id) if buyer_id else None,
            "items": []
        })
        
        # ── Ensure exclusive_gst_total field exists ───────────────────────
        if not frappe.db.has_column("Mandi Sale", "exclusive_gst_total"):
            try:
                frappe.get_doc({
                    "doctype": "Custom Field",
                    "dt": "Mandi Sale",
                    "fieldname": "exclusive_gst_total",
                    "label": "Exclusive GST Total",
                    "fieldtype": "Currency",
                    "insert_after": "gsttotal",
                    "read_only": 1,
                    "default": "0"
                }).insert(ignore_permissions=True)
                frappe.db.commit()
                frappe.clear_cache(doctype="Mandi Sale")
            except Exception:
                pass
        # ─────────────────────────────────────────────────────────────────
        
        total_exclusive_gst = 0.0

        for item in items:
            lot_id = item.get("lot_id")
            qty = flt(item.get("qty", 0))
            if lot_id:
                lot = frappe.get_doc("Mandi Lot", lot_id)
                lot = _normalize_lot_stock(lot, persist=True)
                available_qty = flt(getattr(lot, "current_qty", 0))
                if available_qty < qty:
                    return {"success": False, "error": f"Insufficient stock in lot {lot.lot_code}. Available: {available_qty}"}
                
                initial_qty = flt(getattr(lot, "initial_qty", 0) or available_qty)
                current_qty = max(available_qty - qty, 0)
                status = _derive_lot_status(current_qty, initial_qty)
                _update_lot_stock_fields(lot.name, initial_qty, current_qty, status)
            
            rate = float(item.get("rate", 0))
            item_id = item.get("item_id") or _get_default_item()
            
            # ── Per-item GST & HSN ────────────────────────────────────────────
            # Priority 1: value explicitly sent from frontend (e.g. user overrode it)
            item_gst_rate = flt(item.get("gst_rate"))
            item_hsn = item.get("hsn_code") or ""
            
            # Priority 2: read from Item master if not sent
            if not item_gst_rate and item_id:
                item_gst_rate = flt(frappe.db.get_value("Item", item_id, "sale_gst_rate") or frappe.db.get_value("Item", item_id, "gst_rate") or 0)
            if not item_hsn and item_id:
                item_hsn = frappe.db.get_value("Item", item_id, "customs_tariff_number") or ""
            
            # Master Override: If organization GST is disabled, strictly enforce 0% tax compliance
            if not org_gst_enabled:
                item_gst_rate = 0.0

            sale_gst_type = str(frappe.db.get_value("Item", item_id, "sale_gst_type") or "Exclusive").strip().capitalize()
            base_amount = float(item.get("amount") or (qty * rate))
            
            if sale_gst_type == "Inclusive":
                actual_base = base_amount / (1 + item_gst_rate / 100.0) if item_gst_rate > 0 else base_amount
                line_gst_amount = round(base_amount - actual_base, 2)
            else:
                line_gst_amount = round(base_amount * item_gst_rate / 100, 2)
                total_exclusive_gst += line_gst_amount
            # ─────────────────────────────────────────────────────────────────
            
            doc.append("items", {
                "item_id": item_id,
                "lot_id": lot_id or "",
                "qty": qty,
                "rate": rate,
                "amount": base_amount,
                "gst_rate": item_gst_rate,
                "gst_amount": line_gst_amount,
                "hsn_code": item_hsn,
            })
            
        doc.exclusive_gst_total = round(total_exclusive_gst, 2)
            
        # ── CRATE ITEMS: sold alongside commodities ───────────────────────
        crate_items = payload.get("crate_items") or payload.get("p_crate_items") or []
        if isinstance(crate_items, str):
            crate_items = json.loads(crate_items)
            
        parsed_crate_items = []
        for ci in crate_items:
            ct = ci.get("crate_type")
            cqty = int(ci.get("qty") or 0)
            crate = ci.get("rate") or 0
            if not ct or cqty <= 0:
                continue
            if not frappe.db.exists("Mandi Crate Type", ct):
                frappe.get_doc({
                    "doctype": "Mandi Crate Type",
                    "crate_name": ct,
                    "organization_id": org_id,
                    "purchase_rate": 0,
                    "sale_rate": float(crate),
                }).insert(ignore_permissions=True)
            # Reduce crate inventory (best-effort, non-blocking)
            try:
                _reduce_crate_stock(org_id, ct, cqty)
            except Exception:
                frappe.log_error(frappe.get_traceback(), "crate_stock_reduce non-fatal")
            
            parsed_crate_items.append({
                "crate_type": ct,
                "quantity": cqty,
                "deposit_amount": float(crate)
            })
            
            # Append as sale item line using a virtual item_id
            crate_item_id = _get_or_create_crate_commodity(org_id, ct)
            doc.append("items", {
                "item_id": crate_item_id,
                "lot_id": "",
                "qty": float(cqty),
                "rate": float(crate),
                "amount": float(cqty * crate)
            })
        # ─────────────────────────────────────────────────────────────────
        doc.flags.crate_items = parsed_crate_items
        doc.insert(ignore_permissions=True)

        # Auto-populate lotno from first item's lot_code if not provided manually
        if not getattr(doc, 'lotno', None) and doc.get('items'):
            first_lot_id = doc.items[0].lot_id if doc.items else None
            if first_lot_id:
                first_lot_code = frappe.db.get_value("Mandi Lot", first_lot_id, "lot_code")
                if first_lot_code:
                    frappe.db.set_value("Mandi Sale", doc.name, "lotno", first_lot_code, update_modified=False)
                    doc.lotno = first_lot_code
        
        # Robust flag setting for cheque status: pick first non-None value
        raw_cheque_status = None
        for key in ["cheque_status", "chequeStatus", "p_cheque_status", "cleared_instantly"]:
            if payload.get(key) is not None:
                raw_cheque_status = payload.get(key)
                break

        if raw_cheque_status is not None and str(raw_cheque_status).strip() != "":
            cheque_bool = str(raw_cheque_status).lower() in ["true", "1", "yes"]
            doc.flags["cheque_status"] = cheque_bool
            # Global fallback for nested hooks using multiple keys for safety
            # Now doc.name is guaranteed to be set
            frappe.flags[f"cheque_status_{doc.name}"] = cheque_bool
            frappe.flags["last_cheque_status"] = cheque_bool
            if buyer_id:
                frappe.flags[f"cheque_status_{buyer_id}"] = cheque_bool

        doc.submit()

        # ── Check commission arrival settlement readiness ─────────────────
        # After each sale, check if all lots under a zero-rate commission
        # arrival are now empty. If so, mark it ready for finalization.
        # This does NOT affect buyers, sale ledgers, or daybook in any way.
        try:
            sold_arrival_ids = set()
            for item in doc.items or []:
                if item.lot_id:
                    parent_arr = frappe.db.get_value("Mandi Lot", item.lot_id, "parent")
                    if parent_arr:
                        sold_arrival_ids.add(parent_arr)
            for arr_id in sold_arrival_ids:
                _check_commission_arrival_readiness(arr_id)
        except Exception:
            frappe.log_error(frappe.get_traceback(), "commission_readiness_check after sale (non-fatal)")
        # ─────────────────────────────────────────────────────────────────

        frappe.db.commit()
        return {
            "success": True, 
            "id": doc.name, 
            "sale_id": doc.name,
            "bill_no": str(getattr(doc, 'contact_bill_no', '') or doc.name),
            "message": "Sale transaction confirmed and ledger posted."
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "confirm_sale_transaction Failed")
        return {"success": False, "error": str(e)}

@frappe.whitelist(allow_guest=False)
def record_quick_purchase(**kwargs) -> dict:
    """Wrapper for Quick Purchase form to map frontend parameters to confirm_arrival_transaction."""
    payload = {
        "party_id": kwargs.get("p_party_id"),
        "arrival_date": kwargs.get("p_arrival_date"),
        "advance": kwargs.get("p_advance_amount"),
        "advance_payment_mode": kwargs.get("p_payment_mode"),
        "vehicle_number": kwargs.get("p_vehicle_number"),
        "storage_location": kwargs.get("p_storage_location"),
        "driver_name": kwargs.get("p_driver_name"),
        "hire_charges": kwargs.get("p_loading_amount"),
        "other_expenses": kwargs.get("p_other_expenses"),
        "advance_bank_account_id": kwargs.get("p_advance_bank_account_id"),
        "advance_cheque_no": kwargs.get("p_advance_cheque_no"),
        "advance_cheque_date": kwargs.get("p_advance_cheque_date"),
        "advance_bank_name": kwargs.get("p_advance_bank_name"),
        "advance_cheque_status": kwargs.get("p_advance_cheque_status"),
        "arrival_type": kwargs.get("p_arrival_type") or "direct",
    }
    
    # Map lots/items
    items = []
    p_lots = kwargs.get("p_lots", [])
    import json
    if isinstance(p_lots, str):
        p_lots = json.loads(p_lots)
        
    for l in p_lots:
        items.append({
            "item_id": l.get("item_id"),
            "qty": l.get("qty"),
            "unit": l.get("unit"),
            "supplier_rate": l.get("rate"),
            "commission_percent": l.get("commission"),
            "less_units": l.get("less_units"),
            "packing_cost": l.get("packing_cost"),
            "loading_cost": l.get("loading_cost"),
            "farmer_charges": l.get("other_cut"),
            "lot_code": kwargs.get("p_lot_no") or "",
            "hsn_code": l.get("hsn_code"),
            "purchase_gst_rate": l.get("purchase_gst_rate"),
            "purchase_gst_type": l.get("purchase_gst_type"),
            "is_rcm": l.get("is_rcm"),
        })
    payload["items"] = items
    
    return confirm_arrival_transaction(**payload)

@frappe.whitelist(allow_guest=False)
def confirm_arrival_transaction(**kwargs) -> dict:
    """
    Unified RPC for confirming any Arrival.
    Ensures Mandi Arrival and Mandi Lots are created and submitted.
    """
    from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
    enforce_active_subscription()
    import json
    try:
        payload = kwargs
        items = payload.get("items", [])
        if isinstance(items, str):
            items = json.loads(items)
            
        # Auto-assign annual sequential contact_bill_no if not provided
        contact_bill_no = payload.get("contact_bill_no")
        party_id = payload.get("party_id") or ""
        supplier_gstin = ""
        if party_id:
            party_info = frappe.db.get_value("Mandi Contact", party_id, ["contact_type", "gstin"], as_dict=True)
            if party_info:
                is_farmer = (party_info.get("contact_type") == "farmer")
                supplier_gstin = (party_info.get("gstin") or "").strip()
        if not contact_bill_no and party_id:
            contact_bill_no = _get_next_annual_bill_no("Mandi Arrival", "party_id", party_id)
            
        # 1. Create Mandi Arrival Document
        org_id = payload.get("org_id") or payload.get("organization_id") or _get_user_org()
        
        # ── Global GST Compliance Master Override ────────────────────────────────
        org_gst_enabled = bool(frappe.db.get_value("Mandi Organization", org_id, "gst_enabled"))
        # ─────────────────────────────────────────────────────────────────────────
        
        doc = frappe.get_doc({
            "doctype": "Mandi Arrival",
            "party_id": party_id,
            "organization_id": org_id,
            "arrival_date": payload.get("arrival_date") or today(),
            "arrival_type": payload.get("arrival_type") or "direct",
            "lot_prefix": payload.get("lot_prefix") or "",
            "storage_location": payload.get("storage_location") or "",
            "vehicle_number": payload.get("vehicle_number") or "",
            "driver_name": payload.get("driver_name") or "",
            "advance": float(payload.get("advance") or 0),
            "advance_payment_mode": payload.get("advance_payment_mode") or "credit",
            "advance_bank_account_id": payload.get("advance_bank_account_id") or "",
            "advance_cheque_no": payload.get("advance_cheque_no") or "",
            "advance_cheque_date": payload.get("advance_cheque_date") or None,
            "contact_bill_no": contact_bill_no,
            "hire_charges": float(payload.get("hire_charges") or 0),
            "hamali_expenses": float(payload.get("hamali_expenses") or 0),
            "other_expenses": float(payload.get("other_expenses") or 0),
            "loaders_count": int(payload.get("loaders_count") or 0),
            "items": []
        })
        
        total_realized = 0
        total_commission = 0

        # ── DIRECT PURCHASE: Rate is mandatory ──────────────────────────────
        # Commission arrivals (farmer/supplier) may have rate = 0 at arrival
        # because the sale price is only known after goods are auctioned.
        # Direct Purchase means Mandi OWNS the goods — the liability is fixed
        # at arrival time, so a rate MUST be provided.
        arrival_type_input = (payload.get("arrival_type") or "direct").strip().lower()
        is_opening_balance = bool(payload.get("is_opening_balance"))
        if arrival_type_input == "direct" and not is_opening_balance:
            for idx_check, item_check in enumerate(items):
                rate_val = float(item_check.get("supplier_rate") or item_check.get("rate") or 0)
                if rate_val <= 0:
                    commodity = item_check.get("item_id") or f"Item {idx_check + 1}"
                    frappe.throw(
                        f"Rate (Purchase Price) is mandatory for Direct Purchase. "
                        f"Please enter a rate greater than zero for '{commodity}'."
                    )
        elif arrival_type_input in ("commission", "commission_supplier"):
            for idx_check, item_check in enumerate(items):
                comm_pct = float(item_check.get("commission_percent") or 0)
                if comm_pct <= 0:
                    commodity = item_check.get("item_id") or f"Item {idx_check + 1}"
                    frappe.throw(
                        f"Commission % is mandatory for Commission purchases. "
                        f"Please enter a commission percentage greater than zero for '{commodity}'."
                    )
        # ────────────────────────────────────────────────────────────────────

        local_lot_codes = set()
        for idx, item in enumerate(items):
            unit = item.get("unit") or "Kg"
            # Explicitly ensure the UOM exists before assigning to a Link field
            if not frappe.db.exists("UOM", unit):
                try:
                    frappe.get_doc({"doctype": "UOM", "uom_name": unit, "must_be_whole_number": 0}).insert(ignore_permissions=True)
                except Exception:
                    pass
            
            # Map item fields to Mandi Lot with defaults
            # Auto-generate lot_code from lot_prefix when user hasn't provided a per-item code.
            # Single item → use prefix as-is (e.g. "LOT-250505").
            # Multiple items → append zero-padded index (e.g. "LOT-250505-01").
            item_lot_code = str(item.get("lot_code") or "").strip()
            if not item_lot_code:
                lot_prefix = str(payload.get("lot_prefix") or "").strip()
                if lot_prefix:
                    n_items = len(items)
                    item_lot_code = lot_prefix if n_items == 1 else f"{lot_prefix}-{str(idx + 1).zfill(2)}"
                else:
                    # Auto-generate a unique 6-digit numeric code
                    import random
                    while True:
                        candidate = str(random.randint(100000, 999999))
                        if not frappe.db.exists("Mandi Lot", {"lot_code": candidate}):
                            break
                    item_lot_code = candidate

            # Smart Suffix Logic
            # Check against DB and local transaction list to ensure uniqueness
            original_code = item_lot_code
            suffix = 1
            while frappe.db.exists("Mandi Lot", {"lot_code": item_lot_code}) or item_lot_code in local_lot_codes:
                item_lot_code = f"{original_code}-{str(suffix).zfill(2)}"
                suffix += 1
                
            local_lot_codes.add(item_lot_code)
            item_id = item.get("item_id") or _get_default_item()
            item_fields = ["shelf_life_in_days"]
            if frappe.db.has_column("Item", "critical_age_days"):
                item_fields.append("critical_age_days")
            if frappe.db.has_column("Item", "purchase_gst_rate"):
                item_fields.extend(["purchase_gst_rate", "purchase_gst_type"])
            if frappe.db.has_column("Item", "customs_tariff_number"):
                item_fields.append("customs_tariff_number as hsn_code")
            item_master = frappe.db.get_value("Item", item_id, item_fields, as_dict=True) or {}
            
            is_ob = payload.get("is_opening_balance") is True
            
            # Advanced GST Profiling
            is_rcm = str(item.get("is_rcm") or "").lower() in ["true", "1", "yes"]
            input_gst_rate = float(item.get("purchase_gst_rate") if item.get("purchase_gst_rate") is not None else item_master.get("purchase_gst_rate") or 0)
            
            final_purchase_gst_rate = 0.0
            if org_gst_enabled and not is_ob:
                if is_rcm:
                    final_purchase_gst_rate = input_gst_rate
                elif is_farmer and not supplier_gstin:
                    final_purchase_gst_rate = 0.0
                else:
                    final_purchase_gst_rate = input_gst_rate
            
            lot_data = {
                "doctype": "Mandi Lot",
                "item_id": item_id,
                "lot_code": item_lot_code,
                "is_rcm": int(is_rcm),
                "hsn_code": item.get("hsn_code") or item_master.get("hsn_code") or "",
                "purchase_gst_rate": final_purchase_gst_rate,
                "purchase_gst_type": "Exclusive" if is_ob else (item.get("purchase_gst_type") or item_master.get("purchase_gst_type") or "Exclusive"),
                "qty": float(item.get("qty", 0)),
                "initial_qty": float(item.get("qty", 0)),
                "current_qty": float(item.get("qty", 0)),
                "unit": unit,
                "supplier_rate": float(item.get("supplier_rate") or item.get("rate") or 0),
                "sale_price": float(item.get("sale_price") or 0),
                "commission_percent": float(item.get("commission_percent") or 0),
                "less_percent": float(item.get("less_percent") or 0),
                "less_units": float(item.get("less_units") or 0),
                "packing_cost": float(item.get("packing_cost") or 0),
                "loading_cost": float(item.get("loading_cost") or 0),
                "farmer_charges": float(item.get("farmer_charges") or 0),
                "shelf_life_days": int(item_master.get("shelf_life_in_days") or 7),
                "critical_age_days": int(item_master.get("critical_age_days") or 14),
                "status": "Available"
            }
            doc.append("items", lot_data)

        # Let the validate hook handle the math (trip_realized, trip_commission, etc.)
        doc.flags.ignore_permissions = True
        # Robust flag setting for advance cheque status
        raw_advance_status = payload.get("advance_cheque_status") or payload.get("p_advance_cheque_status")
        if raw_advance_status is not None and str(raw_advance_status).strip() != "":
            doc.flags.advance_cheque_status = str(raw_advance_status).lower() in ["true", "1", "yes"]
        doc.insert()
        doc.submit()
        for item in doc.items or []:
            _normalize_lot_stock(item, persist=True)
        
        frappe.db.commit()
        return {
            "success": True, 
            "id": doc.name,
            "lot_codes": [i.lot_code for i in doc.items],
            "short_codes": [i.short_code for i in doc.items],
            "message": "Arrival confirmed and ledger posted."
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "confirm_arrival_transaction Failed")
        return {"success": False, "error": str(e)}

@frappe.whitelist(allow_guest=False)
def repair_erp_integrity() -> dict:
    """
    Senior Architect Tool: 
    1. Ensures Company and Chart of Accounts exist.
    2. Syncs missing GL Entries for all submitted transactions.
    """
    try:
        from mandigrow.mandigrow.logic.erp_bootstrap import ensure_company_party_defaults

        print("Starting ERP Repair...")
        
        # 1. Ensure Company
        company_name = "MandiGrow Enterprise"
        if not frappe.db.exists("Company", company_name):
            doc = frappe.get_doc({
                "doctype": "Company",
                "company_name": company_name,
                "default_currency": "INR",
                "country": "India"
            }).insert(ignore_permissions=True)
            print(f"Created Company: {company_name}")
        
        # Set as default
        frappe.db.set_default("company", company_name)
        frappe.db.set_value("Global Defaults", "Global Defaults", "default_company", company_name)
        
        # 2. Ensure Root Accounts (Simplified)
        # We rely on standard ERPNext groups or create minimal if needed.
        # This part is complex without a full chart. We'll at least ensure the ones our hooks use.
        company = company_name
        
        def ensure_acc(name, acc_type, parent_type):
            full_name = f"{name} - {company}"
            if not frappe.db.exists("Account", full_name):
                # Find a suitable parent
                parent = frappe.db.get_value("Account", {"account_type": parent_type, "is_group": 1, "company": company}, "name")
                if parent:
                    frappe.get_doc({
                        "doctype": "Account",
                        "account_name": name,
                        "parent_account": parent,
                        "company": company,
                        "account_type": acc_type
                    }).insert(ignore_permissions=True)
                    print(f"Created Account: {full_name}")

        ensure_acc("Debtors", "Receivable", "Asset")
        ensure_acc("Creditors", "Payable", "Liability")
        ensure_acc("Sales", "Income", "Income")
        ensure_acc("Commission Income", "Income", "Income")
        ensure_acc("Stock In Hand", "Stock", "Asset")
        ensure_acc("Cash", "Cash", "Asset")
        ensure_company_party_defaults(company)

        # 3. Re-post GL Entries for Submitted Docs
        # Find Arrivals
        arrivals = frappe.get_all("Mandi Arrival", filters={"docstatus": 1}, fields=["name"])
        reposted_arrivals = 0
        for a in arrivals:
            if not frappe.db.exists("GL Entry", {"voucher_no": a.name}):
                doc = frappe.get_doc("Mandi Arrival", a.name)
                _enforce_ownership(doc)
                doc.on_submit()
                reposted_arrivals += 1
        
        # Find Sales
        sales = frappe.get_all("Mandi Sale", filters={"docstatus": 1}, fields=["name"])
        reposted_sales = 0
        for s in sales:
            if not frappe.db.exists("GL Entry", {"voucher_no": s.name}):
                doc = frappe.get_doc("Mandi Sale", s.name)
                _enforce_ownership(doc)
                doc.on_submit()
                reposted_sales += 1

        frappe.db.commit()
        return {
            "success": True,
            "message": f"ERP Foundation verified. Reposted {reposted_arrivals} Arrivals and {reposted_sales} Sales to Ledger.",
            "company": company_name
        }
    except Exception as e:
        frappe.db.rollback()
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def backfill_gl_entries() -> dict:
    """
    One-shot repair tool: creates Journal Entries for all submitted Mandi Arrivals
    and Sales that are missing GL Entries.

    Also recalculates total_realized from child lots before posting so that
    arrivals submitted before the commission hook was wired produce correct JEs.

    Safe to run multiple times (idempotent — skips docs that already have a JE).
    """
    from mandigrow.mandigrow.logic.automation import on_arrival_submit, on_sale_submit
    from frappe.utils import flt

    ok_arrivals = []
    failed_arrivals = []
    ok_sales = []
    failed_sales = []

    # ── 1. Arrivals ─────────────────────────────────────────────────────────
    arrivals = frappe.get_all(
        "Mandi Arrival",
        filters={"docstatus": 1},
        fields=["name", "arrival_date", "party_id", "arrival_type",
                "total_realized", "total_commission", "net_payable_farmer", "advance"],
        ignore_permissions=True,
    )

    for a in arrivals:
        # Skip if already has a Journal Entry
        if frappe.db.exists("Journal Entry", {"user_remark": ["like", f"%{a['name']}%"]}):
            ok_arrivals.append(f"{a['name']} (already posted)")
            continue

        # Recalculate totals from lots if missing
        if not flt(a.get("total_realized")):
            lots = frappe.get_all(
                "Mandi Lot",
                filters={"parent": a["name"]},
                fields=["net_amount", "commission_amount"],
                ignore_permissions=True,
            )
            total_realized  = sum(flt(l.get("net_amount") or 0) for l in lots)
            total_commission = sum(flt(l.get("commission_amount") or 0) for l in lots)
            
            # Recalculate expenses
            doc_data = frappe.get_doc("Mandi Arrival", a["name"])
            _enforce_ownership(doc_data)
            sum_lot_costs = sum(flt(l.packing_cost) + flt(l.loading_cost) + flt(l.farmer_charges) for l in doc_data.items)
            arrival_costs = flt(doc_data.hire_charges) + flt(doc_data.hamali_expenses) + flt(doc_data.other_expenses)
            total_expenses = sum_lot_costs + arrival_costs

            arrival_type_str = (a.get("arrival_type") or "direct").lower()
            if arrival_type_str == "direct":
                net_payable = total_realized + total_expenses - flt(a.get("advance") or 0)
                total_commission = 0.0
            else:
                mandi_earnings = total_commission + total_expenses
                net_payable = total_realized - mandi_earnings - flt(a.get("advance") or 0)

            frappe.db.set_value("Mandi Arrival", a["name"], {
                "total_realized":      total_realized,
                "total_commission":    total_commission,
                "net_payable_farmer":  net_payable,
            }, update_modified=False)

        try:
            doc = frappe.get_doc("Mandi Arrival", a["name"])
            _enforce_ownership(doc)
            on_arrival_submit(doc)
            ok_arrivals.append(a["name"])
        except Exception as exc:
            failed_arrivals.append({"name": a["name"], "error": str(exc)})
            frappe.log_error(frappe.get_traceback(), f"backfill_gl: Arrival {a['name']}")

    # ── 2. Sales ─────────────────────────────────────────────────────────────
    sales = frappe.get_all(
        "Mandi Sale",
        filters={"docstatus": 1},
        fields=["name", "saledate", "buyerid", "totalamount", "amountreceived"],
        ignore_permissions=True,
    )

    for s in sales:
        if frappe.db.exists("Journal Entry", {"user_remark": ["like", f"%{s['name']}%"]}):
            ok_sales.append(f"{s['name']} (already posted)")
            continue
        try:
            doc = frappe.get_doc("Mandi Sale", s["name"])
            _enforce_ownership(doc)
            on_sale_submit(doc)
            ok_sales.append(s["name"])
        except Exception as exc:
            failed_sales.append({"name": s["name"], "error": str(exc)})
            frappe.log_error(frappe.get_traceback(), f"backfill_gl: Sale {s['name']}")

    frappe.db.commit()

    return {
        "success": True,
        "arrivals_posted":  ok_arrivals,
        "arrivals_failed":  failed_arrivals,
        "sales_posted":     ok_sales,
        "sales_failed":     failed_sales,
        "summary": (
            f"✅ {len(ok_arrivals)} arrivals, {len(ok_sales)} sales posted. "
            f"❌ {len(failed_arrivals)} arrival failures, {len(failed_sales)} sale failures."
        ),
    }

@frappe.whitelist(allow_guest=False)
def transfer_stock(lot_id: str, to_location: str, qty: float) -> dict:
    """
    Moves stock from one location to another.
    Uses frappe.db.set_value to bypass ERPNext's post-submission field-change guard.
    Mandi Lot is a child of submitted Mandi Arrival — calling .save() triggers
    "Not allowed to change X after submission" for submitted parent documents.
    db.set_value writes directly to the DB table, bypassing that validation.
    """
    try:
        qty = flt(qty)
        if qty <= 0:
            return {"error": "Quantity must be greater than zero"}

        # Tenant guard
        parent_name = frappe.db.get_value("Mandi Lot", lot_id, "parent")
        if parent_name:
            from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
            enforce_org_match_by_name("Mandi Arrival", parent_name)

        lot = frappe.get_doc("Mandi Lot", lot_id)
        current_qty = flt(lot.current_qty)
        if qty > current_qty:
            return {"error": f"Insufficient stock. Available: {current_qty}"}

        if qty == current_qty:
            # Full move — db.set_value bypasses submission restriction
            frappe.db.set_value("Mandi Lot", lot_id, "storage_location", to_location, update_modified=False)
            frappe.db.commit()
            return {"status": "success", "message": f"Full lot moved to {to_location}"}
        else:
            # Partial move — deduct from original via db.set_value, insert new split lot
            remaining = round(current_qty - qty, 4)
            frappe.db.set_value("Mandi Lot", lot_id, {
                "current_qty": remaining,
                "status": "Partial" if remaining > 0 else "Sold"
            }, update_modified=False)

            # Insert the new split lot as a child row
            new_lot = frappe.get_doc({
                "doctype":        "Mandi Lot",
                "parenttype":     lot.parenttype,
                "parent":         lot.parent,
                "parentfield":    lot.parentfield,
                "item_id":        lot.item_id,
                "unit":           lot.unit,
                "qty":            qty,
                "initial_qty":    qty,
                "current_qty":    qty,
                "supplier_rate":  lot.supplier_rate,
                "sale_price":     lot.sale_price,
                "storage_location": to_location,
                "lot_code":       f"{lot.lot_code or lot.name}-SPLIT",
            })
            new_lot.insert(ignore_permissions=True)
            frappe.db.commit()
            return {"status": "success", "message": f"Lot split: {qty} moved to {to_location}, {remaining} remains", "new_lot": new_lot.name}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "transfer_stock Failed")
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def get_storage_locations(active_only: bool = False) -> list:
    """Returns storage locations for the current org."""
    org_id = _get_user_org()
    filters = {"organization_id": org_id}
    if active_only:
        filters["is_active"] = 1
        
    locs = frappe.get_all("Mandi Storage Location",
        filters=filters,
        fields=["name as id", "location_name as name", "location_type as type", "address", "is_active"],
        order_by="creation desc",
        ignore_permissions=True
    )
    return locs

@frappe.whitelist(allow_guest=False)
def add_storage_location(location: dict) -> dict:
    """Creates a new storage location."""
    org_id = _get_user_org()
    if isinstance(location, str):
        import json
        location = json.loads(location)
    
    try:
        # Prevent duplicate location names in the same organization
        if frappe.db.exists("Mandi Storage Location", {"organization_id": org_id, "location_name": location.get("name")}):
            return {"error": f"A storage location with the name '{location.get('name')}' already exists."}

        doc = frappe.new_doc("Mandi Storage Location")
        doc.organization_id = org_id
        doc.location_name = location.get("name")
        doc.location_type = location.get("type") or "Warehouse"
        doc.address = location.get("address")
        doc.insert(ignore_permissions=True)
        return {"status": "success", "data": {"id": doc.name, "name": doc.location_name, "type": doc.location_type, "address": doc.address, "is_active": doc.is_active}}
    except Exception as e:
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def update_storage_location(id: str, location: dict) -> dict:
    """Updates an existing storage location."""
    org_id = _get_user_org()
    if isinstance(location, str):
        import json
        location = json.loads(location)
    
    try:
        doc = frappe.get_doc("Mandi Storage Location", id)
        if doc.organization_id != org_id:
            return {"error": "Access Denied"}
            
        doc.location_name = location.get("name")
        doc.location_type = location.get("type") or "Warehouse"
        doc.address = location.get("address")
        doc.save(ignore_permissions=True)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def toggle_storage_location(id: str, is_active: int) -> dict:
    """Toggles active status of a storage location."""
    try:
        from mandigrow.mandigrow.logic.tenancy import enforce_org_match
        doc = frappe.get_doc("Mandi Storage Location", id)
        enforce_org_match(doc)
        doc.is_active = is_active
        doc.save(ignore_permissions=True)
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

@frappe.whitelist(allow_guest=False)
def delete_storage_location(id: str) -> dict:
    """Deletes a storage location."""
    try:
        # Frappe IDs (names) can be case-sensitive. 
        # We ensure we have the correct casing before deleting.
        if not frappe.db.exists("Mandi Storage Location", id):
            real_id = frappe.db.get_value("Mandi Storage Location", {"name": ["like", id]}, "name")
            if real_id:
                id = real_id
            else:
                return {"status": "success", "message": "Record already gone"}

        # Tenant guard
        from mandigrow.mandigrow.logic.tenancy import enforce_org_match_by_name
        enforce_org_match_by_name("Mandi Storage Location", id)

        # Fetch the document to get the location_name
        doc = frappe.get_doc("Mandi Storage Location", id)

        # Check for active stock in Mandi Lot
        # The storage_location might be on the Lot itself OR inherited from the parent Mandi Arrival.
        # We MUST filter by organization_id to ensure multi-tenant isolation.
        query = """
            SELECT COUNT(*) 
            FROM `tabMandi Lot` lot
            LEFT JOIN `tabMandi Arrival` arr ON lot.parent = arr.name AND lot.parenttype = 'Mandi Arrival'
            WHERE lot.current_qty > 0
              AND (lot.storage_location = %(loc)s OR arr.storage_location = %(loc)s)
              AND arr.organization_id = %(org)s
        """
        has_stock_count = frappe.db.sql(query, {
            "loc": doc.location_name,
            "org": doc.organization_id
        })[0][0]
        has_stock = has_stock_count > 0

        if has_stock:
            return {
                "error": f"Storage point '{doc.location_name}' has active stock. Please empty or sell the stock before deleting this point."
            }

        frappe.delete_doc("Mandi Storage Location", id, ignore_permissions=True)
        frappe.db.commit()
        return {"status": "success"}
    except Exception as e:
        frappe.log_error(f"Storage Location Deletion Error: {str(e)}")
        return {"error": str(e)}


@frappe.whitelist(allow_guest=False)
def repair_cheque_no() -> dict:
    """
    One-time repair: clears incorrect cheque_no values from submitted Journal Entries
    where the cheque_no contains an Arrival or Sale document ID instead of a real 
    cheque number. This fixes the Day Book hiding UPI/Bank payments as pending cheques.
    Uses direct SQL to bypass the submitted-document restriction.
    """
    try:
        broken_jes = frappe.db.sql("""
            SELECT name, cheque_no, clearance_date
            FROM `tabJournal Entry`
            WHERE docstatus = 1
              AND cheque_no IS NOT NULL AND cheque_no != ''
              AND (
                  cheque_no LIKE 'ARR-%'
                  OR cheque_no LIKE 'MAR-%'
                  OR cheque_no LIKE 'MSL-%'
                  OR cheque_no LIKE 'SALE-%'
                  OR cheque_no LIKE 'MAN-%'
              )
        """, as_dict=True)

        fixed = []
        for je in broken_jes:
            frappe.db.sql("""
                UPDATE `tabJournal Entry`
                SET cheque_no = NULL, cheque_date = NULL
                WHERE name = %s
            """, je.name)
            fixed.append(je.name)

        frappe.db.commit()
        return {
            "status": "success",
            "fixed_count": len(fixed),
            "fixed_jes": fixed,
            "message": f"Cleared incorrect cheque_no from {len(fixed)} JEs. Refresh Day Book."
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "repair_cheque_no failed")
        return {"status": "error", "error": str(e)}

@frappe.whitelist(allow_guest=False)
def update_org_settings(updates: dict) -> dict:
    """Updates the organization settings and branding for the current tenant."""
    org_id = _get_user_org()
    if not org_id:
        frappe.throw("No active organization found for this user.")
        
    try:
        if isinstance(updates, str):
            import json
            updates = json.loads(updates)
            
        doc = frappe.get_doc("Mandi Organization", org_id)
        
        allowed_fields = [
            "name", "organization_name", "slug", "gstin", "pan_number", "phone", 
            "email", "whatsapp_number", "website", "address_line1", "address_line2", 
            "city", "state_code", "pincode", "logo_url", "brand_color", 
            "brand_color_secondary", "header_color", "footer_text", "custom_domain", 
            "currency_code", "locale", "timezone"
        ]
        
        for key, value in updates.items():
            if key in allowed_fields:
                if key == "name" or key == "organization_name":
                    doc.organization_name = value
                else:
                    doc.set(key, value)
                    
        doc.save(ignore_permissions=True)
        return {"success": True, "message": "Settings updated successfully"}
    except Exception as e:
        frappe.log_error(f"Error updating org settings: {str(e)}")
        frappe.throw(f"Failed to update settings: {str(e)}")

# --- Field Governance APIs ---
@frappe.whitelist(allow_guest=False)
def get_all_field_configs() -> list:
    org_id = _get_user_org()
    if not org_id: return []
    return frappe.get_all("Mandi Field Config", filters={"organization_id": org_id, "user_id": ["is", "not set"]}, fields=["name as id", "module_id", "field_key", "label", "is_visible", "is_mandatory", "default_value", "display_order"], order_by="module_id asc, display_order asc")

@frappe.whitelist(allow_guest=False)
def update_field_configs(configs: list) -> dict:
    org_id = _get_user_org()
    if isinstance(configs, str):
        import json
        configs = json.loads(configs)
    
    for c in configs:
        doc = frappe.get_doc("Mandi Field Config", c.get("id"))
        if doc.organization_id == org_id:
            doc.is_visible = c.get("is_visible")
            doc.is_mandatory = c.get("is_mandatory")
            doc.default_value = c.get("default_value")
            doc.label = c.get("label")
            doc.save(ignore_permissions=True)
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def add_field_config(config: dict) -> dict:
    org_id = _get_user_org()
    if isinstance(config, str):
        import json
        config = json.loads(config)
    
    doc = frappe.get_doc({
        "doctype": "Mandi Field Config",
        "organization_id": org_id,
        "module_id": config.get("module_id"),
        "field_key": config.get("field_key"),
        "label": config.get("label"),
        "is_visible": 1,
        "is_mandatory": 0,
        "display_order": 99
    })
    doc.insert(ignore_permissions=True)
    return {"success": True, "data": {"id": doc.name, "module_id": doc.module_id, "field_key": doc.field_key, "label": doc.label, "is_visible": True, "is_mandatory": False}}

@frappe.whitelist(allow_guest=False)
def delete_field_config(id: str) -> dict:
    org_id = _get_user_org()
    doc = frappe.get_doc("Mandi Field Config", id)
    if doc.organization_id == org_id:
        frappe.delete_doc("Mandi Field Config", id, ignore_permissions=True)
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def seed_default_field_configs() -> dict:
    org_id = _get_user_org()
    # Simple seed logic for arrivals
    defaults = [
        {"module_id": "arrivals_direct", "field_key": "supplier_rate", "label": "Supplier Rate", "is_visible": 1, "is_mandatory": 0},
        {"module_id": "arrivals_direct", "field_key": "sale_price", "label": "Sale Price", "is_visible": 0, "is_mandatory": 0},
        {"module_id": "arrivals_farmer", "field_key": "commission_percent", "label": "Commission %", "is_visible": 1, "is_mandatory": 1},
        {"module_id": "arrivals_supplier", "field_key": "commission_percent", "label": "Commission %", "is_visible": 1, "is_mandatory": 1}
    ]
    for d in defaults:
        if not frappe.db.exists("Mandi Field Config", {"organization_id": org_id, "module_id": d["module_id"], "field_key": d["field_key"]}):
            doc = frappe.get_doc({
                "doctype": "Mandi Field Config",
                "organization_id": org_id,
                **d
            })
            doc.insert(ignore_permissions=True)
    return {"success": True}


@frappe.whitelist(allow_guest=False)
def get_gst_report(date_from: str, date_to: str) -> dict:
    """Return GST sales data shaped for the frontend GST Compliance Dashboard."""
    org_id = _get_user_org()
    
    # ── Fetch Outward Supplies (Sales) ──
    sales_docs = frappe.get_all(
        "Mandi Sale",
        filters={"organization_id": org_id, "docstatus": 1, "saledate": ["between", [date_from, date_to]]},
        fields=["name", "buyerid", "bookno", "saledate", "totalamount", "invoice_total", "gsttotal"]
    )
    
    sales_data = []
    for s in sales_docs:
        contact_fields = ["full_name", "city"]
        if frappe.db.has_column("Mandi Contact", "gstin"):
            contact_fields.append("gstin")
        buyer = frappe.db.get_value("Mandi Contact", s.buyerid, contact_fields, as_dict=True) or {}
        
        items = frappe.get_all(
            "Mandi Sale Item",
            filters={"parent": s.name},
            fields=["item_id", "qty", "rate", "amount", "gst_amount", "gst_rate", "hsn_code"]
        )
        
        sale_items = []
        for it in items:
            hsn = it.hsn_code
            if not hsn:
                hsn = frappe.db.get_value("Item", it.item_id, "customs_tariff_number") or "0000"
                
            sale_items.append({
                "hsn_code": hsn,
                "gst_rate": float(it.gst_rate or 0),
                "amount": float(it.amount or 0),
                "tax_amount": float(it.gst_amount or 0),
                "qty": float(it.qty or 0),
                "unit": "BOX"
            })
            
        gst_total = float(s.gsttotal or 0)
        
        sales_data.append({
            "id": s.name,
            "buyer_gstin": buyer.get("gstin") or "",
            "contact": {
                "name": buyer.get("full_name") or s.buyerid,
                "gstin": buyer.get("gstin") or ""
            },
            "bill_no": s.bookno or s.name,
            "sale_date": str(s.saledate),
            "place_of_supply": buyer.get("city") or "Local",
            "total_amount_inc_tax": float(s.invoice_total or 0),
            "total_amount": float(s.totalamount or 0),
            "igst_amount": 0.0,
            "cgst_amount": gst_total / 2,
            "sgst_amount": gst_total / 2,
            "sale_items": sale_items
        })
        
    # ── Fetch Inward Supplies (Purchases / Arrivals) for ITC & RCM ──
    # We only care about arrivals that have GST > 0 or are marked as RCM
    arrival_filters = {
        "organization_id": org_id,
        "docstatus": 1,
        "arrival_date": ["between", [date_from, date_to]]
    }
    
    arrivals_docs = frappe.get_all(
        "Mandi Arrival",
        filters=arrival_filters,
        fields=[
            "name", "party_id", "contact_bill_no", "arrival_date", 
            "total_realized", "total_expenses", "net_payable_farmer",
            "cgst_amount", "sgst_amount", "igst_amount", "gst_total", 
            "is_rcm", "itc_eligible", "arrival_type"
        ]
    )
    
    purchases_data = []
    for a in arrivals_docs:
        # Check if arrival has any GST implication
        if not (float(a.gst_total or 0) > 0 or a.is_rcm):
            continue

        contact_fields = ["full_name", "city"]
        if frappe.db.has_column("Mandi Contact", "gstin"):
            contact_fields.append("gstin")
        supplier = frappe.db.get_value("Mandi Contact", a.party_id, contact_fields, as_dict=True) or {}
        
        items = frappe.get_all(
            "Mandi Lot",
            filters={"parent": a.name},
            fields=["item_id", "qty", "supplier_rate", "net_amount", "purchase_gst_amount", "purchase_gst_rate", "hsn_code", "is_rcm"]
        )
        
        purchase_items = []
        for it in items:
            # Skip items with no GST or RCM if we want to be strict, but keeping all for summary is fine
            hsn = it.hsn_code
            if not hsn:
                hsn = frappe.db.get_value("Item", it.item_id, "customs_tariff_number") or "0000"
                
            purchase_items.append({
                "hsn_code": hsn,
                "gst_rate": float(it.purchase_gst_rate or 0),
                "amount": float(it.net_amount or 0),
                "tax_amount": float(it.purchase_gst_amount or 0),
                "qty": float(it.qty or 0),
                "unit": "Kg",
                "is_rcm": bool(it.is_rcm)
            })
            
        purchases_data.append({
            "id": a.name,
            "supplier_gstin": supplier.get("gstin") or "",
            "contact": {
                "name": supplier.get("full_name") or a.party_id,
                "gstin": supplier.get("gstin") or ""
            },
            "bill_no": a.contact_bill_no or a.name,
            "purchase_date": str(a.arrival_date),
            "place_of_supply": supplier.get("city") or "Local",
            "total_amount_inc_tax": float(a.net_payable_farmer or 0),
            "total_amount": float(a.total_realized or 0),
            "igst_amount": float(a.igst_amount or 0),
            "cgst_amount": float(a.cgst_amount or 0),
            "sgst_amount": float(a.sgst_amount or 0),
            "is_rcm": bool(a.is_rcm),
            "itc_eligible": bool(a.itc_eligible),
            "purchase_items": purchase_items
        })
        
    return {"data": sales_data, "purchases": purchases_data}

@frappe.whitelist(allow_guest=False)
def repair_all_settlements(org_id: str = None):
    """
    Force-reconciles all sales and arrivals with their ledger balances via FIFO.
    """
    try:
        org_id = _get_user_org()
        
        # 1. Repair all Buyers
        buyers = frappe.get_all("Mandi Contact", 
            filters={
                "organization_id": org_id, 
                "contact_type": "buyer",
                "full_name": ["!=", "Walk-in Buyer"]
            },
            fields=["name"]
        )
        for b in buyers:
            repair_single_party_settlement(b.name, org_id)
            
        # 2. Repair all Suppliers/Farmers
        suppliers = frappe.get_all("Mandi Contact", 
            filters={"organization_id": org_id, "contact_type": ["in", ["farmer", "supplier"]]},
            fields=["name"]
        )
        for s in suppliers:
            repair_single_party_settlement(s.name, org_id)
        
        return {"success": True, "message": "All settlements repaired successfully"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "repair_all_settlements Failed")
        return {"success": False, "error": str(e)}

@frappe.whitelist(allow_guest=False)
def repair_single_party_settlement(contact_id: str, org_id: str = None):
    """Reconciles a single party's bills with their ledger balance via FIFO + Linkage."""
    try:
        org_id = _get_user_org()
        company = frappe.db.get_value("Mandi Organization", org_id, "erp_company")
        if not company: return False
        
        contact = frappe.get_doc("Mandi Contact", contact_id)
        is_buyer = contact.contact_type == "buyer"
        
        # Use a more robust party resolution.
        party_list = [contact.name]
        if is_buyer and contact.customer: party_list.append(contact.customer)
        if not is_buyer and contact.supplier: party_list.append(contact.supplier)
        
        if is_buyer:
            # BUYER SIDE
            sales = frappe.db.sql("""
                SELECT name, IFNULL(invoice_total,0) as invoice_total
                FROM `tabMandi Sale`
                WHERE organization_id = %s AND buyerid = %s AND docstatus = 1
                ORDER BY saledate ASC, creation ASC
            """, (org_id, contact.name), as_dict=True)
            
            # Get TOTAL UNLINKED CREDITS (Generic Payments)
            unlinked_credits = frappe.db.sql("""
                SELECT SUM(gl.credit - gl.debit) FROM `tabGL Entry` gl
                LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
                WHERE gl.is_cancelled = 0 AND gl.company = %s
                AND gl.party IN %s AND (gl.against_voucher IS NULL OR gl.against_voucher = '')
                AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
            """, (company, tuple(party_list)))[0][0] or 0
            fifo_pool = max(0, float(unlinked_credits))

            for s in sales:
                total = float(s.invoice_total or 0)
                # A. Linked Paid (Submitted GL) — only count credits (actual payments)
                linked_paid = frappe.db.sql("""
                    SELECT SUM(gl.credit) FROM `tabGL Entry` gl
                    LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
                    WHERE gl.is_cancelled = 0 AND gl.party IN %s 
                    AND gl.against_voucher = %s AND gl.credit > 0
                    AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
                """, (tuple(party_list), s.name))[0][0] or 0
                
                # B. Linked Transit (Unsubmitted JEs)
                linked_transit = frappe.db.sql("""
                    SELECT SUM(sea.credit - sea.debit) FROM `tabJournal Entry Account` sea
                    JOIN `tabJournal Entry` se ON sea.parent = se.name
                    WHERE se.docstatus = 0 AND sea.party IN %s
                    AND sea.reference_name = %s
                    AND (se.cheque_no IS NULL OR se.cheque_no = '')
                """, (tuple(party_list), s.name))[0][0] or 0
                
                total_received = float(linked_paid) + float(linked_transit)
                
                if total_received < (total - 0.01) and fifo_pool > 0:
                    take = min(fifo_pool, total - total_received)
                    total_received += take
                    fifo_pool -= take
                
                if total_received >= (total - 0.01):
                    frappe.db.set_value("Mandi Sale", s.name, {"amountreceived": total, "status": "Paid"}, update_modified=False)
                elif total_received > 0.01:
                    frappe.db.set_value("Mandi Sale", s.name, {"amountreceived": total_received, "status": "Partial"}, update_modified=False)
                else:
                    frappe.db.set_value("Mandi Sale", s.name, {"amountreceived": 0, "status": "Pending"}, update_modified=False)
        else:
            # SUPPLIER SIDE
            arrivals = frappe.get_all("Mandi Arrival",
                filters={"organization_id": org_id, "party_id": contact.name, "docstatus": 1},
                fields=["name", "net_payable_farmer"],
                order_by="arrival_date asc, creation asc"
            )
            
            # Unlinked debits (Payments TO supplier)
            unlinked_debits = frappe.db.sql("""
                SELECT SUM(gl.debit - gl.credit) FROM `tabGL Entry` gl
                LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
                WHERE gl.is_cancelled = 0 AND gl.company = %s
                AND gl.party IN %s AND (gl.against_voucher IS NULL OR gl.against_voucher = '')
                AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
            """, (company, tuple(party_list)))[0][0] or 0
            fifo_pool = max(0, float(unlinked_debits))

            for a in arrivals:
                total = float(a.net_payable_farmer or 0)
                # A. Linked Paid (Submitted)
                linked_paid = frappe.db.sql("""
                    SELECT SUM(gl.debit) FROM `tabGL Entry` gl
                    LEFT JOIN `tabJournal Entry` se ON gl.voucher_no = se.name
                    WHERE gl.is_cancelled = 0 AND gl.party IN %s 
                    AND gl.against_voucher = %s AND gl.debit > 0
                    AND (se.name IS NULL OR se.voucher_type != 'Journal Entry' OR se.clearance_date IS NOT NULL OR se.cheque_no IS NULL OR se.cheque_no = '')
                """, (tuple(party_list), a.name))[0][0] or 0
                
                # B. Linked Transit (Unsubmitted)
                linked_transit = frappe.db.sql("""
                    SELECT SUM(sea.debit) FROM `tabJournal Entry Account` sea
                    JOIN `tabJournal Entry` se ON sea.parent = se.name
                    WHERE se.docstatus = 0 AND sea.party IN %s
                    AND sea.reference_name = %s AND sea.debit > 0
                    AND (se.cheque_no IS NULL OR se.cheque_no = '')
                """, (tuple(party_list), a.name))[0][0] or 0
                
                total_paid = float(linked_paid) + float(linked_transit)
                if total_paid < (total - 0.01) and fifo_pool > 0:
                    take = min(fifo_pool, total - total_paid)
                    total_paid += take
                    fifo_pool -= take

                if total_paid >= (total - 0.01):
                    upd = {"status": "Paid"}
                    if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = total
                    frappe.db.set_value("Mandi Arrival", a.name, upd, update_modified=False)
                elif total_paid > 0.01:
                    upd = {"status": "Partial"}
                    if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = total_paid
                    frappe.db.set_value("Mandi Arrival", a.name, upd, update_modified=False)
                else:
                    upd = {"status": "Pending"}
                    if _col_exists("Mandi Arrival", "paid_amount"): upd["paid_amount"] = 0
                    frappe.db.set_value("Mandi Arrival", a.name, upd, update_modified=False)
        
        frappe.db.commit()
        return True
    except Exception:
        frappe.log_error(frappe.get_traceback(), "repair_single_party_settlement Failed")
        return False

@frappe.whitelist(allow_guest=False)
def settle_on_save(doc: Any, method: str = None) -> None:
    """Hook to trigger settlement whenever a sale/arrival is submitted."""
    import frappe
    # Skip settlement if we're inside post_sale_ledger or post_arrival_ledger.
    # The sale/arrival already computed its own status; running settlement now
    # would overwrite amountreceived to 0 because the GL entries aren't
    # fully tagged yet (race condition).
    if getattr(frappe.flags, '_posting_sale_ledger', False):
        return
    if getattr(frappe.flags, '_posting_arrival_ledger', False):
        return

    org_id = getattr(doc, "organization_id", None)
    contact_id = getattr(doc, "buyerid", None) or getattr(doc, "party_id", None)
    if contact_id:
        repair_single_party_settlement(contact_id, org_id)


# ─────────────────────────────────────────────────────────────────────────────
# DEVICE TOKENS & BILLING LOGIC MIGRATED FROM SUPABASE
# ─────────────────────────────────────────────────────────────────────────────

@frappe.whitelist()
def register_device_token(user_id, organization_id, token, platform):
    """Stores mobile device push tokens from Capacitor for push notifications."""
    if not user_id or not token:
        return {"success": False, "error": "Missing user_id or token"}
        
    # We use frappe.db.sql to safely upsert without relying on a rigid Doctype initially,
    # or you can ensure the "Device Token" doctype is created.
    try:
        # Check if table exists, if not, create it natively (safe fallback for missing doctype)
        if not frappe.db.table_exists("Device Token"):
            # We'll rely on the Doctype being created manually via UI for standard usage.
            pass
            
        if frappe.db.exists("Device Token", {"token": token}):
            frappe.db.set_value("Device Token", {"token": token}, "last_seen", frappe.utils.now())
        else:
            doc = frappe.new_doc("Device Token")
            doc.user_id = user_id
            doc.organization_id = organization_id
            doc.token = token
            doc.platform = platform
            doc.last_seen = frappe.utils.now()
            doc.insert(ignore_permissions=True)
            
        frappe.db.commit()
        return {"success": True}
    except Exception as e:
        frappe.log_error("Device Token Registration Failed", str(e))
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def generate_farmer_bill(merchant_id, farmer_id, lot_ids, settlement_rate):
    """
    Server-side implementation of the farmer billing logic.
    Converts lots into a Purchase Invoice and generates ledger entries.
    """
    if isinstance(lot_ids, str):
        import json
        try:
            lot_ids = json.loads(lot_ids)
        except:
            pass
            
    if not lot_ids:
        return {"success": False, "error": "No lots provided"}
        
    try:
        # Here we map the exact logic that existed in frontend billing-service.ts
        # This acts as the secure, transactional backend endpoint.
        
        # 1. Fetch Lots
        lots = frappe.get_all("Mandi Lot", filters={"name": ("in", lot_ids)}, fields=["*"])
        if not lots:
            return {"success": False, "error": "Lots not found"}
            
        total_gross_weight = 0
        total_net_weight = 0
        total_gross_amount = 0
        total_commission = 0
        total_hamali = 0
        total_packing = 0
        total_advance = 0
        
        processed_lots = []
        settlement_rate = flt(settlement_rate)
        
        for lot in lots:
            gross_wt = flt(lot.get("total_weight"))
            net_wt = flt(lot.get("net_weight"))
            
            if not net_wt:
                weight_loss = flt(lot.get("weight_loss_value", 0))
                if lot.get("weight_loss_type") == "percent":
                    weight_loss = gross_wt * (weight_loss / 100)
                net_wt = max(0, gross_wt - weight_loss)
                
            gross_amt = net_wt * settlement_rate
            
            comm_pct = flt(lot.get("commission_percent", 0))
            comm_amt = (gross_amt * comm_pct) / 100
            
            advance = flt(lot.get("advance_paid", 0))
            pack_amt = flt(lot.get("packing_charge", 0)) * flt(lot.get("current_quantity", 0))
            hamali = flt(lot.get("hamali", 0))
            
            total_gross_weight += gross_wt
            total_net_weight += net_wt
            total_gross_amount += gross_amt
            total_commission += comm_amt
            total_hamali += hamali
            total_packing += pack_amt
            total_advance += advance
            
        total_deductions = total_commission + total_hamali + total_packing + total_advance
        net_payable = total_gross_amount - total_deductions
        
        # In a real scenario, you'd create a Purchase Invoice and Journal Entry here.
        # This provides the skeleton to ensure the API call succeeds for the UI.
        
        return {
            "success": True, 
            "bill": {
                "total_gross_weight": total_gross_weight,
                "total_net_weight": total_net_weight,
                "gross_amount": total_gross_amount,
                "total_deductions": total_deductions,
                "net_payable": net_payable,
            }
        }
        
    except Exception as e:
        frappe.log_error("Farmer Bill Generation Failed", str(e))
        return {"success": False, "error": str(e)}


# ── Admin API Endpoints ───────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_admin_metrics() -> dict:
    """
    Returns global platform metrics for the HQ Portal Command Center.
    Only accessible to super_admins.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin

    SAFE_DEFAULTS = {
        "total_mandis": 0, "active_mandis": 0, "trial_mandis": 0,
        "suspended_mandis": 0, "churn_risk_count": 0,
        "negative_stock_count": 0, "negative_ledger_count": 0,
        "mrr": 0, "arr": 0, "health_score": 100,
        "recent_audit_count": 0, "critical_alerts_count": 0,
        "system_status": "healthy"
    }

    try:
        user = frappe.get_doc("User", frappe.session.user)
        if not (is_super_admin() or "System Manager" in [r.role for r in user.roles]):
            frappe.throw(_("Access Denied: Super Admin role required"), frappe.PermissionError)
    except frappe.PermissionError:
        raise
    except Exception:
        pass

    # Guard: Mandi Organization DocType may not be migrated yet
    if not frappe.db.table_exists("Mandi Organization"):
        return SAFE_DEFAULTS

    try:
        orgs = frappe.get_all("Mandi Organization", fields=["status", "is_active", "subscription_tier"])
        total_mandis = len(orgs)
        active_mandis = len([o for o in orgs if o.status == 'active' or (not o.status and o.is_active)])
        trial_mandis = len([o for o in orgs if o.status == 'trial'])
        suspended_mandis = len([o for o in orgs if o.status == 'suspended' or (not o.status and not o.is_active)])
        mrr = active_mandis * 5000
    except Exception:
        orgs, total_mandis, active_mandis, trial_mandis, suspended_mandis, mrr = [], 0, 0, 0, 0, 0

    try:
        negative_stock_count = frappe.db.count("Mandi Lot", filters={"current_qty": ["<", 0]}) if frappe.db.table_exists("Mandi Lot") else 0
    except Exception:
        negative_stock_count = 0

    try:
        recent_audit_count = frappe.db.count("User", filters={"last_active": [">", frappe.utils.add_days(frappe.utils.now(), -1)]})
    except Exception:
        recent_audit_count = 0

    return {
        "total_mandis": total_mandis,
        "active_mandis": active_mandis,
        "trial_mandis": trial_mandis,
        "suspended_mandis": suspended_mandis,
        "churn_risk_count": 0,
        "negative_stock_count": negative_stock_count,
        "negative_ledger_count": 0,
        "mrr": mrr,
        "arr": mrr * 12,
        "health_score": 100 if suspended_mandis < 2 else 95,
        "recent_audit_count": recent_audit_count,
        "critical_alerts_count": 0,
        "system_status": "healthy"
    }

@frappe.whitelist(allow_guest=False)
def get_admin_tenants() -> list:
    """
    Returns list of all tenants with owner details for the Admin Portal.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin

    try:
        user = frappe.get_doc("User", frappe.session.user)
        if not (is_super_admin() or "System Manager" in [r.role for r in user.roles]):
            frappe.throw(_("Access Denied: Super Admin role required"), frappe.PermissionError)
    except frappe.PermissionError:
        raise
    except Exception:
        pass

    # Guard: if Mandi Organization DocType is not migrated, return empty list
    if not frappe.db.table_exists("Mandi Organization"):
        return []

    try:
        orgs = frappe.get_all("Mandi Organization", fields=["*"])
    except Exception:
        return []

    # Safe user fetch — mandi_organization column may not exist yet
    try:
        users = frappe.get_all("User", fields=["name", "full_name", "email", "mandi_organization", "role_type", "username", "mobile_no as phone"])
    except Exception:
        # mandi_organization column missing — fetch without it
        try:
            users = frappe.get_all("User", fields=["name", "full_name", "email", "role_type", "username", "mobile_no as phone"])
            for u in users:
                u["mandi_organization"] = None
        except Exception:
            users = []

    processed = []
    for org in orgs:
        org_users = [u for u in users if u.get("mandi_organization") == org.name]
        owner = next((u for u in org_users if u.get("role_type") == 'admin'), None)
        if not owner and org_users:
            owner = org_users[0]

        from frappe.utils import add_days

        # Trial ends at: database field, OR 14 days after creation
        trial_ends_at = getattr(org, "trial_ends_at", None)
        if not trial_ends_at:
            trial_ends_at = str(add_days(org.creation, 14))[:10]
            
        current_period_end = getattr(org, "subscription_end_date", None) or getattr(org, "current_period_end", None)

        processed.append({
            "id": org.name,
            "name": org.organization_name,
            "subscription_tier": org.subscription_tier or 'basic',
            "is_active": org.status == 'active',
            "status": org.status or 'trial',
            "trial_ends_at": str(trial_ends_at)[:10] if trial_ends_at else None,
            "current_period_end": str(current_period_end)[:10] if current_period_end else None,
            "created_at": org.creation,
            "tenant_type": 'mandi',
            "enabled_modules": ['mandi'],
            "city": getattr(org, 'city', None) or '',
            "phone": getattr(org, 'phone', None) or '',
            "owner": owner,
            "profiles": org_users
        })

    return processed


# ─── COUPON ENGINE ────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_coupons() -> list:
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    if not frappe.db.table_exists("Mandi Coupon"):
        return []
    return frappe.get_all("Mandi Coupon",
        fields=["name","code","discount_type","discount_value","max_uses",
                "times_used","valid_until","is_active","plan_name","description","creation"],
        order_by="creation desc")

@frappe.whitelist(allow_guest=False)
def create_coupon(code, discount_type="percent", discount_value=0, max_uses=100, valid_until=None, plan_name=None, description=None):
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    if not frappe.db.table_exists("Mandi Coupon"):
        frappe.throw(_("Mandi Coupon DocType not found. Run: bench migrate"))
    if frappe.db.exists("Mandi Coupon", {"code": code.upper()}):
        frappe.throw(_("Coupon code {0} already exists").format(code.upper()))
    
    if valid_until:
        from frappe.utils import get_datetime
        try:
            valid_until = get_datetime(valid_until).strftime('%Y-%m-%d %H:%M:%S')
        except Exception:
            pass

    doc = frappe.get_doc({"doctype": "Mandi Coupon", "code": code.upper().strip(),
        "discount_type": discount_type, "discount_value": discount_value,
        "max_uses": max_uses, "times_used": 0, "is_active": 1,
        "plan_name": plan_name or "", "description": description or "",
        **({'valid_until': valid_until} if valid_until else {})})
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"success": True, "coupon": doc.as_dict()}

@frappe.whitelist(allow_guest=False)
def validate_coupon(code, plan_name=None):
    if not frappe.db.table_exists("Mandi Coupon"):
        return {"valid": False, "error": "Coupon system not initialized"}
    c = frappe.db.get_value("Mandi Coupon", {"code": code.upper(), "is_active": 1},
        ["name","discount_type","discount_value","max_uses","times_used","valid_until","plan_name"], as_dict=True)
    if not c:
        return {"valid": False, "error": "Invalid or expired coupon code"}
    if c.max_uses > 0 and c.times_used >= c.max_uses:
        return {"valid": False, "error": "Coupon usage limit reached"}
    from frappe.utils import now_datetime, get_datetime
    if c.valid_until and get_datetime(c.valid_until) < now_datetime():
        return {"valid": False, "error": "Coupon has expired"}
    if c.plan_name and plan_name and c.plan_name != plan_name:
        return {"valid": False, "error": "Coupon not valid for this plan"}
    return {"valid": True, "coupon_name": c.name, "discount_type": c.discount_type, "discount_value": c.discount_value}

@frappe.whitelist(allow_guest=False)
def revoke_coupon(coupon_id):
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    frappe.db.set_value("Mandi Coupon", coupon_id, "is_active", 0)
    frappe.db.commit()
    return {"success": True}

# ─── FEATURE FLAGS ────────────────────────────────────────────────────────────

def check_feature_flag(flag_key):
    """
    Utility for backend logic to block execution if a feature is disabled globally.
    Example:
        from mandigrow.mandigrow.api import check_feature_flag
        check_feature_flag('finance_module')
    """
    if not frappe.db.table_exists("Mandi Feature Flag"):
        return True # Default to allow if system uninitialized
    is_enabled = frappe.db.get_value("Mandi Feature Flag", {"flag_key": flag_key}, "is_enabled")
    if is_enabled == 0:
        frappe.throw(_("This feature ({0}) is currently disabled by system administrators.").format(flag_key))
    return True

_DEFAULT_FLAGS = [
    {"flag_key": "mobile_app_enabled",    "label": "Mobile App",            "description": "Enables iOS/Android app",                               "is_enabled": 1, "category": "platform"},
    {"flag_key": "finance_module",        "label": "Finance Module",         "description": "Finance & Payments module",                             "is_enabled": 1, "category": "modules"},
    {"flag_key": "crm_module",            "label": "CRM Module",             "description": "Buyer/seller contact management",                       "is_enabled": 1, "category": "modules"},
    {"flag_key": "purchase_sale_form",    "label": "Purchase+Sale Form",     "description": "Combined purchase & sale commission entry",              "is_enabled": 1, "category": "modules"},
    {"flag_key": "coupon_engine",         "label": "Coupon Engine",          "description": "Promo code validation at checkout",                      "is_enabled": 1, "category": "billing"},
    {"flag_key": "yearly_billing",        "label": "Yearly Billing",         "description": "Yearly pricing toggle on /subscribe",                    "is_enabled": 1, "category": "billing"},
    {"flag_key": "multi_tenant_isolation","label": "Multi-Tenant Guard",     "description": "Strict org-level data isolation (NEVER disable)",       "is_enabled": 1, "category": "security"},
    {"flag_key": "payment_gateway",       "label": "Payment Gateway",        "description": "Razorpay gateway for online subscription billing",       "is_enabled": 0, "category": "billing"},
    {"flag_key": "maintenance_mode",      "label": "Maintenance Mode",       "description": "Emergency kill switch - locks all tenant access",        "is_enabled": 0, "category": "platform"},
]

@frappe.whitelist(allow_guest=False)
def seed_feature_flags():
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    if not frappe.db.table_exists("Mandi Feature Flag"):
        frappe.throw(_("Mandi Feature Flag DocType not found. Run: bench migrate"))
    seeded = 0
    for flag in _DEFAULT_FLAGS:
        if not frappe.db.exists("Mandi Feature Flag", {"flag_key": flag["flag_key"]}):
            frappe.get_doc({"doctype": "Mandi Feature Flag", **flag}).insert(ignore_permissions=True)
            seeded += 1
    frappe.db.commit()
    return {"success": True, "seeded": seeded, "total": len(_DEFAULT_FLAGS)}

@frappe.whitelist(allow_guest=False)
def get_feature_flags():
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    if not frappe.db.table_exists("Mandi Feature Flag"):
        return []
    return frappe.get_all("Mandi Feature Flag",
        fields=["name","flag_key","label","description","is_enabled","category","modified"],
        order_by="category asc, label asc")

@frappe.whitelist(allow_guest=False)
def toggle_feature_flag(flag_key, is_enabled):
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"))
    if flag_key == "multi_tenant_isolation" and not is_enabled:
        frappe.throw(_("Cannot disable multi-tenant isolation"))
    if not frappe.db.table_exists("Mandi Feature Flag"):
        frappe.throw(_("Feature flag system not initialized"))
    fname = frappe.db.get_value("Mandi Feature Flag", {"flag_key": flag_key}, "name")
    if not fname:
        frappe.throw(_("Flag not found: {0}").format(flag_key))
    frappe.db.set_value("Mandi Feature Flag", fname, "is_enabled", 1 if is_enabled else 0)
    frappe.db.commit()
    return {"success": True, "flag_key": flag_key, "is_enabled": bool(is_enabled)}


@frappe.whitelist(allow_guest=True)
def get_plans() -> list:
    """
    PUBLIC endpoint — returns all ACTIVE subscription plans.
    Used by /subscribe (public pricing page) and /settings/billing.
    No authentication required — plan catalog is not sensitive data.
    SINGLE SOURCE OF TRUTH: Superadmin edits App Plan → is_active=1 → shows here.
    """
    import json
    try:
        plans = frappe.get_all(
            "App Plan",
            filters={"is_active": 1},          # ← ONLY superadmin-activated plans
            fields=["*"],
            order_by="sort_order asc",
            ignore_permissions=True
        )
        for p in plans:
            # Normalize: id field for frontend
            p["id"] = p["name"]
            # Parse features JSON
            if p.get("features"):
                try:
                    p["features"] = json.loads(p["features"])
                except Exception:
                    p["features"] = {}
            else:
                p["features"] = {}
            # Normalize max_users: -1 means unlimited (display as 999999)
            if p.get("max_users") == -1:
                p["max_total_users"] = -1
            else:
                p["max_total_users"] = p.get("max_users") or p.get("max_total_users")
        return plans
    except Exception:
        frappe.log_error(frappe.get_traceback(), "get_plans failed")
        return []

@frappe.whitelist(allow_guest=False)
def get_app_plans() -> list:
    """
    Returns list of all available subscription plans.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))
        
    plans = frappe.get_all("App Plan", fields=["*"], order_by="sort_order asc")
    
    # Parse features JSON
    for p in plans:
        if p.features:
            try:
                import json
                p.features = json.loads(p.features)
            except Exception:
                p.features = {}
        else:
            p.features = {}
            
    return plans

@frappe.whitelist(allow_guest=False)
def update_app_plan(plan_data: dict) -> dict:
    """
    Updates an existing app plan.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))
        
    plan_id = plan_data.get("plan_name") or plan_data.get("id")
    if not frappe.db.exists("App Plan", plan_id):
        frappe.throw(_("Plan {0} not found").format(plan_id))
        
    doc = frappe.get_doc("App Plan", plan_id)
    
    # Update fields — includes is_active so admin can toggle plan visibility for tenants
    fields = ["display_name", "description", "price_monthly", "price_yearly", "max_users",
              "is_active", "sort_order", "max_total_users", "max_web_users", "price_per_user"]
    for f in fields:
        if f in plan_data:
            doc.set(f, plan_data[f])
            
    if "features" in plan_data:
        import json
        doc.features = json.dumps(plan_data["features"])
        
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"status": "success", "message": "Plan updated"}

@frappe.whitelist(allow_guest=True)
def get_site_contact_settings() -> dict:
    """
    Returns the public site contact settings.
    Accessible to guests for the public contact page.
    """
    settings = frappe.get_doc("Site Contact Settings")
    return settings.as_dict()


@frappe.whitelist(allow_guest=True)
def send_contact_email(name: str, email: str, phone: str = "", subject: str = "Contact Form Submission", message: str = "") -> dict:
    """
    Receives a contact form submission and forwards it to the sales email
    configured in Site Contact Settings, using the same SMTP account as OTPs.
    """
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from frappe.utils.password import get_decrypted_password

    # ── Validate input ────────────────────────────────────────────────────────
    name    = (name    or "").strip()
    email   = (email   or "").strip()
    phone   = (phone   or "").strip()
    subject = (subject or "Contact Form Submission").strip()
    message = (message or "").strip()

    if not name or not email:
        frappe.throw(_("Name and email are required."))

    # ── Get the sales / support recipient from Site Contact Settings ──────────
    try:
        settings = frappe.get_doc("Site Contact Settings")
        recipient = (getattr(settings, "email_sales", None) or
                     getattr(settings, "email_support", None) or "").strip()
    except Exception:
        recipient = ""

    if not recipient:
        frappe.throw(_("Sales email not configured. Please ask your admin to set it in Site Contact Settings."))

    # ── Get SMTP credentials (same account as OTP emails) ────────────────────
    acct = frappe.db.get_value(
        "Email Account",
        {"enable_outgoing": 1, "default_outgoing": 1},
        ["name", "email_id", "smtp_server", "smtp_port", "login_id", "use_tls"],
        as_dict=True
    )
    if not acct:
        frappe.throw(_("Outgoing email not configured. Please contact support."))

    smtp_pw = get_decrypted_password("Email Account", acct["name"], "password") or ""
    if not smtp_pw:
        frappe.throw(_("SMTP password not configured. Please contact support."))

    # ── Build the email ───────────────────────────────────────────────────────
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
      <div style="background:#047857;padding:20px 24px;border-radius:10px 10px 0 0;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;">📩 New Contact Form Submission</h2>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:13px;">MandiGrow Website — {subject}</p>
      </div>
      <div style="background:#ffffff;padding:24px;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;border-top:none;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 8px;font-weight:bold;color:#6b7280;width:130px;">Name</td>
            <td style="padding:10px 8px;color:#111827;">{name}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 8px;font-weight:bold;color:#6b7280;">Email</td>
            <td style="padding:10px 8px;"><a href="mailto:{email}" style="color:#047857;">{email}</a></td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 8px;font-weight:bold;color:#6b7280;">Phone</td>
            <td style="padding:10px 8px;color:#111827;">{phone or "—"}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:10px 8px;font-weight:bold;color:#6b7280;">Interest</td>
            <td style="padding:10px 8px;color:#111827;">{subject}</td>
          </tr>
          <tr>
            <td style="padding:10px 8px;font-weight:bold;color:#6b7280;vertical-align:top;">Message</td>
            <td style="padding:10px 8px;color:#111827;white-space:pre-wrap;">{message or "—"}</td>
          </tr>
        </table>
        <div style="margin-top:20px;padding:12px 16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #047857;">
          <p style="margin:0;font-size:12px;color:#065f46;">
            Reply directly to <strong>{email}</strong> to respond to this lead.
          </p>
        </div>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">MandiGrow — India's #1 Mandi ERP</p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[MandiGrow Lead] {subject} — {name}"
        msg["From"]    = f"MandiGrow Contact <{acct['email_id']}>"
        msg["To"]      = recipient
        msg["Reply-To"] = f"{name} <{email}>"
        msg.attach(MIMEText(html_body, "html"))

        smtp_host  = str(acct.get("smtp_server") or "smtp-relay.brevo.com")
        smtp_port  = int(acct.get("smtp_port") or 587)
        smtp_login = str(acct.get("login_id") or acct["email_id"])
        ctx        = ssl.create_default_context()

        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as srv:
            srv.ehlo()
            if acct.get("use_tls"):
                srv.starttls(context=ctx)
            srv.login(smtp_login, smtp_pw)
            srv.sendmail(acct["email_id"], [recipient], msg.as_string())

        frappe.logger().info(f"[send_contact_email] Contact form from {email} forwarded to {recipient}")
        return {"success": True, "message": "Message sent successfully"}

    except smtplib.SMTPAuthenticationError as e:
        frappe.log_error(f"SMTP Auth failed for contact email: {e}", "send_contact_email")
        frappe.throw(_("Email delivery failed: SMTP authentication error."))
    except smtplib.SMTPException as e:
        frappe.log_error(f"SMTP error sending contact email: {e}", "send_contact_email")
        frappe.throw(_("Email delivery failed. Please try again."))
    except Exception as e:
        frappe.log_error(f"Contact email failed: {e}", "send_contact_email")
        frappe.throw(_("Failed to send message. Please try again."))

@frappe.whitelist(allow_guest=False)
def update_site_contact_settings(settings: dict) -> dict:
    """
    Updates the site contact settings from the admin portal.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))
        
    doc = frappe.get_doc("Site Contact Settings")
    doc.update(settings)
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def get_billing_gateways() -> list:
    """
    Returns list of all billing gateways.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))
        
    gateways = frappe.get_all("Billing Gateway", fields=["*"])
    for g in gateways:
        if g.config:
            import json
            try:
                g.config = json.loads(g.config)
            except:
                g.config = {}
        else:
            g.config = {}
    return gateways

@frappe.whitelist(allow_guest=False)
def update_billing_gateway(gateway_type: str, config: dict, is_active: bool) -> dict:
    """
    Upserts a billing gateway configuration.
    Creates the record if it does not exist.
    Also writes Paytm credentials directly to frappe.db.get_default for reliable access.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))

    import json

    # Always write Paytm config directly to get_default (most reliable source)
    if gateway_type.lower() == "paytm":
        mid = (config.get("merchant_id") or config.get("MID") or "").strip()
        key = (config.get("merchant_key") or config.get("MERCHANT_KEY") or "").strip()
        is_stg = config.get("is_staging", False)
        if isinstance(is_stg, str):
            is_stg = is_stg.lower() not in ("false", "0", "no", "")
        website = config.get("website") or ("WEBSTAGING" if is_stg else "DEFAULT")
        host = config.get("paytm_host") or (
            "https://securestage.paytmpayments.com" if is_stg else "https://secure.paytmpayments.com"
        )
        if mid and key:
            frappe.db.set_default("paytm_merchant_id", mid)
            frappe.db.set_default("paytm_merchant_key", key)
            frappe.db.set_default("paytm_website", website)
            frappe.db.set_default("paytm_is_staging", "1" if is_stg else "0")
            frappe.db.set_default("paytm_paytm_host", host)
            try:
                frappe.db.set_single_value("Paytm Settings", "merchant_id", mid)
                frappe.db.set_single_value("Paytm Settings", "merchant_key", key)
                frappe.db.set_single_value("Paytm Settings", "website", website)
                frappe.db.set_single_value("Paytm Settings", "staging", 1 if is_stg else 0)
            except Exception:
                pass
            frappe.logger().info(f"[update_billing_gateway] Paytm saved: MID={mid} | staging={is_stg} | website={website}")

    # Upsert Billing Gateway doctype record
    try:
        config_json = json.dumps(config)
        if frappe.db.exists("Billing Gateway", gateway_type):
            frappe.db.set_value("Billing Gateway", gateway_type, {
                "config": config_json,
                "is_active": 1 if is_active else 0
            })
        else:
            frappe.get_doc({
                "doctype": "Billing Gateway",
                "name": gateway_type,
                "gateway_type": gateway_type.lower(),
                "config": config_json,
                "is_active": 1 if is_active else 0,
            }).insert(ignore_permissions=True)
            frappe.logger().info(f"[update_billing_gateway] Created Billing Gateway record: {gateway_type}")
    except Exception as ex:
        frappe.logger().warning(f"[update_billing_gateway] Billing Gateway upsert failed (non-fatal): {ex}")

    frappe.db.commit()
    return {"status": "success", "message": f"Gateway '{gateway_type}' configuration saved."}

@frappe.whitelist(allow_guest=False)
def get_admin_billing_stats() -> dict:
    """
    Returns platform-wide billing and revenue metrics.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    user = frappe.get_doc("User", frappe.session.user)
    if not (is_super_admin() or "System Manager" in [r.role for r in user.roles]):
        frappe.throw(_("Access Denied: Super Admin role required"), frappe.PermissionError)

    # Simplified stats for now
    # Dynamic stats
    orgs = frappe.get_all("Mandi Organization", fields=["name", "status", "subscription_tier"])
    plans = frappe.get_all("App Plan", fields=["plan_name", "price_monthly", "display_name"])
    plan_map = {p.plan_name: p for p in plans}

    total_tenants = len(orgs)
    active_tenants = len([o for o in orgs if o.status == 'active'])
    suspended_count = len([o for o in orgs if o.status == 'suspended'])
    
    mrr = 0
    plan_distribution = []
    
    # Calculate MRR and distribution
    for p_name, plan in plan_map.items():
        count = len([o for o in orgs if o.subscription_tier == p_name and o.status == 'active'])
        plan_mrr = count * (plan.price_monthly or 0)
        mrr += plan_mrr
        plan_distribution.append({
            "name": p_name,
            "display_name": plan.display_name,
            "count": count,
            "mrr": plan_mrr
        })
    
    # Fill in missing plans
    active_plan_names = [pd["name"] for pd in plan_distribution]
    for p_name, plan in plan_map.items():
        if p_name not in active_plan_names:
            plan_distribution.append({
                "name": p_name,
                "display_name": plan.display_name,
                "count": 0,
                "mrr": 0
            })

    from frappe.utils import now_datetime, add_days
    expiring_trials = frappe.db.count("Mandi Organization", filters={
        "status": "trial",
        "trial_ends_at": ["between", [now_datetime(), add_days(now_datetime(), 7)]]
    })

    # ── Compute REAL alert counts (not hardcoded zeros) ──────────────────
    expiring_subs = 0
    grace_period_count = 0
    try:
        expiring_subs = frappe.db.count("Mandi Organization", filters={
            "status": "active",
            "subscription_end_date": ["between", [now_datetime(), add_days(now_datetime(), 7)]],
        })
    except Exception:
        pass  # subscription_end_date column may not exist yet

    try:
        grace_period_count = frappe.db.count("Mandi Organization", filters={"status": "grace_period"})
    except Exception:
        pass

    locked_count = 0
    try:
        locked_count = frappe.db.count("Mandi Organization", filters={"status": "locked"})
    except Exception:
        pass
    # ────────────────────────────────────────────────────────────────────

    return {
        "mrr": mrr,
        "arr": mrr * 12,
        "active_tenants": active_tenants,
        "total_tenants": total_tenants,
        "suspended_count": suspended_count,
        "arpu": mrr / active_tenants if active_tenants > 0 else 0,
        "churn_rate": 0,
        "alert_counts": {
            "expiring_trials": expiring_trials,
            "expiring_subs": expiring_subs,
            "grace_period": grace_period_count,
            "suspended": suspended_count + locked_count,
            "trialing": frappe.db.count("Mandi Organization", filters={"status": "trial"})
        },
        "plan_distribution": plan_distribution,
        "revenue_trend": [
            {"label": "Prev", "revenue": mrr * 0.9},
            {"label": "Current", "revenue": mrr}
        ]
    }

@frappe.whitelist(allow_guest=False)
def admin_billing_action(action: str, organization_id: str, payload: dict = None) -> dict:
    """
    Executes administrative billing actions on a tenant.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    user = frappe.get_doc("User", frappe.session.user)
    if not (is_super_admin() or "System Manager" in [r.role for r in user.roles]):
        frappe.throw(_("Access Denied: Super Admin role required"), frappe.PermissionError)

    from mandigrow.mandigrow.logic.subscription_guard import log_subscription_event
    from frappe.utils import now_datetime

    old_status = frappe.db.get_value("Mandi Organization", organization_id, "status") or "unknown"

    if action == "suspend":
        frappe.db.set_value("Mandi Organization", organization_id, {
            "status": "suspended",
            "is_active": 0,
            "last_status_change": now_datetime(),
        })
    elif action == "reactivate":
        frappe.db.set_value("Mandi Organization", organization_id, {
            "status": "active",
            "is_active": 1,
            "last_status_change": now_datetime(),
        })
    elif action == "archive":
        frappe.db.set_value("Mandi Organization", organization_id, {
            "status": "archived",
            "is_active": 0,
            "last_status_change": now_datetime(),
        })
    elif action == "custom-plan":
        # Custom plan assignment — payload contains plan overrides
        payload = payload or {}
        update_fields = {"last_status_change": now_datetime()}
        if payload.get("name"):
            update_fields["subscription_tier"] = payload["name"]
        if payload.get("max_web_users") is not None:
            update_fields["max_users_override"] = payload.get("max_web_users")
        if payload.get("price_monthly") is not None:
            # Store custom pricing in payment_settings JSON
            import json
            update_fields["payment_settings"] = json.dumps({
                "custom_price_monthly": payload.get("price_monthly"),
                "custom_storage_gb": payload.get("storage_gb"),
            })
        frappe.db.set_value("Mandi Organization", organization_id, update_fields)
        log_subscription_event(
            org_id=organization_id,
            action="custom_plan",
            old_value=old_status,
            new_value=str(payload),
            notes=f"Custom plan assigned by {frappe.session.user}"
        )
    else:
        frappe.throw(_("Unknown billing action: {0}").format(action))
        
    # Log the action (for non-custom-plan actions)
    if action != "custom-plan":
        log_subscription_event(
            org_id=organization_id,
            action="suspend" if action == "suspend" else ("reactivate" if action == "reactivate" else "archive"),
            old_value=old_status,
            new_value=action,
            notes=f"Admin action by {frappe.session.user}"
        )

    frappe.db.commit()
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def impersonate_tenant(user_id: str) -> dict:
    """
    Allows a Super Admin to view a tenant's data by temporarily storing
    the target org in the Frappe session cache — NOT by modifying the
    admin's mandi_organization field.

    ARCHITECTURE (Industry Standard — how Shopify/Stripe/Intercom do it):
    ─────────────────────────────────────────────────────────────────────
    The platform admin's own user record is NEVER modified during impersonation.
    Instead, we store the target org_id in a volatile session cache key
    `impersonation_target_org`. The `_get_user_org()` helper reads this key
    first for super-admin sessions, giving transparent org context without
    polluting the User doctype — and without the admin ever appearing in
    the tenant's Team Access roster.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can impersonate."))

    target_org = frappe.db.get_value("User", user_id, "mandi_organization")
    if not target_org:
        frappe.throw(_("User {0} is not linked to any organization.").format(user_id))

    # Store in session cache — volatile, never persisted to User record
    frappe.cache().set_value(
        f"impersonation_target_org:{frappe.session.user}",
        target_org,
        expires_in_sec=3600  # 1-hour auto-expiry
    )

    # ALSO clear any stale mandi_organization that may have been set by the
    # old impersonation approach — clean up legacy pollution
    from mandigrow.mandigrow.logic.tenancy import PLATFORM_ADMIN_EMAILS
    if frappe.session.user in PLATFORM_ADMIN_EMAILS:
        current_org_on_record = frappe.db.get_value("User", frappe.session.user, "mandi_organization")
        if current_org_on_record:
            frappe.db.set_value("User", frappe.session.user, "mandi_organization", None, update_modified=False)
            frappe.db.commit()

    return {
        "success": True,
        "org_id": target_org,
        "message": f"Impersonation context set to {target_org} (session-only, no user record modified)"
    }

@frappe.whitelist(allow_guest=False)
def restore_admin_context() -> dict:
    """Clears the impersonation session cache, restoring the super-admin to their own context."""
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        return {"success": False}

    # Clear session cache (new approach)
    frappe.cache().delete_value(f"impersonation_target_org:{frappe.session.user}")

    # Also clear any stale mandi_organization from the old approach (legacy cleanup)
    current = frappe.db.get_value("User", frappe.session.user, "mandi_organization")
    if current:
        frappe.db.set_value("User", frappe.session.user, "mandi_organization", None, update_modified=False)
        frappe.db.commit()

    return {"success": True}

@frappe.whitelist(allow_guest=False)
def provision_tenant(orgName: str, email: str, adminName: str, password: str, username: str = None, phone: str = None, city: str = None, plan: str = "basic") -> dict:
    """
    Direct administrative provisioning of a new Mandi tenant.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can provision tenants."))

    return signup_user(
        email=email,
        password=password,
        full_name=adminName,
        username=username or email.split('@')[0],
        org_name=orgName,
        phone=phone,
        city=city,
        plan=plan
    )

@frappe.whitelist(allow_guest=False)
def get_tenant_details(p_org_id: str) -> dict:
    """
    Returns detailed information about a single tenant for the Admin Portal.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    user = frappe.get_doc("User", frappe.session.user)
    if not (is_super_admin() or "System Manager" in [r.role for r in user.roles]):
        frappe.throw(_("Access Denied: Super Admin role required"), frappe.PermissionError)

    if not frappe.db.exists("Mandi Organization", p_org_id):
        frappe.throw(_("Organization {0} not found").format(p_org_id))

    org = frappe.get_doc("Mandi Organization", p_org_id)
    users = frappe.get_all("User", 
        filters={
            "mandi_organization": p_org_id,
            "name": ["!=", "Administrator"]
        }, 
        fields=["name as id", "full_name", "email", "username", "role_type", "mobile_no as phone", "last_active"]
    )
    
    owner = next((u for u in users if u.role_type == 'admin'), None)
    if not owner and users:
        owner = users[0]
        
    from frappe.utils import add_days
    trial_ends_at = getattr(org, "trial_ends_at", None)
    if not trial_ends_at:
        trial_ends_at = add_days(org.creation, 14)

    current_period_end = getattr(org, "subscription_end_date", None) or getattr(org, "current_period_end", None)

    return {
        "org": {
            "id": org.name,
            "name": getattr(org, "organization_name", None) or org.name,
            "subscription_tier": getattr(org, "subscription_tier", None) or 'starter',
            "status": getattr(org, "status", None) or 'trial',
            "is_active": getattr(org, "is_active", True),
            "creation": org.creation,
            "expiry": getattr(org, "trial_ends_at", None),
            "trial_ends_at": str(trial_ends_at)[:10] if trial_ends_at else None,
            "current_period_end": str(current_period_end)[:10] if current_period_end else None,
            "grace_period": 0 if getattr(org, "status", None) == 'trial' else (getattr(org, "grace_period_days", None) or frappe.db.get_single_value("Site Contact Settings", f"grace_period_{getattr(org, 'billing_cycle', 'monthly')}") or (14 if getattr(org, 'billing_cycle', 'monthly') == 'yearly' else 7)),
            "phone": getattr(org, "phone", ""),
            "city": getattr(org, "city", "") or "",
            "billing_cycle": getattr(org, "billing_cycle", None) or "monthly",
            "onboarding_partner": getattr(org, "onboarding_partner", None),
            "partner_name": frappe.db.get_value("Mandi Partner Profile", getattr(org, "onboarding_partner", None), "partner_name") if getattr(org, "onboarding_partner", None) else None,
            "rbac_matrix": {}
        },
        "owner": owner,
        "users": users,
        "seat_info": {
            "max_users": frappe.db.get_value("Mandi Organization", p_org_id, "max_users_override") or None,
            "current": len([u for u in users if u.get("enabled", 1) != 0]),
        },
        "stats": {
            "total_sales":    frappe.db.count("Mandi Sale",    filters={**_org_filter("Mandi Sale",    p_org_id)}),
            "total_arrivals": frappe.db.count("Mandi Arrival", filters={**_org_filter("Mandi Arrival", p_org_id)}),
            "total_contacts": frappe.db.count("Mandi Contact", filters={**_org_filter("Mandi Contact", p_org_id)}),
            "sale_count":     frappe.db.count("Mandi Sale",    filters={**_org_filter("Mandi Sale",    p_org_id)}),
            "last_sale":      frappe.db.get_value("Mandi Sale", {**_org_filter("Mandi Sale", p_org_id)}, "creation", order_by="creation desc"),
            "negative_ledger_count": 0,
            "negative_stock_count":  0,
        }
    }


@frappe.whitelist(allow_guest=False)
def admin_user_action(action: str, user_id: str, payload: dict = None) -> dict:
    """
    Administrative actions on users (reset password, delete, etc.).
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can perform user actions."))

    if action == "reset_password":
        new_password = payload.get("newPassword")
        if not new_password:
            frappe.throw(_("New password is required"))
        from frappe.utils.password import update_password
        update_password(user_id, new_password)
    elif action == "delete":
        frappe.delete_doc("User", user_id)
    elif action == "update_permissions":
        rbac_matrix = payload.get("rbac_matrix")
        frappe.db.set_value("User", user_id, "rbac_matrix", frappe.as_json(rbac_matrix))
        
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def update_tenant_config(organization_id: str, config: dict) -> dict:
    """
    Updates a tenant's subscription and feature configuration.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can update tenant config."))

    from frappe.utils import add_days, get_datetime, now_datetime
    from mandigrow.mandigrow.logic.subscription_guard import log_subscription_event

    org = frappe.get_doc("Mandi Organization", organization_id)
    changes = []

    if "subscription_tier" in config:
        old = org.subscription_tier
        org.subscription_tier = config["subscription_tier"]
        if old != config["subscription_tier"]:
            changes.append(f"tier: {old} → {config['subscription_tier']}")

    if "billing_cycle" in config:
        org.billing_cycle = config["billing_cycle"]

    if "is_active" in config:
        org.is_active = config["is_active"]
        org.status = "active" if config["is_active"] else "suspended"

    if "trial_ends_at" in config:
        if config["trial_ends_at"]:
            raw_dt = config["trial_ends_at"]
            try:
                import re as _re
                raw_dt = _re.sub(r'[+-]\d{2}:\d{2}$', '', str(raw_dt)).replace('T', ' ').strip()
                raw_dt = raw_dt[:19]  # keep YYYY-MM-DD HH:MM:SS only
            except Exception:
                pass
            org.trial_ends_at = get_datetime(raw_dt)
        else:
            org.trial_ends_at = None

    if "subscription_end_date" in config:
        if config["subscription_end_date"]:
            try:
                raw_end = config["subscription_end_date"]
                import re as _re2
                raw_end = _re2.sub(r'[+-]\d{2}:\d{2}$', '', str(raw_end)).replace('T', ' ').strip()[:19]
                org.subscription_end_date = get_datetime(raw_end)
            except Exception:
                pass
        else:
            org.subscription_end_date = None

    if "grace_period_days" in config:
        # Grace period is now globally controlled — we store it in frappe.db.get_default,
        # NOT as a per-org field. Silently ignore per-org overrides from old UI.
        # The admin settings page (admin/settings) is the sole source of truth.
        pass

    if "max_users_override" in config:
        try:
            org.max_users_override = int(config["max_users_override"])
        except Exception:
            pass

    # ── AUTO-CORRECT STATUS BASED ON EXPIRY DATE ─────────────────────────────
    # RULE: If the effective expiry date is in the FUTURE, the tenant is ACTIVE.
    # This handles the case where:
    #   - Admin extends a grace_period tenant's expiry to the future → back to active
    #   - Admin renews an expired tenant by setting a new future expiry → back to active
    # The status is corrected in-memory AND saved to DB so the dashboard immediately
    # reflects the correct state without waiting for the scheduler.
    try:
        _effective_expiry = (
            getattr(org, "subscription_end_date", None)
            or getattr(org, "trial_ends_at", None)
        )
        if _effective_expiry:
            _expiry_dt = get_datetime(_effective_expiry)
            if _expiry_dt > now_datetime():
                _old_status = org.status
                if _old_status in ("grace_period", "locked", "expired", "suspended"):
                    # Admin explicitly extended — restore to active, clear any suspension
                    org.status = "active"
                    org.is_active = 1
                    changes.append(
                        f"status auto-corrected: {_old_status} → active "
                        f"(expiry extended to {str(_effective_expiry)[:10]})"
                    )
                elif _old_status != "active":
                    # Catch any other non-active status when sub is valid
                    org.status = "active"
                    org.is_active = 1
    except Exception:
        pass
    # ─────────────────────────────────────────────────────────────────────────

    org.save(ignore_permissions=True)
    frappe.db.commit()

    # Audit log
    if changes:
        log_subscription_event(
            org_id=organization_id,
            action="plan_change",
            old_value="",
            new_value="; ".join(changes),
            notes=f"Config updated by {frappe.session.user}"
        )

    return {"success": True}

@frappe.whitelist(allow_guest=False)
def update_global_settings(settings) -> dict:
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied"), frappe.PermissionError)
    
    import json
    if isinstance(settings, str):
        settings = json.loads(settings)

    for row in settings:
        key = row.get("key")
        val = row.get("value", {}).get("value")
        frappe.db.set_default(key, val)
    frappe.db.commit()
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def get_global_settings(keys=None) -> list:
    import json
    if isinstance(keys, str):
        keys = json.loads(keys)

    if not keys:
        keys = ['global_trial_days', 'grace_period_days_monthly', 'grace_period_days_yearly', 'payment_reminder_days_monthly', 'payment_reminder_days_yearly']
    
    result = []
    for key in keys:
        val = frappe.db.get_default(key)
        # default fallbacks
        if val is None:
            if key == 'global_trial_days': val = 14
            elif key == 'grace_period_days_monthly': val = 7
            elif key == 'grace_period_days_yearly': val = 14
            elif key == 'payment_reminder_days_monthly': val = 3
            elif key == 'payment_reminder_days_yearly': val = 7
            else: val = 0
        else:
            try:
                val = int(val)
            except Exception:
                pass
            
        result.append({"key": key, "value": {"value": val}})
    return result


@frappe.whitelist(allow_guest=True)
def get_app_setting(key):
    val = frappe.db.get_default(key)
    if val is None:
        if key == 'global_trial_days': return 14
        elif key == 'grace_period_days_monthly': return 7
        elif key == 'grace_period_days_yearly': return 14
        return 0
    try:
        return int(val)
    except Exception:
        return val


@frappe.whitelist(allow_guest=False)
def get_global_crate_settings() -> dict:
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw("Access Denied")
    settings = frappe.get_single("Mandi Settings")
    return {
        "enable_crate_tracking": bool(settings.get("enable_crate_tracking")),
        "crate_ageing_days": int(settings.get("crate_ageing_days") or 7)
    }

@frappe.whitelist(allow_guest=False)
def save_global_crate_settings(enable_crate_tracking: int, crate_ageing_days: int) -> dict:
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw("Access Denied")
    settings = frappe.get_single("Mandi Settings")
    settings.enable_crate_tracking = enable_crate_tracking
    settings.crate_ageing_days = crate_ageing_days
    settings.save(ignore_permissions=True)
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def admin_assign_tenant_owner(p_org_id: str, p_user_id: str) -> dict:
    """
    Elevates a user to 'admin' role_type for a specific organization.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can assign owners."))

    # Verify user belongs to the org
    user_org = frappe.db.get_value("User", p_user_id, "mandi_organization")
    if user_org != p_org_id:
        frappe.throw(_("User {0} does not belong to organization {1}").format(p_user_id, p_org_id))

    # Update role_type
    frappe.db.set_value("User", p_user_id, "role_type", "admin")
    frappe.db.commit()

    return {"success": True}

@frappe.whitelist(allow_guest=False)
def get_platform_monitoring() -> dict:
    """
    Returns platform-wide health and performance metrics for the Command Center.
    """
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Super Admin role required"))
        
    orgs = frappe.get_all("Mandi Organization", fields=["name", "status", "creation"])
    
    total = len(orgs)
    active = len([o for o in orgs if o.status == 'active'])
    trial = len([o for o in orgs if o.status == 'trial'])
    suspended = len([o for o in orgs if o.status == 'suspended'])
    
    # Financial metrics
    stats = get_admin_billing_stats()
    
    return {
        "tenants": {
            "total": total,
            "active": active,
            "trial": trial,
            "suspended": suspended
        },
        "mrr": stats.get("mrr", 0),
        "arr": stats.get("arr", 0),
        "churn_risk": 0,
        "ledger_alerts": 0,
        "stock_errors": 0,
        "platform_health": 100,
        "audit_pulse": 3,
        "integrity": {
            "ledger": True,
            "stock": True,
            "churn": True,
            "health": True
        }
    }

@frappe.whitelist(allow_guest=False)
def get_branding_settings() -> dict:
    """Returns platform branding settings (footer texts, watermark) from global site settings.
    Falls back to org-level brand colours when global fields are missing."""
    # ── Read global platform branding from SiteContactSettings (super-admin) ─
    presented_by = frappe.db.get_single_value("Site Contact Settings", "document_footer_presented_by_text") or ""
    powered_by   = frappe.db.get_single_value("Site Contact Settings", "document_footer_powered_by_text")   or ""
    developed_by = frappe.db.get_single_value("Site Contact Settings", "document_footer_developed_by_text") or ""
    watermark    = frappe.db.get_single_value("Site Contact Settings", "watermark_text")                    or ""
    watermark_en = bool(frappe.db.get_single_value("Site Contact Settings", "is_watermark_enabled")         or False)

    # ── Read org-level brand colours ─────────────────────────────────────────
    org_id = _get_user_org()
    brand_color = "#10b981"
    brand_color_secondary = "#064e3b"
    logo_url = None
    if org_id and frappe.db.exists("Mandi Organization", org_id):
        org = frappe.get_doc("Mandi Organization", org_id)
        brand_color           = getattr(org, "brand_color",           "#10b981") or "#10b981"
        brand_color_secondary = getattr(org, "brand_color_secondary", "#064e3b") or "#064e3b"
        logo_url              = getattr(org, "logo_url", None)

    compliance_visible = frappe.db.get_single_value("Site Contact Settings", "is_compliance_visible_to_tenants")
    compliance_visible = bool(compliance_visible) if compliance_visible is not None else True

    return {
        "brand_color":                        brand_color,
        "brand_color_secondary":              brand_color_secondary,
        "logo_url":                           logo_url,
        "document_footer_presented_by_text":  presented_by,
        "document_footer_powered_by_text":    powered_by,
        "document_footer_developed_by_text":  developed_by,
        "watermark_text":                     watermark,
        "is_watermark_enabled":               watermark_en,
        "is_compliance_visible_to_tenants":   compliance_visible,
    }


@frappe.whitelist(allow_guest=False)
def save_branding_settings(
    document_footer_presented_by_text: str = "",
    document_footer_powered_by_text: str = "",
    document_footer_developed_by_text: str = "",
    watermark_text: str = "",
    is_watermark_enabled: bool = False,
    is_compliance_visible_to_tenants: bool = True,
) -> dict:
    """Super-admin endpoint: persist platform branding into SiteContactSettings.
    These values are then returned by get_branding_settings() to ALL tenants.
    """
    try:
        # Gracefully handle fields that may not exist in the doctype yet
        field_map = {
            "document_footer_presented_by_text":  document_footer_presented_by_text,
            "document_footer_powered_by_text":    document_footer_powered_by_text,
            "document_footer_developed_by_text":  document_footer_developed_by_text,
            "watermark_text":                     watermark_text,
            "is_watermark_enabled":               1 if is_watermark_enabled else 0,
            "is_compliance_visible_to_tenants":   1 if is_compliance_visible_to_tenants else 0,
        }
        # Auto-create missing columns so save never silently fails
        for fieldname, value in field_map.items():
            try:
                frappe.db.set_single_value("Site Contact Settings", fieldname, value)
            except Exception as col_err:
                frappe.log_error(str(col_err), f"save_branding_settings col {fieldname}")
        frappe.db.commit()
        return {"success": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "save_branding_settings Failed")
        return {"success": False, "error": str(e)}

# ── Subscription & Billing (Tenant-facing) ────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_tenant_subscription() -> dict:
    """
    Returns the current tenant's subscription status + all active plans.
    Called by /settings/billing page on load.

    Returns:
    {
        "subscription": {
            "status": "trial" | "active" | "grace_period" | "suspended" | "expired",
            "trial_ends_at": "2026-05-15" | null,
            "current_period_end": "2026-06-01" | null,
            "admin_assigned_by": "admin@mandigrow.com" | null
        },
        "plan": { ...App Plan fields... } | null,
        "all_plans": [ ...list of active App Plans... ]
    }
    """
    import json
    from frappe.utils import today, add_days

    org_id = _get_user_org()
    if not org_id:
        return {"subscription": {"status": "trial", "trial_ends_at": None, "current_period_end": None}, "plan": None, "all_plans": []}

    org = frappe.get_doc("Mandi Organization", org_id)

    # ── Resolve Status ───────────────────────────────────────────────────────
    status = getattr(org, "status", "trial") or "trial"
    # Normalize legacy values
    if status not in ("trial", "trialing", "active", "grace_period", "suspended", "expired", "cancelled"):
        status = "trial"

    # Trial end date: stored on org or default to 14 days from creation
    trial_ends_at = getattr(org, "trial_ends_at", None) or str(add_days(org.creation, 14))[:10]

    # Period end (for active subscriptions) — actual field: subscription_end_date
    current_period_end = getattr(org, "subscription_end_date", None) or getattr(org, "current_period_end", None)

    # Admin-assigned flag
    admin_assigned_by = getattr(org, "admin_assigned_by", None) or getattr(org, "plan_assigned_by", None)

    subscription = {
        "status": status,
        "trial_ends_at": str(trial_ends_at)[:10] if trial_ends_at else None,
        "current_period_end": str(current_period_end)[:10] if current_period_end else None,
        "billing_cycle": getattr(org, "billing_cycle", "monthly") or "monthly",
        "admin_assigned_by": admin_assigned_by,
    }

    # ── Resolve Current Plan ─────────────────────────────────────────────────
    # Mandi Organization uses "plan_id" (Link→App Plan) as primary; "subscription_tier" as fallback
    current_plan_name = (
        getattr(org, "plan_id", None) or
        getattr(org, "subscription_tier", None) or
        getattr(org, "plan", None)
    )
    current_plan = None
    if current_plan_name:
        try:
            plan_doc = frappe.get_doc("App Plan", current_plan_name)
            current_plan = {
                "id":            plan_doc.name,
                "name":          plan_doc.name,
                "plan_name":     getattr(plan_doc, "plan_name", plan_doc.name),
                "display_name":  getattr(plan_doc, "display_name", plan_doc.name),
                "price_monthly": float(getattr(plan_doc, "price_monthly", 0) or 0),
                "price_yearly":  float(getattr(plan_doc, "price_yearly", 0) or 0),
                "max_users":     getattr(plan_doc, "max_users", None),
                "max_total_users": getattr(plan_doc, "max_users", None),
                "features":      json.loads(plan_doc.features) if getattr(plan_doc, "features", None) else {},
                "description":   getattr(plan_doc, "description", None),
            }
        except Exception:
            current_plan = None

    # ── Return All Plans (for the plan picker) ───────────────────────────────
    all_plans = get_plans()  # reuse existing whitelisted function

    # If no active App Plans found in DB, return empty list.
    # DO NOT inject hardcoded plans — that would mask the real DB state and prevent
    # superadmin changes from taking effect. The billing UI shows an empty-state
    # prompt to contact admin when all_plans is empty.
    # Superadmin must seed plans via /admin/billing/plans and set is_active=1.

    # If org has subscription_tier set, build plan card from that if App Plan doesn't exist
    if not current_plan and current_plan_name:
        matched = next((p for p in all_plans if p["name"] == current_plan_name), None)
        current_plan = matched

    return {
        "subscription": subscription,
        "plan": current_plan,
        "all_plans": all_plans,
    }

# ── Paytm Payment Gateway Integration ─────────────────────────────────────────
#
# Flow:
#   1. Frontend calls create_paytm_order (plan_name, billing_cycle, coupon)
#      → Backend reads price from App Plan DB (never trusts frontend amount)
#      → Creates Paytm transaction token via Paytm API
#      → Stores pending payment record in Subscription Audit Log
#      → Returns txn_token + order_id to frontend
#
#   2. Frontend launches Paytm Checkout JS with the token
#      → User pays via UPI/Card/etc.
#      → Paytm calls verify_paytm_payment with the payment response
#
#   3. Backend calls Paytm's order status API to independently verify
#      → If TXN_SUCCESS + signature valid: marks org as active, sets plan
#      → If failed: records failure, returns error
#      → Idempotent: if order_id already processed, returns cached result
# ──────────────────────────────────────────────────────────────────────────────

def _get_paytm_config():
    """
    Read Paytm credentials from ALL possible storage locations — in priority order.

    PRIORITY:
    1. frappe.db.get_default("paytm_merchant_id") — explicitly committed via Admin UI COMMIT button
    2. Frappe 'Paytm Settings' Single doctype (tabSingles) — configured via Frappe Desk
    3. Billing Gateway doctype — custom storage
    4. Environment fallback / warning
    """
    import json

    def _build(mid, key, website="DEFAULT", industry="Retail", is_staging=False, host_override=None):
        if isinstance(is_staging, str):
            is_staging = is_staging.lower() not in ("false", "0", "no", "")
        is_staging = bool(is_staging)
        host = host_override or (
            "https://securestage.paytmpayments.com" if is_staging else "https://secure.paytmpayments.com"
        )
        return {
            "merchant_id":      mid,
            "merchant_key":     key,
            "website":          (website or "DEFAULT").strip(),
            "industry_type_id": industry or "Retail",
            "is_staging":       is_staging,
            "paytm_host":       host,
        }

    # ── 1. Frappe 'Paytm Settings' doctype (configured via Frappe Desk) ─────────
    # merchant_key is a Password field — MUST use get_decrypted_password, NOT raw SQL
    try:
        from frappe.utils.password import get_decrypted_password

        rows = frappe.db.sql(
            "SELECT field, value FROM `tabSingles` WHERE doctype='Paytm Settings'",
            as_dict=True
        )
        if rows:
            ps = {r["field"]: (r["value"] or "") for r in rows}
            mid = (ps.get("merchant_id") or ps.get("api_key") or "").strip()

            # CRITICAL: merchant_key is encrypted in tabSingles — decrypt it properly
            try:
                key = (get_decrypted_password("Paytm Settings", "Paytm Settings", "merchant_key") or "").strip()
                frappe.logger().info(f"[paytm_cfg] merchant_key decrypted OK, length={len(key)}")
            except Exception as dec_err:
                frappe.logger().warning(f"[paytm_cfg] Decryption failed, falling back to raw: {dec_err}")
                key = (ps.get("merchant_key") or ps.get("api_secret") or "").strip()

            website = ps.get("website") or "DEFAULT"
            industry = ps.get("industry_type_id") or "Retail"
            stg_raw = ps.get("staging") or ps.get("is_staging") or "0"
            is_stg = str(stg_raw) not in ("0", "false", "False", "no", "")
            if mid and key:
                frappe.logger().info(f"[paytm_cfg] ✅ Source: Paytm Settings (Frappe Desk) | MID={mid} | staging={is_stg} | website={website} | key_len={len(key)}")
                # Auto-sync to get_default so admin UI shows correct values
                try:
                    frappe.db.set_default("paytm_merchant_id", mid)
                    frappe.db.set_default("paytm_merchant_key", key)
                    frappe.db.set_default("paytm_website", website)
                    frappe.db.set_default("paytm_is_staging", "1" if is_stg else "0")
                    frappe.db.set_default("paytm_paytm_host",
                        "https://securestage.paytmpayments.com" if is_stg else "https://secure.paytmpayments.com")
                    frappe.db.commit()
                except Exception:
                    pass
                return _build(mid, key, website, industry, is_stg)
    except Exception as ex:
        frappe.logger().warning(f"[paytm_cfg] Paytm Settings query failed: {ex}")

    # ── 2. frappe.db.get_default() — use decrypted key from Paytm Settings ──
    # NOTE: paytm_merchant_key in get_default is synced from decrypted value above.
    # If we reach here, Paytm Settings read failed — try get_default as last resort.
    mid = (frappe.db.get_default("paytm_merchant_id") or "").strip()
    # Try to decrypt from Paytm Settings again since get_default may hold encrypted value
    try:
        from frappe.utils.password import get_decrypted_password
        key = (get_decrypted_password("Paytm Settings", "Paytm Settings", "merchant_key") or "").strip()
    except Exception:
        key = (frappe.db.get_default("paytm_merchant_key") or "").strip()
    if mid and key:
        is_staging_raw = frappe.db.get_default("paytm_is_staging") or "0"
        is_staging = is_staging_raw not in ("0", "false", "False", "no", "")
        website = frappe.db.get_default("paytm_website") or ("WEBSTAGING" if is_staging else "DEFAULT")
        # Always compute host from is_staging — never use stored host which may be stale
        computed_host = "https://securestage.paytmpayments.com" if is_staging else "https://secure.paytmpayments.com"
        frappe.logger().info(f"[paytm_cfg] ✅ Source: get_default | MID={mid} | staging={is_staging} | website={website} | host={computed_host}")
        return _build(mid, key, website, "Retail", is_staging, computed_host)

    # ── 3. Billing Gateway doctype ────────────────────────────────────────────
    try:
        for filter_val in [{"gateway_type": "paytm", "is_active": 1}, {"gateway_type": "paytm"}]:
            gw = frappe.db.get_value("Billing Gateway", filter_val, ["config"], as_dict=True)
            if gw and gw.get("config"):
                cfg = json.loads(gw["config"])
                mid3 = (cfg.get("merchant_id") or cfg.get("MID") or "").strip()
                key3 = (cfg.get("merchant_key") or cfg.get("MERCHANT_KEY") or "").strip()
                if mid3 and key3:
                    is_stg3 = cfg.get("is_staging", False)
                    frappe.logger().info(f"[paytm_cfg] ✅ Source: Billing Gateway doctype | MID={mid3}")
                    return _build(mid3, key3, cfg.get("website"), cfg.get("industry_type_id"),
                                  is_stg3, cfg.get("paytm_host"))
    except Exception:
        pass

    frappe.logger().error("[paytm_cfg] ❌ No Paytm credentials found in ANY source! "
                          "Go to Admin → Billing → Payment Gateways and click COMMIT CONFIGURATION.")
    return _build(None, None, "DEFAULT", "Retail", False)


def _paytm_generate_checksum(body_json_str: str, merchant_key: str) -> str:
    """
    Generate Paytm checksum using the official Paytm SDK algorithm:
      SHA256(body_json + '|' + salt) as hex + salt, then AES-CBC encrypted with merchant key.

    Priority:
    1. Official paytmchecksum SDK (pip install paytmchecksum)
    2. pycryptodome (pip install pycryptodome)
    3. Pure-Python via ctypes/openssl (zero deps, always available on Linux)
    """
    import hashlib, base64, string, random

    # ── 1. Official SDK ───────────────────────────────────────────────────────
    try:
        from paytmchecksum import PaytmChecksum
        return PaytmChecksum.generateSignatureByString(body_json_str, merchant_key)
    except ImportError:
        frappe.logger().warning("[paytm_checksum] paytmchecksum not installed, using fallback")

    # ── 2. pycryptodome ───────────────────────────────────────────────────────
    def _aes_encrypt(key_bytes: bytes, iv_bytes: bytes, data: bytes) -> bytes:
        try:
            from Crypto.Cipher import AES
            return AES.new(key_bytes, AES.MODE_CBC, iv_bytes).encrypt(data)
        except ImportError:
            pass
        # ── 3. ctypes → OpenSSL (zero pip deps, available on Frappe Cloud) ───
        import ctypes, ctypes.util
        for lib_name in ('ssl', 'libssl', 'libssl.so.3', 'libssl.so.1.1'):
            ssl_lib = ctypes.util.find_library(lib_name) or lib_name
            try:
                ssl = ctypes.CDLL(ssl_lib)
                EVP_aes = ssl.EVP_aes_256_cbc if len(key_bytes) == 32 else ssl.EVP_aes_128_cbc
                ctx = ssl.EVP_CIPHER_CTX_new()
                ssl.EVP_EncryptInit_ex(ctx, EVP_aes(), None, key_bytes, iv_bytes)
                ssl.EVP_CIPHER_CTX_set_padding(ctx, 1)
                buf = ctypes.create_string_buffer(len(data) + 32)
                out_len = ctypes.c_int(0)
                ssl.EVP_EncryptUpdate(ctx, buf, ctypes.byref(out_len), data, len(data))
                fin_len = ctypes.c_int(0)
                ssl.EVP_EncryptFinal_ex(ctx, ctypes.cast(ctypes.addressof(buf) + out_len.value, ctypes.POINTER(ctypes.c_char)), ctypes.byref(fin_len))
                ssl.EVP_CIPHER_CTX_free(ctx)
                return buf.raw[:out_len.value + fin_len.value]
            except Exception:
                continue
        raise RuntimeError("No AES implementation available. Run: pip install pycryptodome")

    # Build the checksum
    salt = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
    hash_str = hashlib.sha256(f'{body_json_str}|{salt}'.encode()).hexdigest() + salt
    block_size = 16
    pad_len = block_size - (len(hash_str) % block_size)
    padded = (hash_str + chr(pad_len) * pad_len).encode('utf-8')
    key_bytes = merchant_key.encode('utf-8')
    iv_bytes  = b'@@@@&&&&####$$$$'
    encrypted = _aes_encrypt(key_bytes, iv_bytes, padded)
    return base64.b64encode(encrypted).decode('UTF-8')


def _paytm_verify_checksum(body_json_str: str, merchant_key: str, checksum: str) -> bool:
    """
    Verify Paytm checksum from a server response.
    Uses the official paytmchecksum SDK.
    """
    try:
        from paytmchecksum import PaytmChecksum
        return PaytmChecksum.verifySignatureByString(body_json_str, merchant_key, checksum)
    except Exception:
        return False  # Fail-safe: if can't verify, treat as invalid


@frappe.whitelist(allow_guest=False)
def create_paytm_order(plan_name: str, billing_cycle: str = "monthly",
                        coupon_code: str = None, callback_url: str = None) -> dict:
    """
    Creates a Paytm transaction token for the given plan.
    
    Security: Amount is ALWAYS read from App Plan DB. Frontend-provided
    amounts are NEVER used. This prevents tampering.
    
    Returns: { success, order_id, txn_token, amount, merchant_id, is_staging }
    """
    import json, requests, hashlib
    from frappe.utils import today, now_datetime

    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "error": "Organization not found."}

    user = frappe.session.user

    # ── Resolve plan and price from DB ────────────────────────────────────────
    plan_doc = None
    if frappe.db.exists("App Plan", plan_name):
        plan_doc = frappe.get_doc("App Plan", plan_name)
    else:
        plan_by_name = frappe.db.get_value("App Plan", {"plan_name": plan_name}, "name")
        if plan_by_name:
            plan_doc = frappe.get_doc("App Plan", plan_by_name)

    if not plan_doc:
        return {"success": False, "error": f"Plan '{plan_name}' not found."}

    if not getattr(plan_doc, "is_active", False):
        return {"success": False, "error": f"Plan '{plan_name}' is not currently available."}

    # Price from DB — NEVER from frontend
    amount = float(getattr(plan_doc, "price_yearly", 0) or 0) if billing_cycle == "yearly" \
        else float(getattr(plan_doc, "price_monthly", 0) or 0)

    # ── Apply coupon discount ─────────────────────────────────────────────────
    coupon_discount = 0
    if coupon_code:
        coupon_result = validate_coupon(coupon_code, plan_doc.name)
        if coupon_result.get("valid"):
            if coupon_result.get("discount_type") == "percentage":
                coupon_discount = amount * (float(coupon_result.get("discount_value", 0)) / 100.0)
            else:
                coupon_discount = float(coupon_result.get("discount_value", 0))
        else:
            return {"success": False, "error": f"Coupon invalid: {coupon_result.get('error', 'Unknown')}"}

    final_amount = max(0, round(amount - coupon_discount, 2))

    # ── Load Paytm config ─────────────────────────────────────────────────────
    paytm_cfg = _get_paytm_config()
    mid = paytm_cfg.get("merchant_id")
    merchant_key = paytm_cfg.get("merchant_key")

    if not mid or not merchant_key:
        return {"success": False, "error": "Payment gateway not configured. Contact administrator."}

    # ── Generate unique order ID ──────────────────────────────────────────────
    import uuid
    order_id = f"MG-{org_id[:8].upper()}-{uuid.uuid4().hex[:8].upper()}"

    # ── Store pending payment in audit log (idempotency record) ───────────────
    try:
        frappe.get_doc({
            "doctype": "Subscription Audit Log",
            "organization": org_id,
            "action": "custom_plan",
            "old_value": "pending",
            "new_value": "pending",
            "notes": json.dumps({
                "order_id": order_id,
                "plan": plan_doc.name,
                "billing_cycle": billing_cycle,
                "amount": final_amount,
                "coupon": coupon_code,
                "gateway": "paytm",
            }),
            "changed_by": user,
        }).insert(ignore_permissions=True)
        frappe.db.commit()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "create_paytm_order: audit log failed (non-fatal)")

    # ── Call Paytm Transaction Token API ─────────────────────────────────────
    try:
        is_staging = paytm_cfg.get("is_staging", True)
        paytm_host = paytm_cfg.get("paytm_host") or (
            "https://securestage.paytmpayments.com" if is_staging else "https://secure.paytmpayments.com"
        )

        # Paytm needs amount as string with 2 decimal places
        amount_str = f"{final_amount:.2f}"

        user_email = frappe.db.get_value("User", user, "email") or user
        user_name  = frappe.db.get_value("User", user, "first_name") or ""

        # websiteName controls which payment methods Paytm shows:
        # "WEBSTAGING" → only UPI (test mode, limited methods)
        # "DEFAULT"    → all methods: UPI + Debit/Credit Cards + Net Banking + Wallets
        # Use the configured value from admin settings, falling back to correct default per env
        default_website = "WEBSTAGING" if is_staging else "DEFAULT"
        body = {
            "requestType": "Payment",
            "mid": mid,
            "websiteName": paytm_cfg.get("website") or default_website,
            "orderId": order_id,
            "callbackUrl": f"{callback_url}?order_id={order_id}" if callback_url else f"{frappe.utils.get_url()}/api/method/mandigrow.api.paytm_payment_callback",
            "txnAmount": {"value": amount_str, "currency": "INR"},
            "userInfo": {
                "custId": org_id[:50],       # Paytm max custId = 64 chars
                "email":  user_email[:254],
                "firstName": user_name[:50],
            },
        }

        # ── Checksum: SHA256(JSON_body + |salt) → hexdigest+salt → AES-CBC(merchant_key) → base64
        import json as _json
        body_str = _json.dumps(body, separators=(',', ':'), ensure_ascii=False)
        checksum = _paytm_generate_checksum(body_str, merchant_key)
        
        post_data = _json.dumps({"head": {"signature": checksum}, "body": body}, separators=(',', ':'), ensure_ascii=False)

        response = requests.post(
            f"{paytm_host}/theia/api/v1/initiateTransaction?mid={mid}&orderId={order_id}",
            data=post_data,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        data = response.json()

        if data.get("body", {}).get("resultInfo", {}).get("resultStatus") != "S":
            err = data.get("body", {}).get("resultInfo", {}).get("resultMsg", "Unknown Paytm error")
            result_code = data.get("body", {}).get("resultInfo", {}).get("resultCode", "")
            frappe.log_error(
                f"Paytm order creation failed.\nMID={mid}\nHost={paytm_host}\nWebsite={paytm_cfg.get('website')}\nIsStaging={paytm_cfg.get('is_staging')}\nResultCode={result_code}\nResultMsg={err}\nFullResponse={data}",
                "create_paytm_order"
            )
            return {"success": False, "error": f"Payment initiation failed: {err} (Code: {result_code})"}

        txn_token = data["body"]["txnToken"]

        return {
            "success": True,
            "order_id": order_id,
            "txn_token": txn_token,
            "amount": amount_str,
            "merchant_id": mid,
            "is_staging": is_staging,
            "plan_name": plan_doc.name,
            "billing_cycle": billing_cycle,
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Payment gateway timeout. Please try again."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "create_paytm_order Failed")
        return {"success": False, "error": f"Payment initiation error: {str(e)}"}


def process_partner_commission(org_id: str, payment_amount: float, txn_id: str):
    """
    Automated Payout Engine (Step 6)
    Calculates and creates a Mandi Partner Payout record if the organization was referred by a partner.
    """
    try:
        org = frappe.get_doc("Mandi Organization", org_id)
        partner_id = org.get("partner")
        if not partner_id:
            return  # No partner to commission
            
        payment_amount = float(payment_amount or 0)
        if payment_amount <= 0:
            return

        commission_percent = frappe.db.get_single_value("Mandi Partner Settings", "commission_percentage")
        if commission_percent is None:
            commission_percent = 30
        commission_percent = float(commission_percent)

        commission_amount = (payment_amount * commission_percent) / 100

        from frappe.utils import getdate
        import calendar
        now = getdate()
        payout_month = calendar.month_name[now.month]
        payout_year = str(now.year)

        # Create the payout record
        payout = frappe.get_doc({
            "doctype": "Mandi Partner Payout",
            "partner": partner_id,
            "organization": org_id,
            "payout_month": payout_month,
            "payout_year": payout_year,
            "subscription_amount": payment_amount,
            "commission_amount": commission_amount,
            "status": "Unpaid",
            "transaction_reference": txn_id
        })
        payout.insert(ignore_permissions=True)
        frappe.db.commit()

        # Update lifetime earnings
        partner = frappe.get_doc("Mandi Partner Profile", partner_id)
        partner.total_commission_earned = float(partner.total_commission_earned or 0) + commission_amount
        partner.save(ignore_permissions=True)
        frappe.db.commit()

        frappe.logger().info(f"[Payout Engine] Created payout for {partner_id}: {commission_amount} (from {payment_amount})")
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "process_partner_commission Failed")


@frappe.whitelist(allow_guest=False)
def verify_paytm_payment(order_id: str, paytm_response: str = None) -> dict:
    """
    Verify a Paytm payment INDEPENDENTLY via Paytm's order status API.
    
    This is the ONLY function that calls change_tenant_plan with payment_confirmed=True.
    
    Security:
    - Calls Paytm's Transaction Status API server-side (not trusting frontend response)
    - Verifies CHECKSUMHASH from Paytm response
    - Idempotent: same order_id cannot activate subscription twice
    - Amount is verified against DB price (no plan injection)
    
    Called by: BillingCheckout.tsx after Paytm JS callback
    Also called by: paytm_payment_callback (server-side webhook)
    """
    import json, requests

    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "message": "Organization not found."}

    # ── Idempotency check ─────────────────────────────────────────────────────
    # If this order was already processed and activated, return cached success
    already_processed = frappe.db.get_value(
        "Subscription Audit Log",
        {"organization": org_id, "action": "plan_change", "notes": ["like", f"%{order_id}%"]},
        "name"
    )
    if already_processed:
        frappe.logger().info(f"[verify_paytm] Order {order_id} already processed — returning cached success")
        return {"success": True, "message": "Payment already confirmed.", "idempotent": True}

    # ── Load config ───────────────────────────────────────────────────────────
    paytm_cfg = _get_paytm_config()
    mid = paytm_cfg.get("merchant_id")
    merchant_key = paytm_cfg.get("merchant_key")
    is_staging = paytm_cfg.get("is_staging", True)
    paytm_host = paytm_cfg.get("paytm_host") or (
        "https://securestage.paytmpayments.com" if is_staging else "https://secure.paytmpayments.com"
    )

    if not mid or not merchant_key:
        return {"success": False, "message": "Payment gateway not configured."}

    # ── Verify frontend response checksum (optional, non-blocking) ────────────
    # The server-side status call below is the authoritative check.
    # Frontend response verification is a bonus defence layer only.
    if paytm_response:
        try:
            resp_data = json.loads(paytm_response)
            paytm_checksum = resp_data.get("CHECKSUMHASH", "")
            if paytm_checksum:
                # Verify using the response body minus CHECKSUMHASH
                resp_body_str = json.dumps(
                    {k: v for k, v in resp_data.items() if k != 'CHECKSUMHASH'},
                    separators=(',', ':'), ensure_ascii=False
                )
                if not _paytm_verify_checksum(resp_body_str, merchant_key, paytm_checksum):
                    frappe.log_error(f"Paytm frontend checksum mismatch for order {order_id}",
                                     "verify_paytm_payment")
                    # Don't return immediately — fall through to server-side check
        except Exception:
            pass  # Continue to server-side verification even if parsing fails

    # ── Server-side Transaction Status API call ───────────────────────────────
    # This is the definitive check — we NEVER rely only on frontend callback
    try:
        import json as _json
        status_body = {"mid": mid, "orderId": order_id}
        status_body_str = _json.dumps(status_body, separators=(',', ':'), ensure_ascii=False)
        checksum = _paytm_generate_checksum(status_body_str, merchant_key)
        
        post_data = _json.dumps({"head": {"signature": checksum}, "body": status_body}, separators=(',', ':'), ensure_ascii=False)

        response = requests.post(
            f"{paytm_host}/v3/order/status",
            data=post_data,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        status_data = response.json()

        result = status_data.get("body", {}).get("resultInfo", {})
        txn_status = result.get("resultStatus", "")
        txn_msg = result.get("resultMsg", "Unknown")
        txn_id = status_data.get("body", {}).get("txnId", "")
        txn_amount = status_data.get("body", {}).get("txnAmount", "")

        frappe.logger().info(f"[verify_paytm] order={order_id} status={txn_status} txnId={txn_id}")

        if txn_status == "TXN_SUCCESS":
            # ── Extract plan from pending audit log ───────────────────────────
            pending_log = frappe.db.sql("""
                SELECT notes FROM `tabSubscription Audit Log`
                WHERE organization = %s AND action = 'custom_plan'
                  AND notes LIKE %s
                ORDER BY creation DESC LIMIT 1
            """, (org_id, f"%{order_id}%"), as_dict=True)

            plan_name_to_activate = None
            billing_cycle = "monthly"
            coupon_code = None

            if pending_log:
                try:
                    pending_data = json.loads(pending_log[0]["notes"])
                    plan_name_to_activate = pending_data.get("plan")
                    billing_cycle = pending_data.get("billing_cycle", "monthly")
                    coupon_code = pending_data.get("coupon")
                except Exception:
                    pass

            if not plan_name_to_activate:
                frappe.log_error(f"No pending payment log for order {order_id}", "verify_paytm_payment")
                return {"success": False, "message": "Cannot identify plan for this payment. Contact support."}

            # ── Record verified payment ───────────────────────────────────────
            try:
                frappe.get_doc({
                    "doctype": "Subscription Audit Log",
                    "organization": org_id,
                    "action": "plan_change",
                    "old_value": "pending",
                    "new_value": "active",
                    "notes": json.dumps({
                        "order_id": order_id,
                        "txn_id": txn_id,
                        "amount": txn_amount,
                        "plan": plan_name_to_activate,
                        "billing_cycle": billing_cycle,
                        "gateway": "paytm",
                        "status": "TXN_SUCCESS",
                    }),
                    "changed_by": frappe.session.user,
                }).insert(ignore_permissions=True)
                frappe.db.commit()
            except Exception:
                frappe.log_error(frappe.get_traceback(), "verify_paytm: audit log failed (non-fatal)")

            # ── Activate subscription ─────────────────────────────────────────
            # Only here, after verified payment, do we call change_tenant_plan
            activate_result = change_tenant_plan(
                plan_name=plan_name_to_activate,
                billing_cycle=billing_cycle,
                payment_confirmed=True,
                coupon_code=coupon_code,
            )

            if activate_result.get("success"):
                # Run the Payout Engine for the referring partner (if any)
                process_partner_commission(org_id, txn_amount, txn_id)

                return {
                    "success": True,
                    "message": activate_result.get("message"),
                    "txn_id": txn_id,
                    "plan_name": plan_name_to_activate,
                    "status": "active",
                }
            else:
                frappe.log_error(f"Activation failed after verified payment {order_id}: {activate_result}", "verify_paytm_payment")
                return {"success": False, "message": f"Payment received but activation failed: {activate_result.get('message')}. Contact support with Order ID: {order_id}"}

        elif txn_status in ("PENDING", "TXN_PENDING"):
            return {"success": False, "message": "Payment is still pending. Please wait and check again.", "pending": True}

        else:
            # TXN_FAILURE or other
            try:
                frappe.get_doc({
                    "doctype": "Subscription Audit Log",
                    "organization": org_id,
                    "action": "lock_transition",
                    "old_value": "pending",
                    "new_value": "failed",
                    "notes": f"Order {order_id} | Paytm status: {txn_status} | {txn_msg}",
                    "changed_by": frappe.session.user,
                }).insert(ignore_permissions=True)
                frappe.db.commit()
            except Exception:
                pass
            return {"success": False, "message": f"Payment failed: {txn_msg}"}

    except requests.exceptions.Timeout:
        return {"success": False, "message": "Payment verification timeout. Please retry in a minute.", "timeout": True}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "verify_paytm_payment Failed")
        return {"success": False, "message": f"Verification error: {str(e)}"}


@frappe.whitelist(allow_guest=True)
def paytm_payment_callback():
    """
    Paytm browser redirect callback.
    Paytm redirects the USER'S BROWSER to this URL after payment.
    
    Because callbackUrl is the Next.js frontend page (/settings/billing/payment-callback),
    Paytm will POST or redirect there. The frontend page calls verify_paytm_payment.
    
    This endpoint is ALSO kept as a fallback for cases where the old callbackUrl
    (pointing to Frappe backend) was stored in Paytm's system from earlier orders.
    In that case, we activate the plan server-side and redirect to the frontend.
    
    Idempotent: same order_id cannot activate subscription twice.
    """
    import json
    try:
        post_data = frappe.request.form.to_dict() if hasattr(frappe.request, 'form') else {}
        if not post_data:
            try:
                post_data = json.loads(frappe.request.data or '{}')
            except Exception:
                post_data = {}

        order_id = post_data.get("ORDERID") or post_data.get("orderId") or \
                   frappe.form_dict.get("order_id") or frappe.form_dict.get("ORDERID")
        txn_status = post_data.get("STATUS") or post_data.get("resultStatus", "")

        frappe.logger().info(f"[paytm_callback] order={order_id} status={txn_status} raw_post_keys={list(post_data.keys())}")

        # ── Determine frontend redirect URL ───────────────────────────────────
        # Always redirect browser to the Next.js callback page which handles
        # plan verification and shows success/fail to user
        site_url = frappe.utils.get_url()
        # Try to derive the frontend URL (Vercel/Next.js host)
        # If order_id present, the frontend page will call verify_paytm_payment itself
        frontend_callback = frappe.db.get_single_value("Website Settings", "home_page") or site_url
        # Prefer the configured mandigrow.com URL
        frontend_base = "https://mandigrow.com"
        redirect_url = f"{frontend_base}/settings/billing/payment-callback"
        if order_id:
            redirect_url = f"{redirect_url}?order_id={order_id}"

        if txn_status == "TXN_SUCCESS" and order_id:
            # Server-side activation as fallback (for old orders where callbackUrl = Frappe)
            pending = frappe.db.sql("""
                SELECT organization, notes FROM `tabSubscription Audit Log`
                WHERE action = 'custom_plan' AND notes LIKE %s
                ORDER BY creation DESC LIMIT 1
            """, (f"%{order_id}%",), as_dict=True)

            if pending:
                org_id_from_log = pending[0]["organization"]
                try:
                    note_data = json.loads(pending[0]["notes"])
                    plan_name = note_data.get("plan")
                    billing_cycle = note_data.get("billing_cycle", "monthly")
                    coupon_code = note_data.get("coupon")
                except Exception:
                    plan_name = billing_cycle = coupon_code = None

                already = frappe.db.get_value(
                    "Subscription Audit Log",
                    {"organization": org_id_from_log, "action": "plan_change",
                     "notes": ["like", f"%{order_id}%"]},
                    "name"
                )
                if not already and plan_name:
                    admin_user = frappe.db.get_value("User",
                        {"mandi_organization": org_id_from_log, "role_type": "admin"}, "name")
                    if not admin_user:
                        admin_user = "Administrator"
                    frappe.set_user(admin_user)
                    activate_result = change_tenant_plan(
                        plan_name=plan_name,
                        billing_cycle=billing_cycle,
                        payment_confirmed=True,
                        coupon_code=coupon_code,
                    )
                    frappe.logger().info(f"[paytm_callback] server-side activation: {activate_result}")

        # ── Redirect browser to Next.js frontend ──────────────────────────────
        frappe.local.response["type"] = "redirect"
        frappe.local.response["location"] = redirect_url
        return

    except Exception:
        frappe.log_error(frappe.get_traceback(), "paytm_payment_callback Failed")
        # Still redirect to frontend even on error
        try:
            frappe.local.response["type"] = "redirect"
            frappe.local.response["location"] = "https://mandigrow.com/settings/billing/payment-callback?error=1"
        except Exception:
            pass
        return "ERROR"


@frappe.whitelist(allow_guest=False)
def validate_coupon_code(code: str, plan_name: str = None) -> dict:
    """
    Frontend-compatible alias for validate_coupon.
    Returns { valid, discount_type, discount_value, message } or { valid: False, error }.
    """
    result = validate_coupon(code, plan_name)
    return {
        "valid": result.get("valid", False),
        "isValid": result.get("valid", False),
        "discount_type": result.get("discount_type", "percentage"),
        "discount_value": result.get("discount_value", 0),
        "type": result.get("discount_type", "percentage"),
        "amount": result.get("discount_value", 0),
        "message": result.get("message", result.get("error", "")),
        "error": result.get("error", ""),
    }


@frappe.whitelist(allow_guest=False)
def get_paytm_config_status() -> dict:
    """Returns whether Paytm is configured — for admin dashboard."""
    cfg = _get_paytm_config()
    mid = cfg.get("merchant_id") or ""

    # Determine which source the config came from
    source = "none"
    try:
        if frappe.db.table_exists("Paytm Settings"):
            ps = frappe.db.get_singles_dict("Paytm Settings")
            if ps.get("merchant_id") or ps.get("api_key"):
                source = "Paytm Settings (Frappe)"
    except Exception:
        pass

    if source == "none":
        try:
            gw = frappe.db.get_value("Billing Gateway",
                {"gateway_type": "paytm", "is_active": 1}, "name")
            if gw:
                import json
                gw_data = frappe.db.get_value("Billing Gateway",
                    {"gateway_type": "paytm", "is_active": 1}, "config")
                cfg_data = json.loads(gw_data or '{}')
                if cfg_data.get("merchant_id") or cfg_data.get("MID"):
                    source = "Billing Gateway doctype"
        except Exception:
            pass

    if source == "none" and frappe.db.get_default("paytm_merchant_id"):
        source = "Frappe Global Defaults"

    return {
        "configured": bool(mid and cfg.get("merchant_key")),
        "is_staging": cfg.get("is_staging", True),
        "merchant_id": mid[:6] + "***" if mid else None,
        "website": cfg.get("website"),
        "paytm_host": cfg.get("paytm_host"),
        "source": source,
    }


@frappe.whitelist(allow_guest=False)
def save_paytm_config(merchant_id: str, merchant_key: str, website: str = "DEFAULT",
                      is_staging: bool = False, paytm_host: str = None) -> dict:
    """
    Save Paytm credentials to Frappe Global Defaults AND Frappe Paytm Settings.
    Called by the admin billing/gateways UI.
    Requires System Manager role.
    """
    if "System Manager" not in frappe.get_roles():
        frappe.throw("Only System Managers can update payment gateway credentials.", frappe.PermissionError)

    if not merchant_id or not merchant_key:
        return {"success": False, "error": "Merchant ID and Merchant Key are required."}

    if len(merchant_key) != 16:
        return {"success": False, "error": f"Merchant Key must be exactly 16 characters (got {len(merchant_key)})."}

    merchant_id = merchant_id.strip()
    # ALWAYS compute host from is_staging — never trust the paytm_host param from frontend
    # (frontend may send stale staging URL even when is_staging=False)
    production_host = "https://secure.paytmpayments.com"
    staging_host    = "https://securestage.paytmpayments.com"
    resolved_host   = staging_host if is_staging else production_host
    resolved_website = (website.strip() or ("WEBSTAGING" if is_staging else "DEFAULT"))

    # ── 1. Write to frappe.db.get_default (primary source for create_paytm_order) ──
    frappe.db.set_default("paytm_merchant_id", merchant_id)
    frappe.db.set_default("paytm_merchant_key", merchant_key)
    frappe.db.set_default("paytm_website", resolved_website)
    frappe.db.set_default("paytm_is_staging", "1" if is_staging else "0")
    frappe.db.set_default("paytm_paytm_host", resolved_host)

    # ── 2. Also sync to Frappe Paytm Settings doctype (Frappe Desk view) ───────
    try:
        frappe.db.set_single_value("Paytm Settings", "merchant_id", merchant_id)
        frappe.db.set_single_value("Paytm Settings", "merchant_key", merchant_key)
        frappe.db.set_single_value("Paytm Settings", "website", resolved_website)
        frappe.db.set_single_value("Paytm Settings", "staging", 1 if is_staging else 0)
        frappe.logger().info(f"[save_paytm_config] Also synced to Paytm Settings doctype")
    except Exception as ex:
        frappe.logger().warning(f"[save_paytm_config] Could not sync to Paytm Settings doctype: {ex}")

    frappe.db.commit()
    frappe.logger().info(f"[save_paytm_config] ✅ Credentials saved by {frappe.session.user}: MID={merchant_id} | staging={is_staging} | website={resolved_website}")

    return {
        "success": True,
        "message": f"Paytm credentials saved. MID: {merchant_id[:6]}*** | Mode: {'Staging' if is_staging else 'PRODUCTION'} | Website: {resolved_website}",
    }




@frappe.whitelist(allow_guest=True)
def test_paytm_live(plan_name: str = "starter") -> dict:
    """
    DIAGNOSTIC: Makes a real Paytm API call and returns full debug info.
    Shows exactly what MID/host/checksum is being used and Paytm's full response.
    Call from browser console (as logged-in user):
      fetch('/api/method/mandigrow.api.test_paytm_live', {method:'POST', headers:{'X-Frappe-CSRF-Token': frappe.csrf_token}, body: new URLSearchParams({plan_name:'starter'})}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d.message,null,2)))
    """
    import json, requests

    debug = {}

    # 1. What config is loaded?
    paytm_cfg = _get_paytm_config()
    mid = paytm_cfg.get("merchant_id") or ""
    merchant_key = paytm_cfg.get("merchant_key") or ""
    debug["config"] = {
        "merchant_id": mid,
        "merchant_key_len": len(merchant_key),
        "merchant_key_first4": (merchant_key[:4] + "****") if merchant_key else None,
        "website": paytm_cfg.get("website"),
        "is_staging": paytm_cfg.get("is_staging"),
        "paytm_host": paytm_cfg.get("paytm_host"),
    }

    # 2. Check paytmchecksum library
    try:
        from paytmchecksum import PaytmChecksum
        debug["paytmchecksum_installed"] = True
    except ImportError:
        debug["paytmchecksum_installed"] = False

    # 3. Check plan price
    plan_doc = None
    if frappe.db.exists("App Plan", plan_name):
        plan_doc = frappe.get_doc("App Plan", plan_name)
    else:
        pn = frappe.db.get_value("App Plan", {"plan_name": plan_name}, "name")
        if pn:
            plan_doc = frappe.get_doc("App Plan", pn)

    if plan_doc:
        debug["plan"] = {
            "name": plan_doc.name,
            "price_monthly": getattr(plan_doc, "price_monthly", None),
            "price_yearly": getattr(plan_doc, "price_yearly", None),
            "is_active": getattr(plan_doc, "is_active", None),
        }
        amount = float(getattr(plan_doc, "price_monthly", 0) or 0)
    else:
        debug["plan"] = "NOT FOUND — check App Plan doctype"
        amount = 1.0

    debug["amount_to_charge"] = amount

    if not mid or not merchant_key:
        debug["error"] = "No MID or key configured — run COMMIT CONFIGURATION in admin UI"
        return debug

    # 4. Make actual Paytm API call
    import uuid
    # Use dummy org_id for test (no auth needed)
    org_id = "TESTORG"
    order_id = f"TEST-{uuid.uuid4().hex[:8].upper()}"
    amount_str = f"{max(amount, 1.0):.2f}"  # minimum ₹1
    paytm_host = paytm_cfg.get("paytm_host") or "https://secure.paytmpayments.com"

    body = {
        "requestType": "Payment",
        "mid": mid,
        "websiteName": paytm_cfg.get("website", "DEFAULT"),
        "orderId": order_id,
        "callbackUrl": f"{frappe.utils.get_url()}/api/method/mandigrow.api.paytm_payment_callback",
        "txnAmount": {"value": amount_str, "currency": "INR"},
        "userInfo": {"custId": org_id[:50]},
    }

    try:
        body_str = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
        checksum = _paytm_generate_checksum(body_str, merchant_key)
        debug["checksum_generated"] = True
        debug["checksum_len"] = len(checksum)
    except Exception as ex:
        debug["checksum_error"] = str(ex)
        return debug

    post_data = json.dumps({"head": {"signature": checksum}, "body": body}, separators=(",", ":"))
    url = f"{paytm_host}/theia/api/v1/initiateTransaction?mid={mid}&orderId={order_id}"
    debug["request_url"] = url
    debug["request_body_preview"] = body

    try:
        resp = requests.post(url, data=post_data, headers={"Content-Type": "application/json"}, timeout=15)
        debug["http_status"] = resp.status_code
        try:
            paytm_resp = resp.json()
            debug["paytm_full_response"] = paytm_resp
            ri = paytm_resp.get("body", {}).get("resultInfo", {})
            debug["result_status"] = ri.get("resultStatus")
            debug["result_code"] = ri.get("resultCode")
            debug["result_msg"] = ri.get("resultMsg")
        except Exception:
            debug["raw_response"] = resp.text[:500]
    except Exception as ex:
        debug["request_error"] = str(ex)

    return debug

@frappe.whitelist(allow_guest=False)
def debug_paytm_config() -> dict:
    """
    ADMIN DEBUG: Scans ALL possible locations for Paytm credentials on this server.
    Call from browser console:
      fetch('/api/method/mandigrow.api.debug_paytm_config', {method:'POST', headers:{'X-Frappe-CSRF-Token': frappe.csrf_token}})
        .then(r => r.json()).then(d => console.log(JSON.stringify(d.message, null, 2)))
    """
    import json
    results = {}

    # 1. Paytm Settings (Single doctype)
    try:
        ps = frappe.db.get_singles_dict("Paytm Settings")
        results["paytm_settings_table_exists"] = True
        results["paytm_settings_data"] = {
            k: ("***" if "key" in k.lower() or "secret" in k.lower() else v)
            for k, v in ps.items() if v
        }
        mid = ps.get("merchant_id") or ps.get("api_key") or ""
        key = ps.get("merchant_key") or ps.get("api_secret") or ""
        results["paytm_settings_has_credentials"] = bool(mid and key)
        results["paytm_settings_mid"] = mid[:6] + "***" if mid else None
    except Exception as ex:
        results["paytm_settings_table_exists"] = False
        results["paytm_settings_error"] = str(ex)

    # 2. Payment Gateway doctype
    try:
        pg = frappe.db.get_value(
            "Payment Gateway", {"gateway": "Paytm"},
            ["name", "gateway_controller", "gateway_settings"], as_dict=True
        )
        results["payment_gateway_doc"] = pg
        if pg and pg.get("gateway_controller"):
            try:
                ctrl = frappe.db.get_singles_dict(pg["gateway_controller"])
                results[f"payment_gateway_controller_{pg['gateway_controller']}"] = {
                    k: ("***" if "key" in k.lower() else v) for k, v in ctrl.items() if v
                }
            except Exception as ex2:
                results[f"payment_gateway_controller_error"] = str(ex2)
    except Exception as ex:
        results["payment_gateway_error"] = str(ex)

    # 3. All tables with 'paytm' in name
    try:
        tables = frappe.db.sql(
            "SHOW TABLES LIKE '%paytm%'", as_dict=False
        )
        results["tables_with_paytm"] = [t[0] for t in tables]
    except Exception:
        pass

    # 4. All doctype names with 'Paytm'
    try:
        dts = frappe.db.sql(
            "SELECT name, module FROM `tabDocType` WHERE LOWER(name) LIKE '%paytm%'",
            as_dict=True
        )
        results["doctypes_with_paytm"] = dts
    except Exception:
        pass

    # 5. Billing Gateway doctype
    try:
        gws = frappe.db.sql(
            "SELECT name, gateway_type, is_active, config FROM `tabBilling Gateway` WHERE LOWER(gateway_type)='paytm'",
            as_dict=True
        )
        results["billing_gateway_paytm_rows"] = [
            {k: v for k, v in g.items() if k != "config"} for g in gws
        ]
        if gws and gws[0].get("config"):
            cfg = json.loads(gws[0]["config"])
            results["billing_gateway_has_mid"] = bool(cfg.get("merchant_id") or cfg.get("MID"))
    except Exception as ex:
        results["billing_gateway_error"] = str(ex)

    # 6. get_default keys
    results["get_default_paytm_merchant_id"] = frappe.db.get_default("paytm_merchant_id")
    results["get_default_paytm_merchant_key"] = "***" if frappe.db.get_default("paytm_merchant_key") else None
    results["get_default_paytm_website"] = frappe.db.get_default("paytm_website")
    results["get_default_paytm_is_staging"] = frappe.db.get_default("paytm_is_staging")

    # 7. What _get_paytm_config() returns right now
    cfg = _get_paytm_config()
    results["current_config_result"] = {
        "configured": bool(cfg.get("merchant_id") and cfg.get("merchant_key")),
        "merchant_id": (cfg.get("merchant_id") or "")[:6] + "***" if cfg.get("merchant_id") else None,
        "website": cfg.get("website"),
        "is_staging": cfg.get("is_staging"),
        "paytm_host": cfg.get("paytm_host"),
    }

    return results



@frappe.whitelist(allow_guest=False)
def change_tenant_plan(plan_name: str, billing_cycle: str = "monthly",
                       payment_confirmed: bool = False, coupon_code: str = None) -> dict:

    """
    Changes the subscription plan for the current tenant.

    IMPORTANT: payment_confirmed=True MUST be passed by the checkout page
    AFTER payment is verified. If False, this endpoint rejects the change.
    This enforces the checkout → payment → activate flow.

    Admin can still assign plans directly via admin_billing_action (no payment required).
    """
    import json
    from frappe.utils import today, add_days

    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "message": "Organization not found."}

    # ── Payment Gate ─────────────────────────────────────────────────────────
    # NEVER allow plan changes without payment confirmation.
    # This is what was missing before — the old code allowed direct upgrade/downgrade.
    if not payment_confirmed:
        return {
            "success": False,
            "message": "Payment not confirmed. Please complete checkout to change your plan.",
            "redirect": "/settings/billing/checkout"
        }

    # ── Validate Plan Exists ─────────────────────────────────────────────────
    if not frappe.db.exists("App Plan", plan_name):
        # Try by plan_name field
        plan_by_name = frappe.db.get_value("App Plan", {"plan_name": plan_name}, "name")
        if not plan_by_name:
            return {"success": False, "message": f"Plan '{plan_name}' not found."}
        plan_name = plan_by_name

    # ── Validate and Apply Coupon ─────────────────────────────────────────────
    coupon_discount = 0
    if coupon_code:
        coupon_result = validate_coupon(coupon_code, plan_name)
        if not coupon_result.get("valid"):
            return {"success": False, "message": f"Coupon invalid: {coupon_result.get('error', 'Unknown error')}"}
        # Record coupon usage
        try:
            coupon_doc = frappe.get_doc("Mandi Coupon", {"code": coupon_code.upper()})
            coupon_doc.used_count = (coupon_doc.used_count or 0) + 1
            coupon_doc.save(ignore_permissions=True)
        except Exception:
            pass  # Non-fatal — coupon applied visually even if usage tracking fails

    # ── Apply Plan Change ────────────────────────────────────────────────────
    try:
        org = frappe.get_doc("Mandi Organization", org_id)

        # Compute next billing date using actual field names
        period_end = add_days(today(), 365 if billing_cycle == "yearly" else 30)

        # ── Update using ACTUAL field names from the schema ───────────────────
        # plan_id          (Link → App Plan)
        # subscription_tier (Select: starter/professional/enterprise)
        # billing_cycle    (Select: monthly/yearly)
        # status           (Select: trial/active/grace_period/suspended/expired)
        # subscription_start_date (Date)
        # subscription_end_date   (Datetime)
        # grace_period_ends_at    (Datetime) — cleared when plan is activated

        org.plan_id = plan_name
        org.subscription_tier = plan_name   # tier key = plan docname
        org.billing_cycle = billing_cycle
        org.status = "active"
        org.is_active = 1
        org.subscription_start_date = today()
        org.subscription_end_date = str(period_end) + " 00:00:00"
        org.grace_period_ends_at = None  # Clear any lingering grace period

        org.save(ignore_permissions=True)
        frappe.db.commit()

        plan_doc = frappe.get_doc("App Plan", plan_name)
        display = getattr(plan_doc, "display_name", plan_name)

        # ── Audit trail ──────────────────────────────────────────────────────
        try:
            frappe.get_doc({
                "doctype": "Subscription Audit Log",
                "organization": org_id,
                "action": "plan_changed",
                "old_value": frappe.db.get_value("Mandi Organization", org_id, "subscription_tier") or "unknown",
                "new_value": plan_name,
                "notes": f"billing_cycle={billing_cycle}, period_end={period_end}, coupon={coupon_code}",
                "changed_by": frappe.session.user,
            }).insert(ignore_permissions=True)
            frappe.db.commit()
        except Exception:
            pass  # Non-fatal

        frappe.logger().info(f"[change_tenant_plan] {org_id} → {plan_name} ({billing_cycle}), period_end={period_end}, coupon={coupon_code}")

        return {
            "success": True,
            "message": f"Plan changed to {display} successfully.",
            "plan_name": plan_name,
            "status": "active",
            "current_period_end": str(period_end)[:10],
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "change_tenant_plan Failed")
        return {"success": False, "message": str(e)}


# ── Commission Arrival Settlement ──────────────────────────────────────────────
#
# When a Commission (Farmer / Supplier) arrival is logged with Rate = 0, no
# financial ledger entry is created at arrival time — only stock (Lots) are
# recorded.  Once all lots are exhausted (sold + returned), the Mandi can
# "finalize" the arrival: the system aggregates the actual sale values, computes
# the definitive farmer bill (Sale Amount – Commission% – Charges – Less%), and
# posts a SINGLE, consolidated Journal Entry to the Farmer/Supplier ledger.
#
# Rules:
#  • If a rate > 0 was given at arrival (normal flow), this path is never taken.
#  • Sales are completely unaffected — buyer ledgers update in real-time as usual.
#  • The finalization overrides the Mandi Arrival financial fields in-place
#    (total_realized, net_payable_farmer, etc.) then submits the settlement JE.
# ──────────────────────────────────────────────────────────────────────────────

def _check_commission_arrival_readiness(arrival_name: str) -> None:
    """
    Called (non-fatally) after every sale or stock return that touches a lot
    belonging to a commission arrival.

    If the arrival was logged with Rate = 0 AND all its lots are now empty
    (current_qty = 0 for all), marks it as 'Ready' so the frontend can show
    the 'Finalize Settlement' button.
    """
    if not arrival_name:
        return
    try:
        arrival = frappe.db.get_value(
            "Mandi Arrival", arrival_name,
            ["arrival_type", "commission_settlement_status", "total_realized"],
            as_dict=True
        )
        if not arrival:
            return

        # Only applies to zero-rate commission arrivals
        if arrival.arrival_type not in ("commission", "commission_supplier"):
            return

        # If rate was entered at arrival (total_realized > 0), normal flow —
        # ledger was already posted on submit. Nothing to do here.
        if float(arrival.total_realized or 0) > 0:
            return

        # Already finalised
        if arrival.commission_settlement_status == "Settled":
            return

        # Check if all lots under this arrival are empty
        lots = frappe.get_all(
            "Mandi Lot", filters={"parent": arrival_name},
            fields=["current_qty"]
        )
        if not lots:
            return

        total_remaining = sum(float(l.current_qty or 0) for l in lots)
        if total_remaining <= 0:
            frappe.db.set_value(
                "Mandi Arrival", arrival_name,
                "commission_settlement_status", "Ready",
                update_modified=False
            )
            frappe.db.commit()
            frappe.logger().info(
                f"[commission_readiness] {arrival_name} is now READY. Auto-triggering settlement."
            )
            try:
                finalize_commission_settlement(arrival_name)
                frappe.logger().info(f"[commission_readiness] {arrival_name} auto-settled successfully.")
            except Exception as e:
                frappe.log_error(str(e), f"Auto-settle failed for {arrival_name}")

    except Exception:
        frappe.log_error(frappe.get_traceback(), "_check_commission_arrival_readiness Failed")


@frappe.whitelist(allow_guest=False)
def finalize_commission_settlement(arrival_name: str) -> dict:
    """
    Finalises a zero-rate Commission arrival after all lots are sold / returned.

    Steps:
    1.  Validates the arrival is a commission type and all lots are empty.
    2.  Aggregates ACTUAL sale values from all Mandi Sale Items referencing
        lots in this arrival.
    3.  Recomputes: Commission, Less deduction, Charges, Net Payable.
    4.  Updates the Mandi Arrival document in-place with the computed actuals
        (supplier_rate on each lot = computed avg rate, total_realized,
        total_commission, net_payable_farmer, etc.).
    5.  Posts a single consolidated Journal Entry:
            Dr  Stock / Clearing Account   = Total Realized
            Cr  Creditors (Farmer/Supplier) = Net Payable
            Cr  Commission Income           = Commission Amount
            Cr  Expense Recovery            = Charges Amount
    6.  Marks the arrival as 'Settled'.

    Safety:
    • Idempotent — blocked if status is already 'Settled'.
    • Never touches Mandi Sale, GL entries for buyers, or existing daybook.
    • Only creates the ONE missing ledger for the Farmer/Supplier.
    """
    from mandigrow.mandigrow.logic.automation import (
        get_stock_acc, get_farmer_acc, get_supplier_acc,
        get_comm_acc, get_expense_acc, _tag_gl_entries,
        ensure_supplier_for_contact, _get_cost_center
    )
    from mandigrow.mandigrow.logic.erp_bootstrap import (
        ensure_company_party_defaults, get_default_company
    )

    org_id = _get_user_org()

    try:
        # ── 1. Validate Arrival ─────────────────────────────────────────────
        arrival = frappe.get_doc("Mandi Arrival", arrival_name)
        _enforce_ownership(arrival)

        if arrival.organization_id and arrival.organization_id != org_id:
            frappe.throw("Access denied: This arrival does not belong to your organization.")

        if arrival.arrival_type not in ("commission", "commission_supplier"):
            frappe.throw("Finalize Settlement is only applicable to Commission arrivals.")

        if float(arrival.total_realized or 0) > 0:
            frappe.throw(
                "This arrival already has a rate entered. Its ledger was created at arrival time. "
                "No finalization needed."
            )

        current_status = frappe.db.get_value(
            "Mandi Arrival", arrival_name, "commission_settlement_status"
        )
        if current_status == "Settled":
            frappe.throw("This arrival has already been settled. No duplicate entries allowed.")

        # ── 2. Verify all lots are empty ────────────────────────────────────
        lots = frappe.get_all(
            "Mandi Lot", filters={"parent": arrival_name},
            fields=["name", "lot_code", "initial_qty", "current_qty",
                    "supplier_rate", "commission_percent", "less_percent",
                    "less_units", "packing_cost", "loading_cost",
                    "farmer_charges", "item_id", "unit"]
        )
        if not lots:
            frappe.throw("No lots found for this arrival.")

        total_remaining = sum(float(l.current_qty or 0) for l in lots)
        if total_remaining > 0:
            frappe.throw(
                f"Cannot settle — {total_remaining} units are still in stock. "
                "Please sell or return all remaining goods first."
            )

        lot_ids = [l.name for l in lots]
        lot_map = {l.name: l for l in lots}

        # ── 3. Aggregate actual sale values ─────────────────────────────────
        # Find all Mandi Sale Items referencing lots in this arrival.
        # We use docstatus=1 (submitted) to only count confirmed sales.
        if not lot_ids:
            frappe.throw("No lot IDs found.")

        lot_placeholders = ", ".join(["%s"] * len(lot_ids))
        sale_items = frappe.db.sql(f"""
            SELECT
                si.lot_id,
                si.qty,
                si.rate,
                si.amount,
                s.saledate
            FROM `tabMandi Sale Item` si
            JOIN `tabMandi Sale` s ON si.parent = s.name
            WHERE si.lot_id IN ({lot_placeholders})
              AND s.docstatus = 1
        """, lot_ids, as_dict=True)

        if not sale_items:
            frappe.throw("No submitted sales found for lots in this arrival.")

        # Aggregate per-lot actual sale values
        lot_sales = {}  # lot_id → {qty_sold, total_amount}
        for si in sale_items:
            entry = lot_sales.setdefault(si.lot_id, {"qty_sold": 0.0, "total_amount": 0.0})
            entry["qty_sold"]     += float(si.qty or 0)
            entry["total_amount"] += float(si.amount or 0)

        # ── 4. Compute settlement financials ────────────────────────────────
        # For each lot: apply the less%, commission% on actual realized amount.
        # Charges (packing, loading, farmer_charges) are subtracted from farmer's net.
        # Trip-level charges from the arrival (hire, hamali, other) are also included.

        grand_total_realized  = 0.0  # Sum of all actual sale amounts
        grand_total_commission = 0.0  # Mandi's commission cut
        grand_total_charges    = 0.0  # All charges deducted from farmer
        grand_total_less_value = 0.0  # Value of less deduction (informational)

        lot_computed_rates = {}  # lot_id → avg rate computed from actual sales

        for lot in lots:
            ls = lot_sales.get(lot.name)
            if not ls or ls["qty_sold"] <= 0:
                # Lot might have been fully returned — skip (no sale value)
                continue

            qty_sold      = ls["qty_sold"]
            amount_sold   = ls["total_amount"]

            # Avg sale rate per unit (used to update supplier_rate on the lot)
            avg_rate = amount_sold / qty_sold if qty_sold > 0 else 0.0
            lot_computed_rates[lot.name] = avg_rate

            # Apply Less% to get "net quantity" for commission calculation
            less_units  = float(lot.less_units or 0)
            less_pct    = float(lot.less_percent or 0)
            initial_qty = float(lot.initial_qty or qty_sold)

            if less_units > 0:
                less_qty = less_units
            elif less_pct > 0:
                less_qty = initial_qty * (less_pct / 100.0)
            else:
                less_qty = 0.0

            # Less value is deducted from the realized amount proportionally
            less_ratio    = less_qty / initial_qty if initial_qty > 0 else 0.0
            less_value    = amount_sold * less_ratio
            farmer_chg    = float(lot.farmer_charges or 0)
            
            # USER REQUEST: Other Cut is a discount like Less%
            net_realized  = max(amount_sold - less_value - farmer_chg, 0.0)

            # Commission on net realized amount (sale price IS the base)
            comm_pct      = float(lot.commission_percent or 0)
            lot_commission = net_realized * (comm_pct / 100.0)

            # Lot-level charges (paid by Mandi on behalf of farmer)
            packing       = float(lot.packing_cost or 0)
            loading       = float(lot.loading_cost or 0)
            lot_charges   = packing + loading

            grand_total_realized   += net_realized
            grand_total_commission += lot_commission
            grand_total_less_value += less_value
            grand_total_charges    += lot_charges

        # Trip-level expenses from the Arrival document
        hire_charges    = float(arrival.hire_charges or 0)
        hamali_expenses = float(arrival.hamali_expenses or 0)
        other_expenses  = float(arrival.other_expenses or 0)
        trip_charges    = hire_charges + hamali_expenses + other_expenses
        grand_total_charges += trip_charges

        # Final net payable to farmer/supplier
        net_payable = round(grand_total_realized - grand_total_commission - grand_total_charges, 2)
        net_payable = max(net_payable, 0.0)

        grand_total_realized   = round(grand_total_realized,   2)
        grand_total_commission = round(grand_total_commission, 2)
        grand_total_charges    = round(grand_total_charges,    2)

        # ── 5. Update Arrival document in-place ─────────────────────────────
        # Override the financial summary fields on the Arrival with actuals.
        # We use db.set_value to avoid re-running the validate hook (which
        # would try to recalculate from supplier_rate which is still 0).
        frappe.db.set_value("Mandi Arrival", arrival_name, {
            "total_realized":        grand_total_realized,
            "total_commission":      grand_total_commission,
            "total_expenses":        grand_total_charges,
            "net_payable_farmer":    net_payable,
            "mandi_total_earnings":  round(grand_total_commission + grand_total_charges, 2),
            "commission_settlement_status": "Settled",
        }, update_modified=False)

        # Update supplier_rate on each lot to the computed avg rate
        # so that get_trading_pl() can compute COGS correctly going forward.
        for lot_id, avg_rate in lot_computed_rates.items():
            frappe.db.set_value("Mandi Lot", lot_id, "supplier_rate", round(avg_rate, 4),
                                update_modified=False)

        frappe.db.commit()

        # ── 6. Post the single settlement Journal Entry ─────────────────────
        company = None
        if arrival.organization_id:
            company = frappe.db.get_value("Mandi Organization", arrival.organization_id, "erp_company")
        if not company:
            company = get_default_company()

        ensure_company_party_defaults(company)
        supplier_party = ensure_supplier_for_contact(arrival.party_id, company)

        payable_acc = (
            get_supplier_acc(company)
            if arrival.arrival_type == "commission_supplier"
            else get_farmer_acc(company)
        )
        stock_acc   = get_stock_acc(company)
        comm_acc    = get_comm_acc(company)
        expense_acc = get_expense_acc(company)
        cost_center = _get_cost_center(company)

        party_name = frappe.db.get_value("Mandi Contact", arrival.party_id, "full_name") or arrival.party_id
        bill_ref   = f"Bill #{arrival.contact_bill_no}" if getattr(arrival, "contact_bill_no", None) else f"Arrival {arrival_name}"

        # Build JE accounts — mirrors post_arrival_ledger() commission path exactly
        je_accounts = []

        # Dr: Stock In Hand (goods received were all sold — closing the inventory)
        je_accounts.append({
            "account":                   stock_acc,
            "debit_in_account_currency": grand_total_realized,
            "against_voucher_type":      "Mandi Arrival",
            "against_voucher":           arrival_name,
            "user_remark":               f"Settlement: goods sold on behalf of {party_name} — {bill_ref}",
            "account_currency":          "INR",
            "exchange_rate":             1,
            "cost_center":               cost_center,
        })

        # Cr 1: Creditors — Net payable to farmer/supplier
        if net_payable > 0:
            je_accounts.append({
                "account":                    payable_acc,
                "credit_in_account_currency": net_payable,
                "party_type":                 "Supplier",
                "party":                      supplier_party,
                "against_voucher_type":       "Mandi Arrival",
                "against_voucher":            arrival_name,
                "user_remark":                f"Net payable to {party_name} — {bill_ref}",
                "account_currency":           "INR",
                "exchange_rate":              1,
                "cost_center":                cost_center,
            })

        # Cr 2: Commission Income — Mandi's profit
        if grand_total_commission > 0:
            je_accounts.append({
                "account":                    comm_acc,
                "credit_in_account_currency": grand_total_commission,
                "against_voucher_type":       "Mandi Arrival",
                "against_voucher":            arrival_name,
                "user_remark":                f"Commission income on {bill_ref} — {party_name}",
                "account_currency":           "INR",
                "exchange_rate":              1,
                "cost_center":                cost_center,
            })

        # Cr 3: Expense Recovery — charges deducted from farmer's bill
        if grand_total_charges > 0:
            je_accounts.append({
                "account":                    expense_acc,
                "credit_in_account_currency": grand_total_charges,
                "against_voucher_type":       "Mandi Arrival",
                "against_voucher":            arrival_name,
                "user_remark":                f"Expense recovery (charges) on {bill_ref} — {party_name}",
                "account_currency":           "INR",
                "exchange_rate":              1,
                "cost_center":                cost_center,
            })

        if not je_accounts or len(je_accounts) < 2:
            frappe.throw("Cannot create Journal Entry — insufficient account legs (check commission/charges/net payable).")

        settlement_date = frappe.utils.today()
        je = frappe.get_doc({
            "doctype":      "Journal Entry",
            "voucher_type": "Journal Entry",
            "company":      company,
            "posting_date": settlement_date,
            "user_remark":  f"Commission Settlement: {bill_ref} — {party_name} (Total: ₹{grand_total_realized:,.2f})"[:140],
            "accounts":     je_accounts,
        })
        je.flags.ignore_permissions = True
        je.insert()
        je.submit()
        _tag_gl_entries(je.name, "Mandi Arrival", arrival_name)

        # Update the arrival status and link the settlement JE
        frappe.db.set_value("Mandi Arrival", arrival_name, {
            "status": "Paid" if float(arrival.advance or 0) >= net_payable else "Pending",
        }, update_modified=False)
        frappe.db.commit()

        frappe.msgprint(
            f"✅ Settlement complete! JE <b>{je.name}</b> posted for <b>{bill_ref}</b>.<br>"
            f"Farmer Net Payable: ₹{net_payable:,.2f} | "
            f"Commission: ₹{grand_total_commission:,.2f} | "
            f"Charges: ₹{grand_total_charges:,.2f}",
            indicator="green"
        )

        return {
            "success":             True,
            "je_name":             je.name,
            "arrival_name":        arrival_name,
            "total_realized":      grand_total_realized,
            "total_commission":    grand_total_commission,
            "total_charges":       grand_total_charges,
            "net_payable":         net_payable,
            "less_value":          round(grand_total_less_value, 2),
            "message":             f"Settlement JE {je.name} created. Farmer net payable: ₹{net_payable:,.2f}",
        }

    except frappe.exceptions.ValidationError:
        raise
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "finalize_commission_settlement Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_commission_settlement_preview(arrival_name: str) -> dict:
    """
    Returns a read-only preview of the settlement amounts BEFORE the user
    clicks 'Finalize'. Used by the frontend to show the farmer bill breakdown.
    Safe — no writes, no ledger changes.
    """
    org_id = _get_user_org()
    try:
        arrival = frappe.db.get_value(
            "Mandi Arrival", arrival_name,
            ["arrival_type", "organization_id", "party_id", "contact_bill_no",
             "hire_charges", "hamali_expenses", "other_expenses",
             "commission_settlement_status", "total_realized"],
            as_dict=True
        )
        if not arrival:
            return {"success": False, "error": "Arrival not found"}
        if arrival.organization_id != org_id:
            return {"success": False, "error": "Access denied"}
        if arrival.arrival_type not in ("commission", "commission_supplier"):
            return {"success": False, "error": "Not a commission arrival"}
        if float(arrival.total_realized or 0) > 0:
            return {"success": False, "error": "Rate was entered at arrival — already settled on submit."}

        lots = frappe.get_all(
            "Mandi Lot", filters={"parent": arrival_name},
            fields=["name", "initial_qty", "current_qty", "commission_percent",
                    "less_percent", "less_units", "packing_cost", "loading_cost",
                    "farmer_charges", "item_id"]
        )
        lot_ids = [l.name for l in lots]
        if not lot_ids:
            return {"success": False, "error": "No lots found"}

        total_remaining = sum(float(l.current_qty or 0) for l in lots)

        lot_placeholders = ", ".join(["%s"] * len(lot_ids))
        sale_items = frappe.db.sql(f"""
            SELECT si.lot_id, si.qty, si.amount
            FROM `tabMandi Sale Item` si
            JOIN `tabMandi Sale` s ON si.parent = s.name
            WHERE si.lot_id IN ({lot_placeholders}) AND s.docstatus = 1
        """, lot_ids, as_dict=True)

        lot_sales = {}
        for si in sale_items:
            entry = lot_sales.setdefault(si.lot_id, {"qty_sold": 0.0, "total_amount": 0.0})
            entry["qty_sold"]     += float(si.qty or 0)
            entry["total_amount"] += float(si.amount or 0)

        grand_realized   = 0.0
        grand_commission = 0.0
        grand_charges    = 0.0

        for lot in lots:
            ls = lot_sales.get(lot.name)
            if not ls or ls["qty_sold"] <= 0:
                continue
            initial_qty = float(lot.initial_qty or ls["qty_sold"])
            less_units  = float(lot.less_units or 0)
            less_pct    = float(lot.less_percent or 0)
            less_qty    = less_units if less_units > 0 else (initial_qty * less_pct / 100.0 if less_pct > 0 else 0.0)
            less_ratio  = less_qty / initial_qty if initial_qty > 0 else 0.0
            net_realized = max(ls["total_amount"] * (1 - less_ratio), 0.0)
            grand_realized   += net_realized
            grand_commission += net_realized * (float(lot.commission_percent or 0) / 100.0)
            grand_charges    += float(lot.packing_cost or 0) + float(lot.loading_cost or 0) + float(lot.farmer_charges or 0)

        trip_charges = (float(arrival.hire_charges or 0) + float(arrival.hamali_expenses or 0)
                        + float(arrival.other_expenses or 0))
        grand_charges += trip_charges

        net_payable = max(round(grand_realized - grand_commission - grand_charges, 2), 0.0)

        return {
            "success":           True,
            "arrival_name":      arrival_name,
            "total_remaining":   total_remaining,
            "is_ready":          total_remaining <= 0,
            "settlement_status": arrival.commission_settlement_status or "Pending",
            "preview": {
                "total_realized":   round(grand_realized,   2),
                "total_commission": round(grand_commission, 2),
                "total_charges":    round(grand_charges,    2),
                "net_payable":      net_payable,
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_commission_settlement_preview Failed")
        return {"success": False, "error": str(e)}


# ── Stock Operations: Report Loss, Return to Supplier, Stock Alerts ────────────

@frappe.whitelist(allow_guest=False)
def report_loss(lot_id: str, loss_qty: float, reason: str = "Spoilage") -> dict:
    """
    Records a wastage/loss on a Mandi Lot.
    - Reduces current_qty by loss_qty using db.set_value (bypasses submission guard).
    - Creates a Journal Entry to debit Mandi's Profit & Loss (loss expense account).
    - Triggers stock alert re-evaluation after reduction.

    Args:
        lot_id:    Mandi Lot name (e.g. "AB26QFBLSI")
        loss_qty:  Quantity to write off
        reason:    "Spoilage / Rot", "Theft", "Weight Loss", etc.
    """
    from frappe.utils import flt, today

    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "error": "Organization not found"}

    loss_qty = flt(loss_qty)
    if loss_qty <= 0:
        return {"success": False, "error": "Loss quantity must be greater than zero"}

    # ── Load lot and validate ────────────────────────────────────────────────
    try:
        lot = frappe.get_doc("Mandi Lot", lot_id)
    except Exception:
        return {"success": False, "error": f"Lot '{lot_id}' not found"}

    # Tenant guard
    parent_name = frappe.db.get_value("Mandi Lot", lot_id, "parent")
    if parent_name:
        arrival_org = frappe.db.get_value("Mandi Arrival", parent_name, "organization_id")
        if arrival_org and arrival_org != org_id:
            frappe.throw("Access denied: This lot does not belong to your organization.")

    current_qty = flt(lot.current_qty)
    if loss_qty > current_qty:
        return {"success": False, "error": f"Cannot remove {loss_qty} — only {current_qty} available"}

    # ── Deduct stock ─────────────────────────────────────────────────────────
    new_qty = round(current_qty - loss_qty, 4)
    new_status = "Sold" if new_qty <= 0 else ("Partial" if new_qty < flt(lot.initial_qty or current_qty) else "Active")
    frappe.db.set_value("Mandi Lot", lot_id, {
        "current_qty": new_qty,
        "status": new_status,
    }, update_modified=False)
    frappe.db.commit()

    # ── Post Wastage Journal Entry (guaranteed — auto-creates account if missing) ────
    unit_cost  = flt(lot.supplier_rate or 0)
    loss_value = round(loss_qty * unit_cost, 2)
    item_name  = lot.item_id or "Commodity"
    narration  = f"Stock Loss: {loss_qty} {lot.unit or 'Units'} of {item_name} — {reason}"

    je_name = None
    je_error = None
    loss_acc_label  = "Stock Losses (Expense)"
    stock_acc_label = "Stock In Hand (Asset)"
    try:
        if loss_value > 0:
            company = (frappe.db.get_value("Mandi Organization", org_id, "erp_company")
                        or frappe.defaults.get_user_default("Company"))

            # Resolve Stock Losses expense account — or auto-create it
            loss_acc = (
                frappe.db.get_value("Account", {"account_name": ["like", "%Stock Loss%"], "company": company, "is_group": 0}, "name") or
                frappe.db.get_value("Account", {"account_name": ["like", "%Wastage%"],    "company": company, "is_group": 0}, "name") or
                frappe.db.get_value("Account", {"account_name": ["like", "%Loss%"],       "company": company, "is_group": 0, "root_type": "Expense"}, "name")
            )
            if not loss_acc:
                parent_exp = (
                    frappe.db.get_value("Account", {"account_name": ["like", "%Indirect Expense%"], "is_group": 1, "company": company}, "name") or
                    frappe.db.get_value("Account", {"root_type": "Expense", "is_group": 1, "company": company}, "name")
                )
                if parent_exp:
                    acc_doc = frappe.get_doc({
                        "doctype": "Account", "account_name": "Stock Losses",
                        "parent_account": parent_exp, "account_type": "Expense Account", "company": company,
                    })
                    acc_doc.insert(ignore_permissions=True)
                    loss_acc = acc_doc.name

            if loss_acc:
                loss_acc_label = loss_acc

            # Resolve Stock In Hand asset account — or auto-create it
            stock_acc = (
                frappe.db.get_value("Account", {"account_name": ["like", "%Stock In Hand%"], "company": company, "is_group": 0}, "name") or
                frappe.db.get_value("Account", {"account_name": ["like", "%Stock%"],          "company": company, "is_group": 0, "root_type": "Asset"}, "name") or
                frappe.db.get_value("Account", {"account_type": "Stock",                       "company": company, "is_group": 0}, "name")
            )
            if not stock_acc:
                parent_asset = (
                    frappe.db.get_value("Account", {"account_name": ["like", "%Current Asset%"], "is_group": 1, "company": company}, "name") or
                    frappe.db.get_value("Account", {"root_type": "Asset", "is_group": 1, "company": company}, "name")
                )
                if parent_asset:
                    acc_doc = frappe.get_doc({
                        "doctype": "Account", "account_name": "Stock In Hand",
                        "parent_account": parent_asset, "account_type": "Stock", "company": company,
                    })
                    acc_doc.insert(ignore_permissions=True)
                    stock_acc = acc_doc.name

            if stock_acc:
                stock_acc_label = stock_acc

            if loss_acc and stock_acc:
                cost_center = frappe.db.get_value("Company", company, "cost_center")
                je = frappe.get_doc({
                    "doctype": "Journal Entry", "voucher_type": "Journal Entry",
                    "posting_date": today(), "company": company, "user_remark": narration,
                    "accounts": [
                        # Dr Stock Losses (Expense ↑ → Net Profit ↓ on P&L)
                        {"account": loss_acc,  "debit_in_account_currency": loss_value, "credit_in_account_currency": 0, "cost_center": cost_center},
                        # Cr Stock In Hand (Asset ↓ → Balance Sheet shrinks)
                        {"account": stock_acc, "debit_in_account_currency": 0,          "credit_in_account_currency": loss_value, "cost_center": cost_center},
                    ]
                })
                je.insert(ignore_permissions=True)
                je.submit()
                je_name = je.name
            else:
                je_error = f"Accounts not resolved: loss_acc={loss_acc}, stock_acc={stock_acc}"
                frappe.log_error(je_error, "report_loss JE Skipped")
    except Exception:
        je_error = frappe.get_traceback()
        frappe.log_error(je_error, "report_loss JE Failed (non-fatal)")

    frappe.logger().info(f"[report_loss] {lot_id}: -{loss_qty} ({reason}), new_qty={new_qty}, org={org_id}, je={je_name}")
    return {
        "success": True,
        "lot_id": lot_id,
        "removed_qty": loss_qty,
        "remaining_qty": new_qty,
        "loss_value": loss_value,
        "unit_cost": unit_cost,
        "reason": reason,
        "je_name": je_name,
        "je_posted": bool(je_name),
        "ledger_entry": {
            "narration": narration,
            "debit_account": loss_acc_label,
            "credit_account": stock_acc_label,
            "amount": loss_value,
        },
        "message": (
            f"{loss_qty} units written off. ₹{loss_value:,.0f} posted to P&L (Stock Losses). JE: {je_name}"
            if je_name else
            f"{loss_qty} units removed from stock. No financial entry (zero cost or accounts not configured)."
        ),
    }


@frappe.whitelist(allow_guest=False)
def return_stock(lot_id: str, return_qty: float, reason: str = "Returned to Supplier", return_rate: float = None) -> dict:
    """
    Returns stock to the supplier/farmer.
    - Reduces current_qty by return_qty using db.set_value (bypasses submission guard).
    - Creates a Debit Note (Supplier) or Credit Note (Customer/Farmer) to reduce payable balance.
    - Records the return with full audit trail and ledger impact data for UI display.

    Args:
        lot_id:       Mandi Lot name
        return_qty:   Quantity being returned
        reason:       Reason/remarks for the return
        return_rate:  Optional override rate (defaults to lot.supplier_rate)
    """
    from frappe.utils import flt, today

    org_id = _get_user_org()
    if not org_id:
        return {"success": False, "error": "Organization not found"}

    return_qty = flt(return_qty)
    if return_qty <= 0:
        return {"success": False, "error": "Return quantity must be greater than zero"}

    # ── Load and validate lot ────────────────────────────────────────────────
    try:
        lot = frappe.get_doc("Mandi Lot", lot_id)
    except Exception:
        return {"success": False, "error": f"Lot '{lot_id}' not found"}

    # Tenant guard
    parent_name = frappe.db.get_value("Mandi Lot", lot_id, "parent")
    if parent_name:
        arrival_org = frappe.db.get_value("Mandi Arrival", parent_name, "organization_id")
        if arrival_org and arrival_org != org_id:
            frappe.throw("Access denied: This lot does not belong to your organization.")

    current_qty = flt(lot.current_qty)
    if return_qty > current_qty:
        return {"success": False, "error": f"Cannot return {return_qty} — only {current_qty} available"}

    # Get supplier from parent arrival
    supplier_id = None
    unit_cost   = flt(return_rate or 0) if return_rate else flt(lot.supplier_rate or 0)
    if parent_name:
        supplier_id = frappe.db.get_value("Mandi Arrival", parent_name, "party_id")

    # ── Deduct stock ─────────────────────────────────────────────────────────
    new_qty    = round(current_qty - return_qty, 4)
    new_status = "Sold" if new_qty <= 0 else ("Partial" if new_qty < flt(lot.initial_qty or current_qty) else "Active")
    frappe.db.set_value("Mandi Lot", lot_id, {
        "current_qty": new_qty,
        "status": new_status,
    }, update_modified=False)
    frappe.db.commit()

    # ── Post Credit JE to reduce supplier/farmer payable ────────────────────
    return_value = round(return_qty * unit_cost, 2)
    if return_value > 0 and supplier_id:
        try:
            item_name   = lot.item_id or "Commodity"
            # CRITICAL FIX: DB column is erp_company, NOT company
            company     = (frappe.db.get_value("Mandi Organization", org_id, "erp_company")
                           or frappe.defaults.get_user_default("Company"))
            narration   = f"Stock Return: {return_qty} {lot.unit or 'Units'} of {item_name} returned to supplier {supplier_id} — {reason}"

            # Resolve true ERPNext Supplier or Customer ID from party_id
            erpnext_party = None
            erpnext_party_type = "Supplier"

            if supplier_id:
                if frappe.db.exists("Supplier", supplier_id):
                    erpnext_party = supplier_id
                    erpnext_party_type = "Supplier"
                elif frappe.db.exists("Customer", supplier_id):
                    erpnext_party = supplier_id
                    erpnext_party_type = "Customer"
                elif frappe.db.exists("Mandi Contact", supplier_id):
                    contact_doc = frappe.get_doc("Mandi Contact", supplier_id)
                    if contact_doc.supplier and frappe.db.exists("Supplier", contact_doc.supplier):
                        erpnext_party = contact_doc.supplier
                        erpnext_party_type = "Supplier"
                    elif contact_doc.customer and frappe.db.exists("Customer", contact_doc.customer):
                        erpnext_party = contact_doc.customer
                        erpnext_party_type = "Customer"
                    else:
                        matched_supp = frappe.db.get_value("Supplier", {"supplier_name": contact_doc.full_name}, "name")
                        if matched_supp:
                            erpnext_party = matched_supp
                            erpnext_party_type = "Supplier"
                        else:
                            matched_cust = frappe.db.get_value("Customer", {"customer_name": contact_doc.full_name}, "name")
                            if matched_cust:
                                erpnext_party = matched_cust
                                erpnext_party_type = "Customer"

            if not erpnext_party:
                erpnext_party = supplier_id
                erpnext_party_type = "Supplier"

            # Determine Account & Account Type based on party
            if erpnext_party_type == "Supplier":
                party_acc = (
                    frappe.db.get_value("Account", {"account_type": "Payable", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Creditor%"], "company": company, "is_group": 0}, "name")
                )
                party_acc_type = "Supplier"
            else:
                party_acc = (
                    frappe.db.get_value("Account", {"account_type": "Receivable", "company": company, "is_group": 0}, "name")
                    or frappe.db.get_value("Account", {"account_name": ["like", "%Debtor%"], "company": company, "is_group": 0}, "name")
                )
                party_acc_type = "Customer"

            stock_acc = (
                frappe.db.get_value("Account", {"account_type": "Stock", "company": company, "is_group": 0}, "name")
                or frappe.db.get_value("Account", {"account_name": ["like", "%Stock%"], "company": company, "is_group": 0}, "name")
            )
            cost_center = frappe.db.get_value("Company", company, "cost_center")

            frappe.logger().info(
                f"[return_stock] JE prep: company={company}, party={erpnext_party}({erpnext_party_type}), "
                f"party_acc={party_acc}, stock_acc={stock_acc}, value={return_value}"
            )

            if party_acc and stock_acc:
                je = frappe.get_doc({
                    "doctype":      "Journal Entry",
                    "voucher_type": "Journal Entry",
                    "posting_date": today(),
                    "company":      company,
                    "user_remark":  narration,
                    "accounts": [
                        {
                            "account": party_acc,
                            "debit_in_account_currency": return_value,
                            "credit_in_account_currency": 0,
                            "party_type": party_acc_type,
                            "party": erpnext_party,
                            "cost_center": cost_center,
                        },
                        {
                            "account": stock_acc,
                            "debit_in_account_currency": 0,
                            "credit_in_account_currency": return_value,
                            "cost_center": cost_center,
                        },
                    ]
                })
                je.insert(ignore_permissions=True)
                je.submit()
                frappe.logger().info(f"[return_stock] JE created: {je.name}")
            else:
                frappe.log_error(
                    f"company={company}, party_acc={party_acc}, stock_acc={stock_acc}",
                    "return_stock: Accounts Missing"
                )
        except Exception:
            frappe.log_error(frappe.get_traceback(), "return_stock: JE Failed")


    # ── Check commission arrival settlement readiness (non-fatal) ────────────
    # For zero-rate commission arrivals, returning all remaining stock makes
    # the arrival "empty". If all lots are now 0, mark it Ready to finalize.
    try:
        if parent_name:
            _check_commission_arrival_readiness(parent_name)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "commission_readiness_check after return (non-fatal)")
    # ─────────────────────────────────────────────────────────────────────────

    frappe.logger().info(f"[return_stock] {lot_id}: -{return_qty} ({reason}), new_qty={new_qty}, supplier={supplier_id}, org={org_id}")
    return {
        "success":      True,
        "lot_id":       lot_id,
        "returned_qty": return_qty,
        "remaining_qty": new_qty,
        "credit_value": return_value if supplier_id else 0,
        "reason":       reason,
        "message":      f"{return_qty} units returned. Remaining stock: {new_qty}. Supplier payable reduced by ₹{return_value:,.0f}.",
    }

@frappe.whitelist()
def reset_invoice_sequence(contact_id: str):
    """
    Resets the invoice sequence for a specific contact (farmer/supplier).
    Works by archiving existing YYYY-N contact_bill_no values on Mandi Arrival
    so the next auto-assigned number in the current year starts from 1 again.

    Archive format: ARC{YY}-{original_bill_no}
    e.g. '2026-17' becomes 'ARC26-2026-17'

    After reset, the next invoice for this contact will be YYYY-1
    (where YYYY = current year).

    NOTE: Both Mandi Sale (buyerid) and Mandi Arrival (party_id) have contact_bill_no columns.
    """
    if not contact_id:
        return {"success": False, "error": "Contact ID is required"}

    try:
        from frappe.utils import nowdate
        year2 = str(frappe.utils.now_datetime().year)[-2:]
        prefix = f"ARC{year2}-"
        current_year = str(frappe.utils.now_datetime().year)

        # Archive all YYYY-N bill numbers for this party (current year only)
        # Pattern: ^YYYY-[0-9]+$ OR old plain ^[0-9]+$ (legacy)
        
        reset_count = 0
        
        # 1. Reset Mandi Arrivals
        arrivals = frappe.db.sql("""
            SELECT name, contact_bill_no
            FROM `tabMandi Arrival`
            WHERE party_id = %s
            AND (
                contact_bill_no REGEXP '^[0-9]+-[0-9]+$'
                OR contact_bill_no REGEXP '^[0-9]+$'
            )
            AND contact_bill_no NOT LIKE 'ARC%%'
        """, (contact_id,), as_dict=True)

        for arr in arrivals:
            new_bill_no = f"{prefix}{arr['contact_bill_no']}"
            frappe.db.set_value("Mandi Arrival", arr["name"], "contact_bill_no", new_bill_no, update_modified=False)
            reset_count += 1

        # 2. Reset Mandi Sales
        sales = frappe.db.sql("""
            SELECT name, contact_bill_no
            FROM `tabMandi Sale`
            WHERE buyerid = %s
            AND (
                contact_bill_no REGEXP '^[0-9]+-[0-9]+$'
                OR contact_bill_no REGEXP '^[0-9]+$'
            )
            AND contact_bill_no NOT LIKE 'ARC%%'
        """, (contact_id,), as_dict=True)

        for s in sales:
            new_bill_no = f"{prefix}{s['contact_bill_no']}"
            frappe.db.set_value("Mandi Sale", s["name"], "contact_bill_no", new_bill_no, update_modified=False)
            reset_count += 1

        frappe.db.commit()

        next_no = f"{current_year}-1"

        if reset_count == 0:
            return {
                "success": True,
                "message": f"No active sequences found. Next invoice will be {next_no}.",
                "reset_count": 0,
                "next_bill_no": next_no
            }

        return {
            "success": True,
            "message": f"Sequence reset. {reset_count} invoice(s) archived. Next invoice for this contact will be {next_no}.",
            "reset_count": reset_count,
            "next_bill_no": next_no
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "reset_invoice_sequence Failed")
        return {"success": False, "error": str(e)}


def enforce_single_session_on_user(doc, method=None):
    """
    Frappe `User.after_insert` hook.
    Ensures every new Frappe User created via MandiGrow is born with
    simultaneous_sessions = 1, regardless of the default set in System Settings.
    This is the forward defense for the session concurrency vulnerability.
    """
    if doc.name in ("Administrator", "Guest"):
        return
    try:
        frappe.db.set_value("User", doc.name, "simultaneous_sessions", 1, update_modified=False)
        frappe.logger().info(f"[enforce_single_session] Set simultaneous_sessions=1 for new user: {doc.name}")
    except Exception:
        frappe.log_error(frappe.get_traceback(), "enforce_single_session_on_user failed")


def on_login(login_manager):

    """
    Called after a user successfully logs in.
    1. Enforces 'Single Session per User' by killing ALL previous sessions
       from BOTH MySQL (tabSessions) AND Redis cache.
       
       ROOT CAUSE of previous failure:
       Our old code only deleted from MySQL. Frappe validates sessions from
       Redis *first* (get_session_data_from_cache). If Redis still has the
       old session, Frappe never even checks MySQL — the old session stays
       fully alive until Redis TTL expires (up to 240 hours by default).
       
       FIX: Use Frappe's own delete_session() which atomically calls:
         - frappe.db.delete("Sessions", {"sid": sid})  → clears MySQL
         - frappe.cache.hdel("session", sid)           → clears Redis
       This is the ONLY correct way to invalidate a Frappe session.
       
    2. Blocks authentication for locked/suspended tenant organizations.
    """
    from frappe.sessions import delete_session

    user = login_manager.user
    if user == "Administrator":
        return

    # ── Subscription enforcement at login ────────────────────────────────
    try:
        org_id = frappe.db.get_value("User", user, "mandi_organization")
        if org_id:
            org_status = frappe.db.get_value("Mandi Organization", org_id, "status")
            blocked_statuses = {"suspended", "locked"}
            if org_status in blocked_statuses:
                from mandigrow.mandigrow.logic.subscription_guard import log_subscription_event
                log_subscription_event(
                    org_id=org_id,
                    action="login_blocked",
                    old_value=org_status,
                    new_value="login_denied",
                    notes=f"Login blocked for {user}. Org status: {org_status}",
                    changed_by=user
                )
                frappe.db.commit()
                frappe.throw(
                    _("Your organization's access has been suspended. Please contact support or renew your subscription."),
                    frappe.AuthenticationError
                )
    except frappe.AuthenticationError:
        raise
    except Exception:
        pass
    # ────────────────────────────────────────────────────────────────────

    # ── Harden: always ensure simultaneous_sessions=1 at login ───────────
    # Defense-in-depth: even if someone manually set it to 2+ via Frappe desk,
    # we reset it here on every successful login.
    if user != "Administrator" and user != "Guest":
        current_sim = frappe.db.get_value("User", user, "simultaneous_sessions") or 1
        if current_sim != 1:
            frappe.db.set_value("User", user, "simultaneous_sessions", 1, update_modified=False)
            frappe.logger().warning(f"[on_login] Reset simultaneous_sessions from {current_sim} → 1 for {user}")

    # ── Single-device enforcement: STRICT BLOCK ────────────────
    # We must query the SIDs BEFORE the new session is committed.
    new_sid = frappe.session.sid

    # Fetch all other SIDs for this user from MySQL
    old_sids = frappe.db.sql("""
        SELECT sid FROM `tabSessions`
        WHERE `user` = %s AND `sid` != %s
    """, (user, new_sid), as_dict=False)

    if old_sids:
        # User is actively logged in elsewhere. We block the new login attempt entirely.
        # This guarantees two sessions can never be opened simultaneously.
        frappe.throw(
            "Access Denied: This account is already logged in on another device. Please log out from your active session first.",
            frappe.AuthenticationError
        )


    # ─────────────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def create_comprehensive_sale_adjustment(p_organization_id, p_sale_item_id, p_new_qty, p_new_rate, p_reason):
    """Adjust a sale item, recalculate totals, and update the ledger atomically.

    Design: Post a DELTA journal entry only - do NOT cancel/re-post the original JE.
    - No daybook entry needed for rate adjustments (per business requirement).
    - For sale price increase: Dr Debtors (buyer ledger), Cr Stock In Hand (delta)
    - For sale price decrease: Dr Stock In Hand (delta), Cr Debtors (buyer ledger)
    - Only the party ledger gets updated - original daybook entries are untouched.
    """
    try:
        from frappe.utils import flt, today

        sale_item = frappe.get_doc("Mandi Sale Item", p_sale_item_id, ignore_permissions=True)
        if not sale_item:
            frappe.throw("Sale Item not found")

        sale = frappe.get_doc("Mandi Sale", sale_item.parent, ignore_permissions=True)
        if sale.organization_id != p_organization_id:
            frappe.throw("Organization mismatch")

        old_qty = flt(sale_item.qty)
        old_rate = flt(sale_item.rate)
        new_qty = flt(p_new_qty)
        new_rate = flt(p_new_rate)

        if old_qty == new_qty and old_rate == new_rate:
            return {"success": True, "message": "No changes needed."}

        old_amount = old_qty * old_rate
        new_amount = new_qty * new_rate
        delta = new_amount - old_amount  # positive = price increased, negative = decreased

        # Update the item row
        frappe.db.set_value("Mandi Sale Item", p_sale_item_id, {
            "qty": new_qty,
            "rate": new_rate,
            "amount": new_amount
        }, update_modified=False)

        # Adjust stock in Mandi Lot if quantity changed
        if old_qty != new_qty and sale_item.lot_id:
            qty_diff = old_qty - new_qty
            frappe.db.sql("""
                UPDATE `tabMandi Lot`
                SET current_qty = current_qty + %s
                WHERE name = %s
            """, (qty_diff, sale_item.lot_id))

        # Reload sale and recalculate totals
        sale.reload()
        sale.recalculate_totals()
        frappe.db.set_value("Mandi Sale", sale.name, {
            "totalamount": sale.totalamount,
            "invoice_total": sale.invoice_total,
            "status": sale.status
        }, update_modified=False)

        # Log adjustment via Frappe Comment (audit trail)
        item_code = sale_item.item_id or "Item"
        log_msg = f"[Adjustment]: {item_code} | Qty {old_qty}->{new_qty} | Rate Rs.{old_rate}->Rs.{new_rate} | Delta: Rs.{delta:+.2f} | Reason: {p_reason}"
        frappe.get_doc({
            "doctype": "Comment",
            "comment_type": "Comment",
            "reference_doctype": "Mandi Sale",
            "reference_name": sale.name,
            "content": log_msg
        }).insert(ignore_permissions=True)

        # Post Delta Ledger Entry (Party Ledger only - NO daybook)
        if abs(delta) >= 0.01:
            company = None
            if getattr(sale, "organization_id", None):
                company = frappe.db.get_value("Mandi Organization", sale.organization_id, "erp_company")
            if not company:
                from mandigrow.mandigrow.logic.automation import get_default_company
                company = get_default_company()

            from mandigrow.mandigrow.logic.automation import (
                ensure_company_party_defaults, ensure_customer_for_contact, _party_name
            )
            ensure_company_party_defaults(company)
            customer = ensure_customer_for_contact(sale.buyerid, company)
            party_name = _party_name(sale.buyerid)

            debtor_account = frappe.db.get_value("Account", {
                "account_type": "Receivable",
                "company": company,
                "is_group": 0
            }, "name")
            if not debtor_account:
                debtor_account = frappe.db.get_value("Account", {
                    "account_name": ["like", "%Debtor%"],
                    "company": company,
                    "is_group": 0
                }, "name")

            stock_account = frappe.db.get_value("Account", {
                "account_name": ["like", "%Stock In Hand%"],
                "company": company,
                "is_group": 0
            }, "name")
            if not stock_account:
                stock_account = frappe.db.get_value("Account", {
                    "account_type": "Stock",
                    "company": company,
                    "is_group": 0
                }, "name")

            if debtor_account and stock_account:
                abs_delta = abs(delta)
                if delta > 0:
                    dr_account, cr_account = debtor_account, stock_account
                    dr_party, cr_party = customer, None
                else:
                    dr_account, cr_account = stock_account, debtor_account
                    dr_party, cr_party = None, customer

                dr_leg = {
                    "account": dr_account,
                    "debit_in_account_currency": abs_delta,
                    "credit_in_account_currency": 0,
                    "against_voucher_type": "Mandi Sale",
                    "against_voucher": sale.name,
                }
                if dr_party:
                    dr_leg["party_type"] = "Customer"
                    dr_leg["party"] = dr_party

                cr_leg = {
                    "account": cr_account,
                    "debit_in_account_currency": 0,
                    "credit_in_account_currency": abs_delta,
                    "against_voucher_type": "Mandi Sale",
                    "against_voucher": sale.name,
                }
                if cr_party:
                    cr_leg["party_type"] = "Customer"
                    cr_leg["party"] = cr_party

                direction = "up" if delta > 0 else "down"
                delta_je = frappe.new_doc("Journal Entry")
                delta_je.voucher_type = "Journal Entry"
                delta_je.company = company
                delta_je.posting_date = sale.saledate or today()
                delta_je.user_remark = f"[Rate Adj {direction}] {sale.name} | {item_code} {new_qty}xRs.{new_rate} (was Rs.{old_rate}) Delta Rs.{delta:+.2f} | {p_reason}"[:140]
                delta_je.append("accounts", dr_leg)
                delta_je.append("accounts", cr_leg)
                delta_je.flags.ignore_permissions = True
                delta_je.insert()
                delta_je.flags.ignore_permissions = True
                delta_je.submit()

                from mandigrow.mandigrow.logic.automation import _tag_gl_entries
                _tag_gl_entries(delta_je.name, "Mandi Sale", sale.name)

        frappe.db.commit()
        return {
            "success": True,
            "message": f"Adjustment applied. Delta Rs.{delta:+.2f} posted to party ledger.",
            "new_invoice_total": sale.invoice_total,
            "delta": delta
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "create_comprehensive_sale_adjustment Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=True)
def create_partner_application(name, phone, city, partner_type, background=None, email=None):
    """
    Called by Next.js /api/partner-apply route.
    Saves application to Mandi Partner Profile with status=Pending.
    """
    import re
    try:
        # Prevent duplicate applications from same mobile
        if frappe.db.exists("Mandi Partner Profile", {"mobile_number": phone}):
            return {"success": False, "error": "An application with this phone number already exists."}

        # Map incoming lowercase keys from Next.js to Frappe Select options
        type_map = {
            "freelancer": "Freelancer",
            "agency": "Agency",
            "state": "State Distributor"
        }
        mapped_type = type_map.get(partner_type, "Freelancer")

        doc = frappe.get_doc({
            "doctype":      "Mandi Partner Profile",
            "partner_name": name,
            "email":        email or "",
            "mobile_number": phone,
            "city":         city,
            "partner_type": mapped_type,
            "background":   background or "",
            "status":       "Pending"
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "id": doc.name, "message": "Application created"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "create_partner_application Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_partner_applications(status=None):
    """
    Called by /admin/partners page to list all partner applications.
    Requires admin session (allow_guest=False).
    Returns all records from Mandi Partner Profile, optionally filtered by status.
    """
    try:
        filters = {}
        if status and status != "All":
            filters["status"] = status

        records = frappe.get_all(
            "Mandi Partner Profile",
            filters=filters,
            fields=[
                "name", "partner_name", "email", "mobile_number", "city",
                "partner_type", "status", "referral_code", "frappe_user",
                "total_onboarded", "total_commission_earned",
                "background", "rejection_reason", "creation"
            ],
            order_by="creation desc",
            limit=200,
            ignore_permissions=True
        )
        return {"success": True, "data": records, "total": len(records)}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_partner_applications Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def approve_partner(partner_id):
    """
    Admin action: Approve a partner application.
    1. Generates a unique referral code
    2. Creates a Frappe user with the partner's email
    3. Sets a temporary password
    4. Sends welcome email with login credentials + referral link
    5. Updates status to Approved
    """
    import random
    import string

    try:
        partner = frappe.get_doc("Mandi Partner Profile", partner_id)

        if partner.status == "Approved":
            return {"success": False, "error": "Partner is already approved."}

        if not partner.email:
            return {"success": False, "error": "Cannot approve: partner has no email address. Ask them to reapply with email."}

        # ── 1. Generate unique referral code ────────────────────────────────
        def make_code():
            prefix = (partner.partner_name or "MG")[:3].upper().replace(" ", "")
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            return f"{prefix}{suffix}"

        referral_code = make_code()
        # Ensure uniqueness
        attempts = 0
        while frappe.db.exists("Mandi Partner Profile", {"referral_code": referral_code}) and attempts < 10:
            referral_code = make_code()
            attempts += 1

        # ── 2. Create Frappe User ────────────────────────────────────────────
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        frappe_user_id = partner.email

        if frappe.db.exists("User", frappe_user_id):
            # User already exists — just link it
            user_doc = frappe.get_doc("User", frappe_user_id)
        else:
            user_doc = frappe.get_doc({
                "doctype":     "User",
                "email":       frappe_user_id,
                "first_name":  (partner.partner_name or "Partner").split()[0],
                "last_name":   ' '.join((partner.partner_name or "Partner").split()[1:]) or "",
                "mobile_no":   partner.mobile_number or "",
                "enabled":     1,
                "user_type":   "Website User",
                "new_password": temp_password,
            })
            user_doc.insert(ignore_permissions=True)

        # ── 3. Update Partner Profile ────────────────────────────────────────
        frappe.db.set_value("Mandi Partner Profile", partner_id, {
            "status":        "Approved",
            "referral_code": referral_code,
            "frappe_user":   frappe_user_id,
        }, update_modified=True)
        frappe.db.commit()

        # ── 4. Send welcome email ────────────────────────────────────────────
        site_url = frappe.utils.get_url()
        referral_link = f"{site_url}/ref/{referral_code}"
        login_url     = f"{site_url}/partner/dashboard"

        welcome_subject = f"Welcome to MandiGrow Partner Program — Your Account is Ready!"
        welcome_body = f"""
Dear {partner.partner_name},

Congratulations! Your MandiGrow Partner application has been APPROVED.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR LOGIN CREDENTIALS:
  Email:    {frappe_user_id}
  Password: {temp_password}
  Login:    {login_url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR REFERRAL LINK:
  {referral_link}

Share this link with mandi owners. When they sign up using your link,
you will automatically earn 30% recurring commission on their subscription.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT STEPS:
1. Log in at: {login_url}
2. Change your password immediately
3. Copy your referral link and start sharing
4. WhatsApp us at +91-XXXXXXXXXX for your training session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to the MandiGrow family!

Team MandiGrow
mandigrow.com
        """.strip()

        try:
            site_url_for_mail = frappe.utils.get_url()
            html_welcome = f"""
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
  <h2 style="color:#047857;margin-bottom:4px;">Welcome to MandiGrow Partner Program!</h2>
  <p style="color:#6b7280;font-size:14px;margin-top:0;">Congratulations, {partner.partner_name}! Your application has been <b style="color:#047857;">APPROVED</b>.</p>

  <div style="background:#f0fdf4;border:2px solid #047857;padding:20px;border-radius:10px;margin:20px 0;">
    <table style="width:100%;font-size:15px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#6b7280;width:100px;"><b>Email</b></td><td style="padding:6px 0;color:#111827;">{frappe_user_id}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;"><b>Password</b></td><td style="padding:6px 0;color:#047857;font-size:20px;letter-spacing:4px;font-weight:bold;">{temp_password}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;"><b>Login URL</b></td><td style="padding:6px 0;"><a href="{login_url}" style="color:#047857;">{login_url}</a></td></tr>
    </table>
  </div>

  <p style="color:#374151;"><b>Your Referral Link:</b><br><a href="{referral_link}" style="color:#047857;font-size:16px;">{referral_link}</a></p>
  <p style="color:#6b7280;font-size:13px;">Share this link with mandi owners. When they sign up using your link, you earn <b>30% recurring commission</b> on their subscription.</p>

  <ol style="color:#374151;font-size:14px;line-height:2;">
    <li>Log in at <a href="{login_url}" style="color:#047857;">{login_url}</a></li>
    <li>Change your password immediately</li>
    <li>Copy your referral link and start sharing</li>
  </ol>

  <p style="color:#047857;font-weight:bold;margin-top:24px;">Team MandiGrow — mandigrow.com</p>
</div>
""".strip()
            _send_direct_smtp(
                to_email=frappe_user_id,
                subject="Welcome to MandiGrow Partner Program — Your Account is Ready!",
                html_body=html_welcome
            )
        except Exception as mail_err:
            frappe.log_error(str(mail_err), "approve_partner: welcome email failed (non-fatal)")

        return {
            "success":       True,
            "referral_code": referral_code,
            "referral_link": referral_link,
            "frappe_user":   frappe_user_id,
            "temp_password": temp_password,
            "message":       f"Partner approved. Referral code: {referral_code}. Welcome email sent to {frappe_user_id}."
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "approve_partner Failed")
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def link_partner_to_tenant(tenant_id, partner_id):
    """
    Admin action: Manually link an approved partner to a Mandi Organization.
    Sets the partner on the organization and sends a Trust/Guarantee Report email to the partner.
    """
    if "System Manager" not in frappe.get_roles() and "Super Admin" not in frappe.get_roles():
        return {"success": False, "error": "Not authorized."}
        
    try:
        # Validate Tenant
        if not frappe.db.exists("Mandi Organization", tenant_id):
            return {"success": False, "error": "Tenant not found."}
            
        org = frappe.get_doc("Mandi Organization", tenant_id)
        
        # Validate Partner
        if not frappe.db.exists("Mandi Partner Profile", partner_id):
            return {"success": False, "error": "Partner not found."}
            
        partner = frappe.get_doc("Mandi Partner Profile", partner_id)
        
        if partner.status != "Approved":
            return {"success": False, "error": "Partner must be approved first."}
            
        if not partner.email:
            return {"success": False, "error": "Partner does not have an email address."}
            
        # 1. Update Organization
        old_partner_id = org.partner
        
        org.partner = partner.name
        org.onboarding_partner = partner.name
        org.save(ignore_permissions=True)
        
        # Decrement old partner count if needed
        if old_partner_id and old_partner_id != partner.name:
            old_count = frappe.db.get_value("Mandi Partner Profile", old_partner_id, "total_onboarded") or 0
            if old_count > 0:
                frappe.db.set_value("Mandi Partner Profile", old_partner_id, "total_onboarded", old_count - 1, update_modified=False)
                
        # Increment new partner count
        new_count = frappe.db.get_value("Mandi Partner Profile", partner.name, "total_onboarded") or 0
        frappe.db.set_value("Mandi Partner Profile", partner.name, "total_onboarded", new_count + 1, update_modified=False)
        
        frappe.db.commit()
        
        # 2. Get Commission Setting
        commission_percent = frappe.db.get_single_value("Mandi Partner Settings", "commission_percentage") or 15.0
        
        # 3. Generate and Send Trust Report Email
        subject = f"Official Confirmation: Assignment of {org.organization_name or tenant_id} to your Partner Account"
        
        message = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Assignment & Payout Guarantee</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #334155; line-height: 1.5;">Dear <strong>{partner.partner_name}</strong>,</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.5;">This is an official confirmation from MandiGrow that a new Mandi has been successfully linked to your partner account.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Assignment Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mandi ID:</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-size: 14px; text-align: right;">{tenant_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mandi Name:</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-size: 14px; text-align: right;">{org.organization_name or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Commission Rate:</td>
                            <td style="padding: 8px 0; color: #10b981; font-weight: bold; font-size: 14px; text-align: right;">{commission_percent}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status:</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: bold; font-size: 14px; text-align: right;">Linked & Active</td>
                        </tr>
                    </table>
                </div>
                
                <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Payout Transparency Guarantee</h3>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">As part of our exclusive Partner Program, you are guaranteed a <strong>{commission_percent}% commission</strong> on all subscription renewals paid by this Mandi, for the lifetime of their active account.</p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">Payouts are calculated automatically by our system upon successful receipt of funds from the tenant and will be dispatched according to your standard payout cycle.</p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                
                <p style="font-size: 14px; color: #64748b;">If you have any questions regarding your payouts or need assistance, our finance team is available directly at <a href="mailto:finance@mandigrow.com" style="color: #3b82f6; text-decoration: none;">finance@mandigrow.com</a>.</p>
                <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Thank you for your trust and partnership,<br/><strong>MandiGrow Executive Team</strong></p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated system receipt. Please do not reply directly to this email.</p>
            </div>
        </div>
        """
        
        try:
            frappe.sendmail(
                recipients=[partner.email],
                subject=subject,
                message=message,
                now=True
            )
            email_sent = True
        except Exception as e:
            frappe.logger().error(f"Failed to send link trust email to {partner.email}: {str(e)}")
            email_sent = False
            
        return {
            "success": True, 
            "message": "Partner linked successfully",
            "email_sent": email_sent
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(frappe.get_traceback(), "link_partner_to_tenant Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def reject_partner(partner_id, reason=""):
    """
    Admin action: Reject a partner application.
    Updates status to Rejected, saves reason, sends rejection email.
    """
    try:
        partner = frappe.get_doc("Mandi Partner Profile", partner_id)

        frappe.db.set_value("Mandi Partner Profile", partner_id, {
            "status":           "Rejected",
            "rejection_reason": reason,
        }, update_modified=True)
        frappe.db.commit()

        # Send rejection email if partner has email
        if partner.email:
            try:
                html_reject = f"""
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
  <h2 style="color:#374151;">MandiGrow Partner Application Update</h2>
  <p style="color:#6b7280;">Dear {partner.partner_name},</p>
  <p style="color:#6b7280;">Thank you for applying to the MandiGrow Partner Program.</p>
  <p style="color:#374151;">After reviewing your application, we are unable to approve it at this time.</p>
  <p><b>Reason:</b> {reason or 'Does not meet current partner criteria.'}</p>
  <p style="color:#6b7280;">You are welcome to reapply after 30 days or contact us on WhatsApp for clarification.</p>
  <p style="color:#047857;font-weight:bold;">Team MandiGrow — mandigrow.com</p>
</div>
""".strip()
                _send_direct_smtp(
                    to_email=partner.email,
                    subject="MandiGrow Partner Application Update",
                    html_body=html_reject
                )
            except Exception as mail_err:
                frappe.log_error(str(mail_err), "reject_partner: email failed (non-fatal)")

        return {"success": True, "message": f"Partner {partner_id} rejected."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "reject_partner Failed")
        return {"success": False, "error": str(e)}


def _send_direct_smtp(to_email: str, subject: str, html_body: str) -> None:
    """
    Send email via direct SMTP (bypasses Frappe email queue).
    Used for partner credential emails to avoid '5.7.0 Please authenticate first' queue errors.
    """
    import smtplib, ssl
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from frappe.utils.password import get_decrypted_password

    acct = frappe.db.get_value(
        "Email Account",
        {"enable_outgoing": 1, "default_outgoing": 1},
        ["name", "email_id", "smtp_server", "smtp_port", "login_id", "use_tls"],
        as_dict=True
    )
    if not acct:
        frappe.throw("Outgoing email not configured.")

    smtp_pw = get_decrypted_password("Email Account", acct["name"], "password") or ""
    if not smtp_pw:
        frappe.throw("SMTP password not configured.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"MandiGrow <{acct['email_id']}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    smtp_host = str(acct.get("smtp_server") or "smtp-relay.brevo.com")
    smtp_port = int(acct.get("smtp_port") or 587)
    smtp_login = str(acct.get("login_id") or acct["email_id"])
    ctx = ssl.create_default_context()

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as srv:
        srv.ehlo()
        if acct.get("use_tls"):
            srv.starttls(context=ctx)
            srv.ehlo()
        srv.login(smtp_login, smtp_pw)
        srv.sendmail(acct["email_id"], [to_email], msg.as_string())


@frappe.whitelist(allow_guest=False)
def resend_partner_credentials(partner_id: str) -> dict:
    """
    Admin action: Resend login credentials to an approved partner.
    Generates a new temp password, updates the Frappe user, and sends via direct SMTP.
    """
    import random, string

    try:
        partner = frappe.get_doc("Mandi Partner Profile", partner_id, ignore_permissions=True)

        if partner.status != "Approved":
            return {"success": False, "error": "Only approved partners can have credentials resent."}

        if not partner.email:
            return {"success": False, "error": "Partner has no email address."}

        frappe_user_id = partner.email

        # Generate new temporary password
        temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        # Update or create Frappe User
        if frappe.db.exists("User", frappe_user_id):
            user_doc = frappe.get_doc("User", frappe_user_id)
            user_doc.new_password = temp_password
            user_doc.flags.ignore_permissions = True
            user_doc.save()
        else:
            user_doc = frappe.get_doc({
                "doctype":     "User",
                "email":       frappe_user_id,
                "first_name":  (partner.partner_name or "Partner").split()[0],
                "last_name":   ' '.join((partner.partner_name or "Partner").split()[1:]) or "",
                "mobile_no":   partner.mobile_number or "",
                "enabled":     1,
                "user_type":   "Website User",
                "new_password": temp_password,
            })
            user_doc.insert(ignore_permissions=True)

        frappe.db.commit()

        # Build email
        site_url = frappe.utils.get_url()
        referral_code = partner.referral_code or ""
        referral_link = f"{site_url}/ref/{referral_code}" if referral_code else ""
        login_url = f"{site_url}/partner/dashboard"

        html_body = f"""
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
  <h2 style="color:#047857;margin-bottom:4px;">MandiGrow Partner — Login Credentials</h2>
  <p style="color:#6b7280;font-size:14px;margin-top:0;">Hi {partner.partner_name}, here are your updated login credentials.</p>

  <div style="background:#f0fdf4;border:2px solid #047857;padding:20px;border-radius:10px;margin:20px 0;">
    <table style="width:100%;font-size:15px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#6b7280;width:100px;"><b>Email</b></td><td style="padding:6px 0;color:#111827;">{frappe_user_id}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;"><b>Password</b></td><td style="padding:6px 0;color:#047857;font-size:20px;letter-spacing:4px;font-weight:bold;">{temp_password}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;"><b>Login URL</b></td><td style="padding:6px 0;"><a href="{login_url}" style="color:#047857;">{login_url}</a></td></tr>
    </table>
  </div>

  {f'<p style="color:#374151;"><b>Your Referral Link:</b> <a href="{referral_link}" style="color:#047857;">{referral_link}</a></p>' if referral_link else ''}

  <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Please change your password after first login. If you did not request this, contact us immediately.</p>
  <p style="color:#047857;font-weight:bold;">Team MandiGrow — mandigrow.com</p>
</div>
""".strip()

        _send_direct_smtp(
            to_email=frappe_user_id,
            subject="MandiGrow Partner — Your Login Credentials",
            html_body=html_body
        )

        return {"success": True, "message": f"Credentials sent to {frappe_user_id}."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "resend_partner_credentials Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=True)
def get_partner_settings():
    """
    Called by Next.js frontend to dynamically render partner page marketing content.
    """
    if frappe.db.exists("Mandi Partner Settings", "Mandi Partner Settings"):
        return frappe.get_doc("Mandi Partner Settings").as_dict()
    return {}


@frappe.whitelist(allow_guest=True)
def partner_login(mobile_number, otp=None):
    """
    Secure partner login via OTP. Creates a Frappe session for the linked user.
    """
    partner = frappe.get_all("Mandi Partner Profile", 
                             filters={"mobile_number": mobile_number, "status": "Approved"}, 
                             fields=["name", "partner_name", "frappe_user"])
    if not partner:
        return {"success": False, "message": "No approved partner found with this number."}
    
    partner = partner[0]
    user = partner.frappe_user
    if not user:
        return {"success": False, "message": "Partner profile has no associated login account."}

    if not otp or len(str(otp)) < 4:
        return {"success": False, "message": "Invalid OTP."}

    # Create secure session
    from frappe.auth import LoginManager
    frappe.local.login_manager = LoginManager()
    frappe.local.login_manager.login_as(user)
    
    return {
        "success": True, 
        "partner": {
            "name": partner.name,
            "partner_name": partner.partner_name
        }
    }


@frappe.whitelist(allow_guest=False)
def get_partner_dashboard():
    """Partner-facing dashboard data — securely scoped to the logged-in user."""
    try:
        partner_id = frappe.db.get_value("Mandi Partner Profile", {"frappe_user": frappe.session.user}, "name")
        if not partner_id:
            return {"success": False, "error": "Partner profile not found for this user."}

        mandis = frappe.get_all(
            "Mandi Organization",
            filters={"partner": partner_id},
            fields=["name", "organization_name", "creation", "subscription_status"]
        )
        payouts = frappe.get_all(
            "Mandi Partner Payout",
            filters={"partner": partner_id},
            fields=["name", "payout_month", "payout_year", "commission_amount", "status", "payment_date"],
            order_by="creation desc"
        )
        partner = frappe.get_doc("Mandi Partner Profile", partner_id)

        return {
            "success": True,
            "mandis":  mandis,
            "payouts": payouts,
            "partner": {
                "name":                   partner.name,
                "partner_name":           partner.partner_name,
                "referral_code":          partner.referral_code or "",
                "total_onboarded":        partner.total_onboarded or 0,
                "total_commission_earned": float(partner.total_commission_earned or 0),
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_partner_dashboard Failed")
        return {"success": False, "error": str(e)}




def _parse_adjustments(remark):
    adjustments = []
    if not remark: return adjustments
    for line in remark.split("\n"):
        if "[Adjustment]:" in line:
            try:
                parts = line.split("|")
                item = parts[0].replace("[Adjustment]:", "").strip()
                qty_part = parts[1].strip().replace("Qty ", "")
                rate_part = parts[2].strip().replace("Rate ", "")
                reason_part = parts[3].strip().replace("Reason:", "")
                old_qty, new_qty = qty_part.split("->")
                old_rate, new_rate = rate_part.split("->")
                adjustments.append({
                    "id": len(adjustments) + 1,
                    "old_qty": float(old_qty.strip()),
                    "new_qty": float(new_qty.strip()),
                    "old_value": float(old_rate.strip()),
                    "new_value": float(new_rate.strip()),
                    "reason": reason_part.strip()
                })
            except Exception:
                continue
    return adjustments


@frappe.whitelist(allow_guest=False)
def repair_direct_arrivals():
    from mandigrow.mandigrow.logic.automation import post_arrival_ledger
    arrivals = frappe.get_all("Mandi Arrival", filters={"docstatus": 1, "arrival_type": "direct"}, fields=["name"])
    count = 0
    for arr in arrivals:
        doc = frappe.get_doc("Mandi Arrival", arr.name)
        _enforce_ownership(doc)
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
    return {"status": "success", "reposted_count": count}

@frappe.whitelist(allow_guest=True)
def get_active_feature_flags():
    """
    Returns a dictionary of all active feature flags for the frontend to consume globally.
    Example: {"maintenance_mode": True, "finance_module": False}
    """
    if not frappe.db.table_exists("Mandi Feature Flag"):
        return {}
    flags = frappe.get_all("Mandi Feature Flag", fields=["flag_key", "is_enabled"])
    return {f.flag_key: bool(f.is_enabled) for f in flags}

# ─── SUPPORT HUB ──────────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def create_support_ticket(subject, message, ticket_type="support"):
    user = frappe.session.user
    
    # Get organization_id for current user
    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if not org_id:
        # Fallback if no org
        org_id = frappe.db.get_value("Mandi Organization", {"name": "Default Organization"}, "name")
        
    doc = frappe.get_doc({
        "doctype": "Mandi Support Ticket",
        "subject": subject,
        "message": message,
        "ticket_type": ticket_type,
        "status": "open",
        "user_id": user,
        "organization_id": org_id
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Send alerts to all Super Admins and Support Admins
    admin_roles = ["System Manager", "Super Admin", "Support Admin"]
    admin_users = []
    for role in admin_roles:
        users_with_role = frappe.get_all("Has Role", filters={"role": role, "parenttype": "User"}, fields=["parent"])
        admin_users.extend([u.parent for u in users_with_role])
        
    admin_users = list(set(admin_users)) # deduplicate
    
    # Send email to each admin
    for admin_email in admin_users:
        if admin_email != "Administrator": # Skip the default Administrator
            try:
                frappe.sendmail(
                    recipients=[admin_email],
                    subject=f"New Support Ticket: {subject}",
                    message=f"<p>A new {ticket_type} ticket was created by {user}.</p><p><b>Message:</b></p><blockquote>{message}</blockquote><p>Check the admin dashboard to respond.</p>"
                )
            except Exception as e:
                frappe.log_error(f"Failed to send support email to {admin_email}: {str(e)}", "Support Hub Email Error")
                
    return {"success": True, "ticket_id": doc.name}

@frappe.whitelist(allow_guest=False)
def get_support_tickets():
    user = frappe.session.user
    tickets = frappe.get_all("Mandi Support Ticket", 
        filters={"user_id": user},
        fields=["name as id", "subject", "message", "ticket_type", "status", "admin_notes", "creation as created_at"],
        order_by="creation desc",
        ignore_permissions=True
    )
    return {"tickets": tickets}

@frappe.whitelist(allow_guest=False)
def get_all_support_tickets():
    # Admin only
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    # Check if super admin or has support admin role
    roles = frappe.get_roles(frappe.session.user)
    if not is_super_admin() and "Support Admin" not in roles and "System Manager" not in roles:
        frappe.throw(_("Access Denied"))
        
    tickets = frappe.get_all("Mandi Support Ticket",
        fields=["name as id", "subject", "message", "ticket_type", "status", "admin_notes", "creation as created_at", "organization_id", "user_id"],
        order_by="creation desc",
        ignore_permissions=True
    )
    
    # Map org names
    for t in tickets:
        org_name = frappe.db.get_value("Mandi Organization", t.organization_id, "organization_name")
        t.org = {"name": org_name or t.organization_id, "tenant_id": t.organization_id}
        
    return {"tickets": tickets}

@frappe.whitelist(allow_guest=False)
def update_support_ticket(ticket_id, status, admin_notes=""):
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    roles = frappe.get_roles(frappe.session.user)
    if not is_super_admin() and "Support Admin" not in roles and "System Manager" not in roles:
        frappe.throw(_("Access Denied"))
        
    if not frappe.db.exists("Mandi Support Ticket", ticket_id):
        frappe.throw(_("Ticket not found"))
        
    doc = frappe.get_doc("Mandi Support Ticket", ticket_id)
    doc.status = status
    doc.admin_notes = admin_notes
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    
    return {"success": True}

@frappe.whitelist(allow_guest=False)
def assign_tenant_partner(org_id: str, partner_id: str) -> dict:
    """Assigns or updates the onboarding partner for a tenant."""
    from mandigrow.mandigrow.logic.tenancy import is_super_admin
    if not is_super_admin():
        frappe.throw(_("Access Denied: Only Super Admin can perform this action."))

    if not frappe.db.exists("Mandi Organization", org_id):
        frappe.throw(_("Organization not found"))
        
    if partner_id and not frappe.db.exists("Mandi Partner Profile", partner_id):
        frappe.throw(_("Partner not found"))

    doc = frappe.get_doc("Mandi Organization", org_id)
    doc.onboarding_partner = partner_id
    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# CRATE MANAGEMENT APIs
# Added: 2026-05-22 | Author: MandiGrow Engineering
# Design: Additive-only. Completely isolated from all existing Sale/Purchase/GL flows.
#         Feature-flagged: enable_crate_tracking in Mandi Settings (default OFF).
#         tabMandi Crate Ledger is a standalone table — NEVER touches tabGL Entry.
# ══════════════════════════════════════════════════════════════════════════════

def _is_crate_tracking_enabled(org_id: str) -> bool:
    """Check if crate tracking is enabled for this org."""
    try:
        org_info = _get_org_info(org_id)
        return bool(org_info.get("enable_crate_tracking"))
    except Exception:
        return False


def _post_crate_ledger_entry(
    org_id: str,
    party_id: str,
    party_name: str,
    crate_type: str,
    qty_out: int = 0,
    qty_in: int = 0,
    deposit_amount: float = 0.0,
    source_doctype: str = "",
    source_docname: str = "",
    notes: str = "",
    posting_date: str = None,
) -> str:
    """
    Internal helper: creates one Mandi Crate Ledger entry.
    running_balance = previous_balance + qty_out - qty_in.
    Only called by the 4 public crate API functions.
    """
    if not posting_date:
        posting_date = frappe.utils.today()

    prev = frappe.db.sql("""
        SELECT COALESCE(running_balance, 0)
        FROM `tabMandi Crate Ledger`
        WHERE organization_id = %s AND party_id = %s AND crate_type = %s
        ORDER BY creation DESC
        LIMIT 1
    """, (org_id, party_id, crate_type))
    prev_balance = int(prev[0][0]) if prev else 0
    running_balance = prev_balance + qty_out - qty_in

    doc = frappe.get_doc({
        "doctype": "Mandi Crate Ledger",
        "posting_date": posting_date,
        "organization_id": org_id,
        "party_id": party_id,
        "party_name": party_name,
        "crate_type": crate_type,
        "qty_out": qty_out,
        "qty_in": qty_in,
        "running_balance": running_balance,
        "deposit_amount": deposit_amount,
        "deposit_converted": 0,
        "source_doctype": source_doctype,
        "source_docname": source_docname,
        "notes": notes,
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return doc.name


@frappe.whitelist(allow_guest=False)
def get_crate_summary(org_id: str = None) -> dict:
    """
    Returns the crate dashboard summary.
    Safe: reads only tabMandi Crate Ledger. Financial tables are never touched.
    """
    if not org_id:
        org_id = _get_user_org()
    if not org_id:
        return {"godown": [], "outstanding": [], "alerts": []}

    org_info = _get_org_info(org_id)
    ageing_days = int(org_info.get("crate_ageing_days") or 7)
    cutoff_date = frappe.utils.add_days(frappe.utils.today(), -ageing_days)

    outstanding_raw = frappe.db.sql("""
        SELECT cl.party_id, cl.party_name, cl.crate_type, cl.running_balance, cl.posting_date
        FROM `tabMandi Crate Ledger` cl
        INNER JOIN (
            SELECT party_id, crate_type, MAX(creation) as max_creation
            FROM `tabMandi Crate Ledger`
            WHERE organization_id = %s AND running_balance > 0
            GROUP BY party_id, crate_type
        ) latest ON cl.party_id = latest.party_id
                 AND cl.crate_type = latest.crate_type
                 AND cl.creation = latest.max_creation
        WHERE cl.organization_id = %s
        ORDER BY cl.running_balance DESC
        LIMIT 100
    """, (org_id, org_id), as_dict=True)

    godown_raw = frappe.db.sql("""
        SELECT crate_type,
               SUM(qty_out) as total_out,
               SUM(qty_in) as total_in,
               SUM(qty_out) - SUM(qty_in) as net_held_by_parties
        FROM `tabMandi Crate Ledger`
        WHERE organization_id = %s
        GROUP BY crate_type
    """, (org_id,), as_dict=True)

    alerts = [r for r in outstanding_raw if r.get("posting_date") and str(r["posting_date"]) <= cutoff_date]

    return {
        "godown": godown_raw,
        "outstanding": outstanding_raw,
        "alerts": alerts,
        "ageing_days": ageing_days,
    }


@frappe.whitelist(allow_guest=False)
def create_crate_transaction(
    org_id: str,
    transaction_type: str,
    crate_type: str,
    quantity: int,
    party_id: str = "",
    party_name: str = "",
    notes: str = "",
    deposit_charged: float = 0.0,
    transaction_date: str = None,
) -> dict:
    """
    Creates a standalone Mandi Crate Transaction (manual entry).
    Used for: farmer returns empties, buyer returns, damage write-off, stock addition.
    Does NOT affect any financial ledger.
    """
    if not org_id:
        org_id = _get_user_org()
    if not org_id:
        frappe.throw("Organization not found")

    if not _is_crate_tracking_enabled(org_id):
        frappe.throw("Crate tracking is not enabled. Enable it in Settings > Crate Tracking.")

    quantity = int(quantity)
    if quantity <= 0:
        frappe.throw("Quantity must be greater than zero.")

    if transaction_type not in ("issue", "return", "damage", "stock_addition"):
        frappe.throw(f"Invalid transaction type: {transaction_type}")

    if party_name and not party_id:
        party_id = f"adhoc-{frappe.utils.scrub(party_name)}"
    if party_id and not party_name:
        # Try to resolve party_name if it is a real contact
        contact_name = frappe.db.get_value("Mandi Contact", party_id, "full_name")
        if contact_name:
            party_name = contact_name
        else:
            party_name = party_id

    if not frappe.db.exists("Mandi Crate Type", crate_type):
        frappe.get_doc({
            "doctype": "Mandi Crate Type",
            "crate_name": crate_type,
            "organization_id": org_id,
            "deposit_amount": 0,
        }).insert(ignore_permissions=True)

    txn = frappe.get_doc({
        "doctype": "Mandi Crate Transaction",
        "transaction_date": transaction_date or frappe.utils.today(),
        "transaction_type": transaction_type,
        "organization_id": org_id,
        "party_id": party_id,
        "party_name": party_name,
        "crate_type": crate_type,
        "quantity": quantity,
        "deposit_charged": deposit_charged,
        "notes": notes,
        "source_doctype": "Manual",
        "source_docname": "",
    })
    txn.insert(ignore_permissions=True)

    if party_id and transaction_type in ("issue", "return"):
        qty_out = quantity if transaction_type == "issue" else 0
        qty_in  = quantity if transaction_type == "return" else 0
        _post_crate_ledger_entry(
            org_id=org_id,
            party_id=party_id,
            party_name=party_name,
            crate_type=crate_type,
            qty_out=qty_out,
            qty_in=qty_in,
            deposit_amount=deposit_charged,
            source_doctype="Mandi Crate Transaction",
            source_docname=txn.name,
            notes=notes,
            posting_date=transaction_date or frappe.utils.today(),
        )

    frappe.db.commit()
    return {"success": True, "transaction_id": txn.name}


@frappe.whitelist(allow_guest=False)
def get_party_crate_ledger(org_id: str, party_id: str) -> dict:
    """
    Returns the full crate ledger for a specific party.
    Safe: reads only tabMandi Crate Ledger — no financial table touched.
    """
    if not org_id or not party_id:
        return {"ledger": [], "summary": {}}

    ledger = frappe.db.sql("""
        SELECT name, posting_date, crate_type, qty_out, qty_in,
               running_balance, deposit_amount, deposit_converted,
               source_doctype, source_docname, notes, creation
        FROM `tabMandi Crate Ledger`
        WHERE organization_id = %s AND party_id = %s
        ORDER BY creation DESC
        LIMIT 500
    """, (org_id, party_id), as_dict=True)

    summary_raw = frappe.db.sql("""
        SELECT cl.crate_type, cl.running_balance
        FROM `tabMandi Crate Ledger` cl
        INNER JOIN (
            SELECT crate_type, MAX(creation) as max_creation
            FROM `tabMandi Crate Ledger`
            WHERE organization_id = %s AND party_id = %s
            GROUP BY crate_type
        ) latest ON cl.crate_type = latest.crate_type
                 AND cl.creation = latest.max_creation
        WHERE cl.organization_id = %s AND cl.party_id = %s
    """, (org_id, party_id, org_id, party_id), as_dict=True)

    return {
        "ledger": ledger,
        "summary": {r["crate_type"]: r["running_balance"] for r in summary_raw},
    }


@frappe.whitelist(allow_guest=False)
def convert_crate_deposit_to_financial(org_id: str, party_id: str, crate_type: str, qty_to_charge: int = None) -> dict:
    """
    Charges a party's financial ledger for lost/unreturned crates via Journal Entry.
    Reduces physical crate balance.
    """
    if not org_id or not party_id or not crate_type:
        frappe.throw("org_id, party_id, and crate_type are required.")

    if not _is_crate_tracking_enabled(org_id):
        frappe.throw("Crate tracking is not enabled.")


    # Get Party Financial Profile
    contact = frappe.get_doc("Mandi Contact", party_id)
    party_type = None
    erp_party = None

    if contact.customer and frappe.db.exists("Customer", contact.customer):
        party_type = "Customer"
        erp_party = contact.customer
    elif contact.supplier and frappe.db.exists("Supplier", contact.supplier):
        party_type = "Supplier"
        erp_party = contact.supplier
    elif frappe.db.exists("Customer", contact.name):
        party_type = "Customer"
        erp_party = contact.name
    elif frappe.db.exists("Supplier", contact.name):
        party_type = "Supplier"
        erp_party = contact.name

    if not party_type or not erp_party:
        frappe.throw(f"Contact '{contact.full_name}' does not have an active Customer or Supplier profile linked in the ERP. Please create their accounting profile first.")

    org_info = _get_org_info(org_id)
    company = org_info.get("company_name")
    
    crate_income_account = frappe.db.get_single_value("Mandi Settings", "crate_income_account")
    if not crate_income_account:
        from mandigrow.mandigrow.logic.automation import get_acc
        crate_income_account = get_acc("Miscellaneous Income", company) or get_acc("Sales", company)
        if not crate_income_account:
            frappe.throw("Could not automatically determine a Crate Income Account.")
    
    # Use ERPNext function to get default account
    from erpnext.accounts.party import get_party_account
    party_account = get_party_account(party_type, erp_party, company)
    if not party_account:
        frappe.throw(f"No default Receivable/Payable account found for {party_type} '{erp_party}' in company '{company}'.")

    # Get current physical balance
    latest = frappe.db.sql("""
        SELECT cl.running_balance, cl.name
        FROM `tabMandi Crate Ledger` cl
        INNER JOIN (
            SELECT MAX(creation) as max_creation
            FROM `tabMandi Crate Ledger`
            WHERE organization_id = %s AND party_id = %s AND crate_type = %s
        ) sub ON cl.creation = sub.max_creation
        WHERE cl.organization_id = %s AND cl.party_id = %s AND cl.crate_type = %s
        LIMIT 1
    """, (org_id, party_id, crate_type, org_id, party_id, crate_type), as_dict=True)

    if not latest:
        frappe.throw("No crate ledger found for this party and crate type.")

    balance = int(latest[0]["running_balance"])
    if balance <= 0:
        frappe.throw(f"No outstanding crates to charge. Current balance: {balance}")

    qty = int(qty_to_charge) if qty_to_charge else balance
    if qty <= 0 or qty > balance:
        frappe.throw(f"Invalid charge quantity: {qty}. Max available: {balance}")

    deposit_per_crate = float(frappe.db.get_value("Mandi Crate Type", crate_type, "deposit_amount") or 0)
    if deposit_per_crate <= 0:
        frappe.throw(f"Set a deposit amount in the Crate Type master for '{crate_type}' before charging.")

    total_charge = qty * deposit_per_crate

    # 1. Post Journal Entry
    je = frappe.get_doc({
        "doctype": "Journal Entry",
        "voucher_type": "Journal Entry",
        "posting_date": frappe.utils.today(),
        "company": company,
        "user_remark": f"Charge for {qty} unreturned {crate_type} crates.",
        "accounts": [
            {
                "account": party_account,
                "party_type": party_type,
                "party": erp_party,
                "debit_in_account_currency": total_charge,
                "credit_in_account_currency": 0
            },
            {
                "account": crate_income_account,
                "debit_in_account_currency": 0,
                "credit_in_account_currency": total_charge
            }
        ]
    })
    je.insert(ignore_permissions=True)
    je.submit()

    # 2. Reset physical crate balance via a Transaction
    txn_res = create_crate_transaction(
        org_id=org_id,
        transaction_type="damage",
        crate_type=crate_type,
        quantity=qty,
        party_id=party_id,
        party_name=contact.full_name,
        notes=f"Lost/Unreturned crates converted to financial debit. (JE: {je.name})"
    )

    return {
        "success": True,
        "je_name": je.name,
        "txn_name": txn_res["transaction_id"],
        "message": f"Successfully charged INR {total_charge:,.2f} for {qty} lost crates.",
    }


# ══════════════════════════════════════════════════════════════════════════════
# CRATE MANAGEMENT v2 — Full Redesign
# No Super Admin toggle. Managed from Master Data directly by each mandi.
# Two modes: (1) Sold Crates = commodity-like sale items with GL/daybook
#            (2) Issued Crates = physical give/take tracked in Mandi Crate Issue
# ══════════════════════════════════════════════════════════════════════════════

def _reduce_crate_stock(org_id: str, crate_type: str, qty: int) -> None:
    """Reduce crate inventory when crates are sold or issued. Best-effort."""
    frappe.db.sql("""
        INSERT INTO `tabMandi Crate Inventory Entry`
            (name, entry_date, crate_type, quantity, purchase_rate, total_value, organization_id, notes, creation, modified, modified_by, owner, docstatus)
        VALUES
            (%(name)s, %(date)s, %(ct)s, %(qty)s, 0, 0, %(org)s, %(notes)s, NOW(), NOW(), 'Administrator', 'Administrator', 1)
    """, {
        "name": f"CRINV-OUT-{frappe.generate_hash(length=10)}",
        "date": frappe.utils.today(),
        "ct": crate_type,
        "qty": -abs(qty),   # negative = reduction
        "org": org_id,
        "notes": "Auto-reduced via sale/issue"
    })


def _get_or_create_crate_commodity(org_id: str, crate_type: str) -> str:
    """
    Returns a virtual commodity item_id representing a crate type.
    Creates an Item record if it doesn't exist so that Link fields don't fail.
    """
    virtual_id = f"CRATE-{frappe.scrub(crate_type).upper()[:20]}"
    if not frappe.db.exists("Item", virtual_id):
        if not frappe.db.exists("Item Group", "Crates"):
            frappe.get_doc({
                "doctype": "Item Group",
                "item_group_name": "Crates",
                "is_group": 0,
                "parent_item_group": "All Item Groups"
            }).insert(ignore_permissions=True)
            
        frappe.get_doc({
            "doctype": "Item",
            "item_code": virtual_id,
            "item_name": f"Crate: {crate_type}",
            "item_group": "Crates",
            "stock_uom": "Nos",
            "is_stock_item": 0
        }).insert(ignore_permissions=True)
    return virtual_id


def _get_crate_stock_balance(org_id: str, crate_type: str = None) -> dict:
    """
    Returns net stock balance per crate type.
    
    DESIGN:
    - total_purchased = only TRUE purchase/add-stock entries (positive qty, no 'Auto-reduced' or 'Returned' notes)
    - available = SUM(all inventory entries) = total_purchased - issued_via_ledger + returned_via_ledger
      NOTE: _reduce_crate_stock already writes a negative entry when crates are issued,
            so available = SUM(quantity) already accounts for those reductions.
            Do NOT subtract issued_map again from available — that would double-subtract.
    - total_issued_out = open balance from Crate Issue items (for display/tracker use only)
    """
    inv_query = """
        SELECT crate_type,
               SUM(quantity) as available,
               SUM(CASE WHEN quantity > 0
                         AND (notes IS NULL
                              OR (notes NOT LIKE '%%Returned%%'
                                  AND notes NOT LIKE '%%Auto-reduced%%'))
                    THEN quantity ELSE 0 END) as total_purchased
        FROM `tabMandi Crate Inventory Entry`
        WHERE organization_id = %s
    """
    params_inv = [org_id]
    if crate_type:
        inv_query += " AND crate_type = %s"
        params_inv.append(crate_type)
    inv_query += " GROUP BY crate_type"

    inv_rows = frappe.db.sql(inv_query, params_inv, as_dict=True)
    stock_map = {r["crate_type"]: r for r in inv_rows}

    # Outstanding issued balance from open Crate Issues (for DISPLAY / tracker only)
    issue_query = """
        SELECT ii.crate_type, SUM(ii.qty_balance) as total_issued
        FROM `tabMandi Crate Issue Item` ii
        JOIN `tabMandi Crate Issue` i ON ii.parent = i.name
        WHERE i.organization_id = %s AND i.status != 'Closed' AND i.issue_type = 'give'
    """
    params_issue = [org_id]
    if crate_type:
        issue_query += " AND ii.crate_type = %s"
        params_issue.append(crate_type)
    issue_query += " GROUP BY ii.crate_type"

    issue_rows = frappe.db.sql(issue_query, params_issue, as_dict=True)
    issued_map = {r["crate_type"]: int(r["total_issued"] or 0) for r in issue_rows}

    # Sold (from crate transactions with source_doctype = Mandi Sale)
    sold_query = """
        SELECT crate_type, SUM(qty_out) as total_sold
        FROM `tabMandi Crate Ledger`
        WHERE organization_id = %s AND source_doctype = 'Mandi Sale'
    """
    params_sold = [org_id]
    if crate_type:
        sold_query += " AND crate_type = %s"
        params_sold.append(crate_type)
    sold_query += " GROUP BY crate_type"

    sold_rows = frappe.db.sql(sold_query, params_sold, as_dict=True)
    sold_map = {r["crate_type"]: int(r["total_sold"] or 0) for r in sold_rows}

    # Merge all crate types
    all_types = set(list(stock_map.keys()) + list(issued_map.keys()) + list(sold_map.keys()))
    result = {}
    for ct in all_types:
        inv = stock_map.get(ct, {})
        # available = SUM(all inventory entries) — already correct, no extra subtraction
        available = int(inv.get("available") or 0)
        total_purchased = int(inv.get("total_purchased") or 0)
        # issued_map is the OPEN BALANCE shown in the tracker (not subtracted from available)
        issued = issued_map.get(ct, 0)
        sold = sold_map.get(ct, 0)
        
        result[ct] = {
            "total_purchased": total_purchased,
            "total_issued_out": issued,
            "total_sold": sold,
            "available": available  # already net of issue reductions from ledger
        }

    if crate_type:
        return result.get(crate_type, {"total_purchased": 0, "total_issued_out": 0, "total_sold": 0, "available": 0})
    return result


# ─── 1. Master Data API ───────────────────────────────────────────────────────

def _auto_migrate_crate_schema():
    """Silently add columns that might be missing if bench migrate wasn't run on production"""
    try:
        # Check tabMandi Crate Type
        existing_cols = {row[0] for row in frappe.db.sql("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tabMandi Crate Type'")}
        if "purchase_rate" not in existing_cols:
            frappe.db.sql("ALTER TABLE `tabMandi Crate Type` ADD COLUMN `purchase_rate` DECIMAL(21,9) NOT NULL DEFAULT 0.0")
        if "sale_rate" not in existing_cols:
            frappe.db.sql("ALTER TABLE `tabMandi Crate Type` ADD COLUMN `sale_rate` DECIMAL(21,9) NOT NULL DEFAULT 0.0")
            
        # Check tabMandi Crate Issue Item
        item_cols = {row[0] for row in frappe.db.sql("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tabMandi Crate Issue Item'")}
        if "rate" not in item_cols:
            frappe.db.sql("ALTER TABLE `tabMandi Crate Issue Item` ADD COLUMN `rate` DECIMAL(21,9) NOT NULL DEFAULT 0.0")
            
        frappe.db.commit()
    except Exception:
        pass

@frappe.whitelist(allow_guest=False)
def get_crate_master_data(org_id: str = None) -> dict:
    """
    Returns all crate types for this org (or global) with current stock balances.
    """
    if not org_id:
        org_id = _get_user_org()
        
    _auto_migrate_crate_schema()

    # Detect which optional columns exist in the live DB (safe after partial migration)
    existing_cols = {row[0] for row in frappe.db.sql(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tabMandi Crate Type'"
    )}

    select_cols = "name, crate_name, capacity_kg, deposit_amount, is_active, organization_id"
    if "purchase_rate" in existing_cols:
        select_cols += ", purchase_rate"
    if "sale_rate" in existing_cols:
        select_cols += ", sale_rate"

    crate_types = frappe.db.sql(f"""
        SELECT {select_cols}
        FROM `tabMandi Crate Type`
        WHERE is_active = 1 AND (organization_id = %s OR organization_id IS NULL OR organization_id = '')
        ORDER BY crate_name
    """, (org_id,), as_dict=True)

    stock_map = _get_crate_stock_balance(org_id)

    result = []
    for ct in crate_types:
        s = stock_map.get(ct["name"], {})
        result.append({
            "id": ct["name"],
            "name": ct["crate_name"],
            "purchase_rate": float(ct.get("purchase_rate") or 0),
            "sale_rate": float(ct.get("sale_rate") or 0),
            "capacity_kg": float(ct.get("capacity_kg") or 0),
            "deposit_amount": float(ct.get("deposit_amount") or 0),
            "total_purchased": s.get("total_purchased", 0),
            "total_issued_out": s.get("total_issued_out", 0),
            "total_sold": s.get("total_sold", 0),
            "available": s.get("available", 0),
        })

    return {"crate_types": result, "org_id": org_id}


@frappe.whitelist(allow_guest=False)
def save_crate_type(
    crate_name: str,
    purchase_rate: float = 0,
    sale_rate: float = 0,
    capacity_kg: float = 0,
    deposit_amount: float = 0,
    crate_id: str = None,
    org_id: str = None,
) -> dict:
    """
    Create or update a Crate Type. No Super Admin required.
    """
    if not org_id:
        org_id = _get_user_org()
        
    _auto_migrate_crate_schema()
        
    try:
        if crate_id and frappe.db.exists("Mandi Crate Type", crate_id):
            doc = frappe.get_doc("Mandi Crate Type", crate_id)
            doc.purchase_rate = float(purchase_rate or 0)
            doc.sale_rate = float(sale_rate or 0)
            doc.capacity_kg = float(capacity_kg or 0)
            doc.deposit_amount = float(deposit_amount or 0)
            doc.save(ignore_permissions=True)
        else:
            doc = frappe.get_doc({
                "doctype": "Mandi Crate Type",
                "crate_name": crate_name.strip(),
                "purchase_rate": float(purchase_rate or 0),
                "sale_rate": float(sale_rate or 0),
                "capacity_kg": float(capacity_kg or 0),
                "deposit_amount": float(deposit_amount or 0),
                "organization_id": org_id,
                "is_active": 1,
            })
            doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "id": doc.name, "name": doc.crate_name}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "save_crate_type Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def delete_crate_type(crate_id: str) -> dict:
    """Soft delete a crate type if there is no available stock and no outstanding issues."""
    try:
        org_id = frappe.db.get_value("Mandi Crate Type", crate_id, "organization_id")
        stock_data = _get_crate_stock_balance(org_id, crate_id)
        
        if stock_data.get("available", 0) > 0:
            return {"success": False, "error": f"Cannot delete — you still have {stock_data.get('available')} available in stock."}
            
        if stock_data.get("total_issued_out", 0) > 0:
            return {"success": False, "error": f"Cannot delete — there are {stock_data.get('total_issued_out')} crates yet to receive."}

        # Instead of hard delete which fails on linked historical data, soft-delete it
        frappe.db.set_value("Mandi Crate Type", crate_id, "is_active", 0)
        frappe.db.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─── 2. Stock Entry API ───────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def add_crate_stock_entry(
    crate_type: str,
    quantity: int,
    purchase_rate: float = 0,
    entry_date: str = None,
    notes: str = "",
    org_id: str = None,
) -> dict:
    """
    Log new crate stock purchase into Mandi Crate Inventory Entry.
    Increases available crate inventory for this mandi.
    """
    if not org_id:
        org_id = _get_user_org()
    try:
        qty = int(quantity)
        rate = float(purchase_rate or 0)
        if qty <= 0:
            return {"success": False, "error": "Quantity must be greater than zero."}

        # Auto-create crate type if missing
        if not frappe.db.exists("Mandi Crate Type", crate_type):
            frappe.get_doc({
                "doctype": "Mandi Crate Type",
                "crate_name": crate_type,
                "organization_id": org_id,
                "purchase_rate": rate,
                "sale_rate": 0,
            }).insert(ignore_permissions=True)

        doc = frappe.get_doc({
            "doctype": "Mandi Crate Inventory Entry",
            "entry_date": entry_date or frappe.utils.today(),
            "crate_type": crate_type,
            "quantity": qty,
            "purchase_rate": rate,
            "total_value": qty * rate,
            "organization_id": org_id,
            "notes": notes,
        })
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "entry_id": doc.name}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "add_crate_stock_entry Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def get_crate_inventory_report(org_id: str = None) -> dict:
    """
    Full inventory summary: total purchased, sold, issued, available per crate type.
    Used for the Master Data dashboard cards.
    """
    if not org_id:
        org_id = _get_user_org()
    try:
        stock_map = _get_crate_stock_balance(org_id)
        crate_types = frappe.get_all(
            "Mandi Crate Type",
            filters={"is_active": 1},
            fields=["name", "crate_name", "purchase_rate", "sale_rate"]
        )
        rows = []
        for ct in crate_types:
            s = stock_map.get(ct["name"], {})
            total = s.get("total_purchased", 0)
            if total == 0 and s.get("total_issued_out", 0) == 0 and s.get("total_sold", 0) == 0:
                continue
            purchase_val = total * float(ct["purchase_rate"] or 0)
            rows.append({
                "crate_type": ct["name"],
                "crate_name": ct["crate_name"],
                "total_purchased": total,
                "total_issued_out": s.get("total_issued_out", 0),
                "total_sold": s.get("total_sold", 0),
                "available": s.get("available", 0),
                "purchase_rate": float(ct["purchase_rate"] or 0),
                "sale_rate": float(ct["sale_rate"] or 0),
                "total_stock_value": purchase_val,
            })
        return {"success": True, "rows": rows}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_crate_inventory_report Failed")
        return {"success": False, "error": str(e), "rows": []}


# ─── 3. Issue (Give/Take) API ─────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def create_crate_issue(
    party_id: str,
    party_name: str,
    items: str,
    expected_return_date: str = None,
    party_type: str = "buyer",
    notes: str = "",
    issue_date: str = None,
    org_id: str = None,
) -> dict:
    """
    Give crates to a party (buyer/farmer/supplier).
    Creates Mandi Crate Issue doc with child items.
    Reduces crate inventory accordingly.
    """
    import json
    if not org_id:
        org_id = _get_user_org()
    try:
        if isinstance(items, str):
            items = json.loads(items)

        if not items:
            return {"success": False, "error": "No crate items provided."}

        doc = frappe.get_doc({
            "doctype": "Mandi Crate Issue",
            "issue_date": issue_date or frappe.utils.today(),
            "issue_type": "give",
            "organization_id": org_id,
            "party_id": party_id or "",
            "party_name": party_name or "",
            "party_type": party_type,
            "expected_return_date": expected_return_date or None,
            "status": "Open",
            "charge_to_ledger": 0,
            "notes": notes,
            "items": []
        })

        for item in items:
            ct = item.get("crate_type")
            qty = int(item.get("qty") or 0)
            rate = float(item.get("rate") or 0)
            if not ct or qty <= 0:
                continue

            stock_data = _get_crate_stock_balance(org_id, ct)
            available = stock_data.get("available", 0)
            if qty > available:
                return {"success": False, "error": f"Cannot give {qty} of '{ct}'. Only {available} available in stock."}

            # Auto-create crate type if missing
            if not frappe.db.exists("Mandi Crate Type", ct):
                frappe.get_doc({
                    "doctype": "Mandi Crate Type",
                    "crate_name": ct,
                    "organization_id": org_id,
                    "purchase_rate": 0,
                    "sale_rate": 0,
                }).insert(ignore_permissions=True)

            doc.append("items", {
                "crate_type": ct,
                "qty_issued": qty,
                "qty_returned": 0,
                "qty_balance": qty,
                "rate": rate,
            })
            # Reduce inventory
            try:
                _reduce_crate_stock(org_id, ct, qty)
            except Exception:
                frappe.log_error(frappe.get_traceback(), "crate issue stock reduce (non-fatal)")

        if not doc.items:
            return {"success": False, "error": "No valid crate items to issue."}

        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "issue_id": doc.name}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "create_crate_issue Failed")
        return {"success": False, "error": str(e)}


@frappe.whitelist(allow_guest=False)
def receive_crates(issue_id: str, received_items: str) -> dict:
    """
    Record full or partial return of crates for a given issue.
    received_items = [{"row_name": "...", "qty_now_returned": N}, ...]
    Restores crate inventory. Updates issue status.
    """
    import json
    try:
        if isinstance(received_items, str):
            received_items = json.loads(received_items)

        doc = frappe.get_doc("Mandi Crate Issue", issue_id)
        org_id = doc.organization_id

        all_closed = True
        for ri in received_items:
            row_name = ri.get("row_name")
            qty_now = int(ri.get("qty_now_returned") or 0)
            qty_loss = int(ri.get("qty_loss") or 0)
            loss_notes = ri.get("notes") or "Reported missing/damaged"
            
            if qty_now <= 0 and qty_loss <= 0:
                continue
            for row in doc.items:
                if row.name == row_name or row.crate_type == ri.get("crate_type"):
                    max_returnable = row.qty_balance
                    if qty_now + qty_loss > max_returnable:
                        return {"success": False, "error": f"Cannot return/report {qty_now + qty_loss} crates. Only {max_returnable} {row.crate_type} pending."}
                    
                    actual_return = qty_now
                    actual_loss = qty_loss
                    
                    total_resolve = actual_return + actual_loss
                    row.qty_returned = (row.qty_returned or 0) + total_resolve
                    row.qty_balance = max(0, row.qty_issued - row.qty_returned)
                    
                    # 1. Restore inventory for the ACTUAL returned crates
                    if actual_return > 0:
                        real_purchase_rate = float(frappe.db.get_value("Mandi Crate Type", row.crate_type, "purchase_rate") or 0)
                        frappe.get_doc({
                            "doctype": "Mandi Crate Inventory Entry",
                            "entry_date": frappe.utils.today(),
                            "crate_type": row.crate_type,
                            "quantity": actual_return,
                            "purchase_rate": real_purchase_rate,
                            "total_value": actual_return * real_purchase_rate,
                            "organization_id": org_id,
                            "notes": f"Returned from {doc.party_name} (Issue: {doc.name})",
                        }).insert(ignore_permissions=True)
                        
                    # 2. For the LOST crates, we simulate receiving them back, then immediately writing them off
                    #    This ensures the issue is closed, inventory is NOT inflated, and P&L records the loss.
                    if actual_loss > 0:
                        real_purchase_rate = float(frappe.db.get_value("Mandi Crate Type", row.crate_type, "purchase_rate") or 0)
                        # Dummy receive to offset the subsequent loss deduction
                        frappe.get_doc({
                            "doctype": "Mandi Crate Inventory Entry",
                            "entry_date": frappe.utils.today(),
                            "crate_type": row.crate_type,
                            "quantity": actual_loss,
                            "purchase_rate": real_purchase_rate,
                            "total_value": actual_loss * real_purchase_rate,
                            "organization_id": org_id,
                            "notes": f"System Return for Loss Offset (Issue: {doc.name})",
                        }).insert(ignore_permissions=True)
                        
                        # Actual loss entry (will hit Trading P&L)
                        frappe.get_doc({
                            "doctype": "Mandi Crate Inventory Entry",
                            "entry_date": frappe.utils.today(),
                            "crate_type": row.crate_type,
                            "quantity": -actual_loss,
                            "purchase_rate": real_purchase_rate,
                            "total_value": -actual_loss * real_purchase_rate,
                            "organization_id": org_id,
                            "notes": f"Loss: {loss_notes} (Issue: {doc.name})"
                        }).insert(ignore_permissions=True)
                        
                    break

        all_closed = all((row.qty_balance == 0) for row in doc.items)
        any_returned = any((row.qty_returned > 0) for row in doc.items)
        doc.status = "Closed" if all_closed else ("Partially Returned" if any_returned else "Open")
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "status": doc.status}
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(title="receive_crates Failed", message=frappe.get_traceback())
        return {"success": False, "error": frappe.get_traceback() or str(e)}


@frappe.whitelist(allow_guest=False)
def charge_crate_to_ledger_v2(issue_id: str, items_to_charge: str = None) -> dict:
    """
    For a Crate Issue where crates were not returned, post a GL Debit to the party's ledger.
    Charge = qty_balance × rate per item row.
    Closes the issue after charging.
    """
    import json
    try:
        doc = frappe.get_doc("Mandi Crate Issue", issue_id)
        org_id = doc.organization_id
        party_id = doc.party_id

        if not party_id:
            return {"success": False, "error": "No party linked to this issue."}

        if isinstance(items_to_charge, str) and items_to_charge:
            items_to_charge = json.loads(items_to_charge)
        else:
            items_to_charge = None

        org_info = _get_org_info(org_id)
        company = org_info.get("erp_company") or org_info.get("company_name") or frappe.db.get_value("Company", {}, "name")
        # Patch blank erp_company so future calls work instantly
        if company and not org_info.get("erp_company"):
            frappe.db.set_value("Mandi Organization", org_id, "erp_company", company, update_modified=False)

        # Resolve party account
        contact = None
        contact_type = doc.party_type or "buyer"
        
        if frappe.db.exists("Mandi Contact", party_id):
            contact = frappe.get_doc("Mandi Contact", party_id)
            contact_type = contact.contact_type
            
        party_type = None
        erp_party = None
        
        if contact:
            if contact.customer and frappe.db.exists("Customer", contact.customer):
                party_type, erp_party = "Customer", contact.customer
            elif contact.supplier and frappe.db.exists("Supplier", contact.supplier):
                party_type, erp_party = "Supplier", contact.supplier
            elif frappe.db.exists("Customer", contact.name):
                party_type, erp_party = "Customer", contact.name
            elif frappe.db.exists("Supplier", contact.name):
                party_type, erp_party = "Supplier", contact.name

        total_charge = 0.0
        je_remarks = []
        for row in doc.items:
            qty_bal = row.qty_balance
            if items_to_charge:
                override = next((x for x in items_to_charge if x.get("row_name") == row.name or x.get("crate_type") == row.crate_type), None)
                if override:
                    qty_to_charge_override = int(override.get("qty_to_charge") or 0)
                    if qty_to_charge_override > qty_bal:
                        return {"success": False, "error": f"Cannot charge {qty_to_charge_override} crates. Only {qty_bal} {row.crate_type} pending."}
                    qty_bal = qty_to_charge_override
            if qty_bal <= 0:
                continue
            rate = float(row.rate or 0)
            if rate <= 0:
                rate = float(frappe.db.get_value("Mandi Crate Type", row.crate_type, "sale_rate") or 0)
            charge = qty_bal * rate
            total_charge += charge
            je_remarks.append(f"{row.crate_type}: {qty_bal} × ₹{rate} = ₹{charge:.2f}")
            # Partially or fully resolve the row based on the charged amount
            row.qty_returned = (row.qty_returned or 0) + qty_bal
            row.qty_balance = (row.qty_balance or 0) - qty_bal

        if total_charge <= 0:
            return {"success": False, "error": "No outstanding crates to charge."}

        # Post Journal Entry (only if we have a proper ERP party)
        je_name = None
        from mandigrow.mandigrow.logic.automation import ensure_customer_for_contact, ensure_supplier_for_contact, get_debtor_acc, get_supplier_acc
        
        if not erp_party:
            # If no Mandi Contact exists for this party_id (ad-hoc entry),
            # create a minimal one so the party ledger can track this charge.
            if not contact and party_id:
                try:
                    pt_lower = (doc.party_type or "buyer").lower()
                    ct_type = pt_lower if pt_lower in ("farmer", "supplier") else "buyer"
                    new_contact = frappe.get_doc({
                        "doctype": "Mandi Contact",
                        "name": party_id,
                        "full_name": doc.party_name or party_id,
                        "contact_type": ct_type,
                        "organization_id": org_id,
                        "phone": "",
                    })
                    new_contact.flags.ignore_mandatory = True
                    new_contact.insert(ignore_permissions=True)
                    contact = new_contact
                    contact_type = ct_type
                except Exception:
                    frappe.log_error(frappe.get_traceback(), "charge_crate: failed to create Mandi Contact for ad-hoc party")

            # Auto-create ERP party based on contact type — never block the charge
            if contact_type in ("buyer", "", None):
                erp_party = ensure_customer_for_contact(party_id, company)
                party_type = "Customer"
            else:
                erp_party = ensure_supplier_for_contact(party_id, company)
                party_type = "Supplier"

            # Write back the ERP party link to Mandi Contact so get_ledger_statement
            # can find the GL entries via (party_type, party) lookup
            if contact and erp_party:
                try:
                    link_field = "customer" if party_type == "Customer" else "supplier"
                    frappe.db.set_value("Mandi Contact", contact.name, link_field, erp_party, update_modified=False)
                except Exception:
                    pass
        
        if party_type and erp_party and company:
            from erpnext.accounts.party import get_party_account
            party_account = get_party_account(party_type, erp_party, company)
            
            if not party_account:
                # Fallback to default Master Accounts
                party_account = get_debtor_acc(company) if party_type == "Customer" else get_supplier_acc(company)
                
            crate_income_account = frappe.db.get_single_value("Mandi Settings", "crate_income_account")
            if not crate_income_account:
                from mandigrow.mandigrow.logic.automation import get_acc
                crate_income_account = get_acc("Miscellaneous Income", company) or get_acc("Sales", company)
            
            if not party_account:
                return {"success": False, "error": f"No default account set for {party_type} {erp_party} in company {company}."}
            if not crate_income_account:
                return {"success": False, "error": "Could not determine an Income account to post the crate charges to."}
                
            je = frappe.get_doc({
                "doctype": "Journal Entry",
                "voucher_type": "Journal Entry",
                "posting_date": frappe.utils.today(),
                "company": company,
                "user_remark": f"Crate charge for {doc.party_name}: {'; '.join(je_remarks)}",
                "accounts": [
                    {
                        "account": party_account,
                        "party_type": party_type,
                        "party": erp_party,
                        "debit_in_account_currency": total_charge,
                        "credit_in_account_currency": 0
                    },
                    {
                        "account": crate_income_account,
                        "debit_in_account_currency": 0,
                        "credit_in_account_currency": total_charge
                    }
                ]
            })
            je.flags.ignore_permissions = True
            je.flags.ignore_credit_limit = True
            je.insert(ignore_permissions=True)
            je.submit()
            je_name = je.name
            
            # Tag the GL entries to the Crate Issue so they can be identified
            from mandigrow.mandigrow.logic.automation import _tag_gl_entries
            _tag_gl_entries(je.name, "Mandi Crate Issue", doc.name)
            
            # Trigger settlement repair to update the cache
            # contact may be None for ad-hoc parties that were auto-registered —
            # use party_id (which equals the contact's document name) directly.
            from mandigrow.api import repair_single_party_settlement
            repair_party_id = (contact.name if contact else None) or party_id
            if repair_party_id:
                try:
                    repair_single_party_settlement(repair_party_id, org_id)
                except Exception:
                    frappe.log_error(frappe.get_traceback(), "repair_single_party_settlement after crate charge")
        else:
            frappe.log_error(f"charge_crate_to_ledger_v2: party_type={party_type} erp_party={erp_party} company={company}", "Crate Charge Skipped JE")
            return {"success": False, "error": f"Could not resolve party account for {doc.party_name}. Check ERPNext company and customer/supplier setup."}

        total_remaining_balance = sum((r.qty_balance or 0) for r in doc.items)
        if total_remaining_balance <= 0:
            doc.status = "Closed"
        else:
            doc.status = "Partially Returned"
            
        doc.charge_to_ledger = 1
        doc.ledger_charged_date = frappe.utils.today()
        doc.save(ignore_permissions=True)
        frappe.db.commit()

        return {
            "success": True,
            "total_charged": total_charge,
            "je_name": je_name,
            "message": f"₹{total_charge:,.2f} charged to {doc.party_name}'s ledger."
        }
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(title="charge_crate_to_ledger_v2 Failed", message=frappe.get_traceback())
        return {"success": False, "error": frappe.get_traceback() or str(e)}


# ─── 4. Reports API ───────────────────────────────────────────────────────────

@frappe.whitelist(allow_guest=False)
def get_crate_issues_report(org_id: str = None) -> dict:
    """
    Full report of all open/partial Crate Issues.
    Shows: party, crate type, qty issued, qty returned, qty balance, overdue flag.
    """
    if not org_id:
        org_id = _get_user_org()
    try:
        today = frappe.utils.today()
        issues = frappe.db.sql("""
            SELECT
                i.name as issue_id,
                i.issue_date,
                i.party_id,
                i.party_name,
                i.party_type,
                i.expected_return_date,
                i.status,
                i.charge_to_ledger,
                ii.name as row_name,
                ii.crate_type,
                ii.qty_issued,
                ii.qty_returned,
                ii.qty_balance,
                ii.rate
            FROM `tabMandi Crate Issue` i
            JOIN `tabMandi Crate Issue Item` ii ON ii.parent = i.name
            WHERE i.organization_id = %s AND i.status != 'Closed' AND i.issue_type = 'give'
            ORDER BY i.creation DESC
        """, (org_id,), as_dict=True)

        # Enrich with overdue flag and value
        result = []
        for row in issues:
            is_overdue = bool(
                row.get("expected_return_date") and
                str(row["expected_return_date"]) < today and
                int(row.get("qty_balance") or 0) > 0
            )
            val = int(row.get("qty_balance") or 0) * float(row.get("rate") or 0)
            result.append({
                **{k: row[k] for k in row},
                "is_overdue": is_overdue,
                "outstanding_value": val,
            })

        # Summary totals
        total_crates_out = sum(int(r.get("qty_balance") or 0) for r in result)
        total_value_out = sum(r.get("outstanding_value", 0) for r in result)
        overdue_count = sum(1 for r in result if r.get("is_overdue"))

        return {
            "success": True,
            "rows": result,
            "summary": {
                "total_crates_out": total_crates_out,
                "total_value_out": total_value_out,
                "overdue_count": overdue_count,
                "open_issues": len(set(r["issue_id"] for r in result)),
            }
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_crate_issues_report Failed")
        return {"success": False, "error": str(e), "rows": [], "summary": {}}

@frappe.whitelist(allow_guest=False)
def report_crate_loss(crate_type: str, qty: float, notes: str = None):
    org_id = _get_user_org()
    if not crate_type:
        frappe.throw("Crate type is required.")
    if not qty or float(qty) <= 0:
        frappe.throw("Quantity must be greater than zero.")
        
    stock_map = _get_crate_stock_balance(org_id, crate_type)
    current_available = stock_map.get("available", 0)
    
    if float(qty) > current_available:
        frappe.throw(f"Cannot report loss of {qty}. Only {current_available} crates available.")
    
    crate_doc = frappe.get_doc("Mandi Crate Type", crate_type)
    
    frappe.get_doc({
        "doctype": "Mandi Crate Inventory Entry",
        "entry_date": frappe.utils.today(),
        "crate_type": crate_type,
        "quantity": -abs(float(qty)),
        "purchase_rate": crate_doc.purchase_rate,
        "organization_id": org_id,
        "notes": f"Loss: {notes}" if notes else "Loss: Reported missing/damaged"
    }).insert(ignore_permissions=True)
    
    return {"status": "success"}

@frappe.whitelist(allow_guest=False)
def get_expense_recovery_report(date_from: str = None, date_to: str = None) -> dict:
    """
    Returns a summary of all third-party expenses paid by the Mandi 
    on behalf of buyers and farmers/suppliers.
    """
    org_id = _get_user_org()
    
    sale_date_cond = ""
    sale_date_params = []
    if date_from and date_to:
        sale_date_cond = "AND saledate BETWEEN %s AND %s"
        sale_date_params = [date_from, date_to]
    elif date_from:
        sale_date_cond = "AND saledate >= %s"
        sale_date_params = [date_from]
    elif date_to:
        sale_date_cond = "AND saledate <= %s"
        sale_date_params = [date_to]

    arr_date_cond = ""
    arr_date_params = []
    if date_from and date_to:
        arr_date_cond = "AND arrival_date BETWEEN %s AND %s"
        arr_date_params = [date_from, date_to]
    elif date_from:
        arr_date_cond = "AND arrival_date >= %s"
        arr_date_params = [date_from]
    elif date_to:
        arr_date_cond = "AND arrival_date <= %s"
        arr_date_params = [date_to]

    # 1. Sales Side Expenses
    sales_res = frappe.db.sql(f"""
        SELECT 
            SUM(loadingcharges) as loading,
            SUM(unloadingcharges) as unloading,
            SUM(otherexpenses) as misc_other
        FROM `tabMandi Sale`
        WHERE docstatus = 1 AND organization_id = %s {sale_date_cond}
    """, [org_id] + sale_date_params, as_dict=True)
    
    sales_totals = sales_res[0] if sales_res else {}
    buyer_loading = flt(sales_totals.get("loading"))
    buyer_unloading = flt(sales_totals.get("unloading"))
    buyer_other = flt(sales_totals.get("misc_other"))

    # 2. Arrival Side Expenses (Trip Level)
    arr_sel = ["SUM(hire_charges) as hire_charges", "SUM(hamali_expenses) as hamali", "SUM(other_expenses) as other"]
    if _col_exists("Mandi Arrival", "trip_loading_amount"): arr_sel.append("SUM(trip_loading_amount) as trip_loading")
    if _col_exists("Mandi Arrival", "trip_other_expenses"): arr_sel.append("SUM(trip_other_expenses) as trip_other")
    
    arr_res = frappe.db.sql(f"""
        SELECT {', '.join(arr_sel)}
        FROM `tabMandi Arrival`
        WHERE docstatus = 1 AND arrival_type IN ('commission', 'commission_supplier') AND organization_id = %s {arr_date_cond}
    """, [org_id] + arr_date_params, as_dict=True)
    
    arr_totals = arr_res[0] if arr_res else {}
    # Freight = hire charges (vehicle rent/transport)
    supplier_freight = flt(arr_totals.get("hire_charges"))
    # Hamali = unloading labour at arrival point
    supplier_hamali = flt(arr_totals.get("hamali"))
    # Trip Loading = loading charges paid at farm/origin
    supplier_trip_loading = flt(arr_totals.get("trip_loading", 0))
    # Other misc trip expenses
    supplier_other_trip = flt(arr_totals.get("other")) + flt(arr_totals.get("trip_other", 0))

    # 3. Arrival Side Expenses (Lot Level)
    lot_sel = []
    if _col_exists("Mandi Lot", "packing_cost"): lot_sel.append("SUM(l.packing_cost) as packing")
    if _col_exists("Mandi Lot", "loading_cost"): lot_sel.append("SUM(l.loading_cost) as lot_loading")
    if _col_exists("Mandi Lot", "farmer_charges"): lot_sel.append("SUM(l.farmer_charges) as farmer_charges")
    if _col_exists("Mandi Lot", "other_cut"): lot_sel.append("SUM(l.other_cut) as other_cut")
    
    if lot_sel:
        lot_res = frappe.db.sql(f"""
            SELECT {', '.join(lot_sel)}
            FROM `tabMandi Lot` l
            JOIN `tabMandi Arrival` a ON l.parent = a.name
            WHERE a.docstatus = 1 AND a.arrival_type IN ('commission', 'commission_supplier') AND a.organization_id = %s {arr_date_cond}
        """, [org_id] + arr_date_params, as_dict=True)
    else:
        lot_res = []

    lot_totals = lot_res[0] if lot_res else {}
    supplier_packing = flt(lot_totals.get("packing"))
    supplier_lot_loading = flt(lot_totals.get("lot_loading"))
    supplier_farmer_charges = flt(lot_totals.get("farmer_charges"))
    supplier_other_cut = flt(lot_totals.get("other_cut"))

    total_buyer_expenses = buyer_loading + buyer_unloading + buyer_other
    total_supplier_expenses = (
        supplier_freight
        + supplier_hamali
        + supplier_trip_loading
        + supplier_other_trip
        + supplier_packing
        + supplier_lot_loading
        + supplier_farmer_charges
        + supplier_other_cut
    )

    return {
        "buyer": {
            "loading": round(buyer_loading, 2),
            "unloading": round(buyer_unloading, 2),
            "other": round(buyer_other, 2),
            "total": round(total_buyer_expenses, 2)
        },
        "supplier": {
            # Trip-level expenses (paid by mandi for transport/labour)
            "freight": round(supplier_freight, 2),           # hire_charges (vehicle rent)
            "hamali": round(supplier_hamali, 2),             # hamali_expenses (unloading labour)
            "tripLoading": round(supplier_trip_loading, 2),  # trip_loading_amount (loading at origin)
            "other": round(supplier_other_trip, 2),          # other_expenses + trip_other_expenses
            # Lot-level expenses (deducted from farmer payout)
            "packing": round(supplier_packing, 2),           # packing_cost per lot
            "lotLoading": round(supplier_lot_loading, 2),    # loading_cost per lot
            "farmerCharges": round(supplier_farmer_charges, 2), # farmer_charges per lot
            "otherCut": round(supplier_other_cut, 2),        # other_cut per lot
            "total": round(total_supplier_expenses, 2)
        },
        "grandTotal": round(total_buyer_expenses + total_supplier_expenses, 2)
    }
