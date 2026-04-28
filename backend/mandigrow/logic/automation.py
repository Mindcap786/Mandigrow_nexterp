"""
MandiGrow — Automation Engine
==============================
on_submit hooks for Mandi Arrival and Mandi Sale.

Architecture decision: We use **Journal Entry only** (no Sales Invoice /
Purchase Receipt) to avoid the chain of ERPNext master-data requirements:
  Cost Center → Warehouse → Territory → Tax Templates → etc.

All ledger postings are double-entry Journal Entries that satisfy accounting
requirements without triggering ERPNext's full document-validation chain.

Purchase Receipt for stock is created separately and wrapped in try/except
so a warehouse misconfiguration does NOT roll back the financial entry.
"""

import frappe
from frappe.utils import flt, add_days, getdate, today

from mandigrow.logic.erp_bootstrap import (
    ensure_company_party_defaults,
    ensure_customer_for_contact,
    ensure_supplier_for_contact,
    get_default_company,
    get_default_warehouse,
    ensure_item,
    resolve_uom,
)


# ── Cost Center helper ─────────────────────────────────────────────────────────

def _get_cost_center(company):
    """Return a valid cost center for the company, creating one if needed."""
    cc = frappe.db.get_value(
        "Cost Center",
        {"company": company, "is_group": 0},
        "name",
    )
    if cc:
        return cc

    # Seed a default cost center
    cc_name = f"Main - {company}"
    try:
        frappe.get_doc({
            "doctype": "Cost Center",
            "cost_center_name": "Main",
            "company": company,
            "is_group": 0,
        }).insert(ignore_permissions=True)
        return cc_name
    except Exception:
        return None


# ── Account resolvers ──────────────────────────────────────────────────────────

_ACCOUNT_TYPE_MAP = {
    "Cash":             "Cash",
    "Bank Account":     "Bank",
    "Stock In Hand":    "Stock",
    "Debtors":          "Receivable",
    "Creditors":        "Payable",
    "Commission Income": None,   # resolved by name only
}


def _company_abbr(company):
    return frappe.db.get_value("Company", company, "abbr") or company


def get_acc(base_name, company=None):
    """Resolve an account name by trying abbreviation, full name, then account_type."""
    company = company or get_default_company()
    abbr    = _company_abbr(company)

    for candidate in (f"{base_name} - {abbr}", f"{base_name} - {company}"):
        if frappe.db.exists("Account", candidate):
            return candidate

    account_type = _ACCOUNT_TYPE_MAP.get(base_name)
    if account_type:
        found = frappe.db.get_value(
            "Account",
            {"company": company, "account_type": account_type, "is_group": 0},
            "name",
        )
        if found:
            return found

    return f"{base_name} - {company}"   # last-resort; will surface a clear error


def get_cash_acc(company=None):       return get_acc("Cash", company)
def get_farmer_acc(company=None):     return get_acc("Creditors", company)
def get_supplier_acc(company=None):   return get_acc("Creditors", company)
def get_debtor_acc(company=None):     return get_acc("Debtors", company)
def get_comm_acc(company=None):       return get_acc("Commission Income", company)
def get_stock_acc(company=None):      return get_acc("Stock In Hand", company)
def get_expense_acc(company=None):    return get_acc("Commission Income", company)


# ── Utilities ──────────────────────────────────────────────────────────────────

def _flt(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def _party_name(contact_id):
    """Safely return the display name of a Mandi Contact."""
    if not contact_id:
        return "Unknown"
    val = frappe.db.get_value("Mandi Contact", contact_id, "full_name")
    return str(val or contact_id)


def _arrival_status(advance, net_payable, mode=None, is_cleared=True):
    """Compute Paid / Partial / Pending for a purchase (Arrival)."""
    # If it's a post-dated cheque, we treat it as udhaar (pending) for now
    if not is_cleared:
        advance = 0.0

    if net_payable > 0 and advance >= net_payable:
        return "Paid"
    if advance > 0:
        return "Partial"
    return "Pending"


def _sale_status(paid, total, due_date_str, mode=None, is_cleared=True):
    """Compute Paid / Partial / Pending / Overdue for a sale."""
    # If it's a post-dated cheque, we treat it as udhaar (pending) for now
    if not is_cleared:
        paid = 0.0

    if total > 0 and paid >= total:
        return "Paid"
    if paid > 0:
        status = "Partial"
    else:
        status = "Pending"
    if status != "Paid" and due_date_str and getdate(due_date_str) < getdate(today()):
        return "Overdue"
    return status


# ── Arrival Ledger (on_submit) ─────────────────────────────────────────────────

def _resolve_pay_account(company, mode, specific_account_id=None):
    """Return the cash/bank account to debit/credit for a given payment mode."""
    if specific_account_id and frappe.db.exists("Account", specific_account_id):
        return specific_account_id
        
    mode = (mode or "").strip().lower()
    if mode in ("cash",):
        return get_cash_acc(company)
    if mode in ("upi", "upi_bank", "bank", "bank_transfer", "neft", "rtgs", "imps", "cheque"):
        # If we have multiple banks, get_acc might be ambiguous, 
        # but for legacy data or missing selection, it's better than nothing.
        return get_acc("Bank Account", company)
    return get_cash_acc(company)


def _is_cheque_cleared(mode, cheque_date, force_clear=False):
    """
    Cheque rule: Only cleared if force_clear is True.
    If force_clear is False, it's considered 'Clear Later' (Pending).
    If it's not a cheque, it's always cleared (Cash/Bank/UPI).
    """
    if (mode or "").strip().lower() != "cheque":
        return True
    
    # If the user explicitly clicked "Cleared Instantly", it's cleared.
    if force_clear:
        return True
        
    # If not forced, it is NOT cleared (Pending), even if the date is today or past.
    # This ensures "Clear Later" always puts the bill in Pending status.
    return False


def post_arrival_ledger(doc, method=None):
    """
    Create Journal Entries for a Mandi Arrival on submit.

    The ledger is split into TWO vouchers so the day-book and party ledger
    can render goods receipt and payment independently:

      1. Goods JE        — Stock Dr / Creditor Cr (+ Commission Cr if applicable).
                           Creditor leg is tagged against_voucher=Mandi Arrival
                           so payments can be matched back to this arrival.

      2. Advance Payment JE (only if advance > 0 and mode != credit) —
                           Creditor Dr / Cash|Bank Cr. Both legs tagged
                           against_voucher=Mandi Arrival. For cheque mode,
                           cheque_no/cheque_date are set on the JE; the JE is
                           posted on the cheque date and only marked
                           clearance_date if the cheque is not post-dated.

    Arrival types:
      commission          — Farmer sends goods; Mandi earns commission from sale
      commission_supplier — Mandi sources goods from supplier on commission
      direct              — Direct purchase; no commission calculation
    """
    company      = get_default_company()
    party_name   = _party_name(doc.party_id)
    arrival_type = (doc.arrival_type or "direct").strip()

    total_realized   = _flt(doc.total_realized)
    total_commission = _flt(doc.total_commission)
    net_payable      = _flt(doc.net_payable_farmer)
    advance          = _flt(doc.advance)

    details = []
    for item in doc.items:
        item_name = frappe.db.get_value("Item", item.item_id, "item_name") or item.item_id
        details.append(f"{item.qty} {item.unit} {item_name} @ ₹{item.supplier_rate}")
    details_str = " (" + ", ".join(details) + ")" if details else ""
    bill_ref = f"Bill #{doc.contact_bill_no}" if getattr(doc, "contact_bill_no", None) else f"Arrival {doc.name}"

    if total_realized == 0 and net_payable == 0 and total_commission == 0 and advance == 0:
        frappe.msgprint(
            "⚠️ Arrival has zero financials — no Journal Entry created.",
            indicator="orange",
        )
        return

    ensure_company_party_defaults(company)
    supplier = ensure_supplier_for_contact(doc.party_id, company)

    # ── 1. Goods Receipt JE ─────────────────────────────────────────────────
    goods_accounts = []
    payable_acc = (
        get_supplier_acc(company)
        if arrival_type == "commission_supplier"
        else get_farmer_acc(company)
    )

    if arrival_type in ("commission", "commission_supplier"):
        if total_realized > 0:
            # Debit: Stock In Hand (goods received into inventory)
            goods_accounts.append({
                "account":                   get_stock_acc(company),
                "debit_in_account_currency": total_realized,
                "against_voucher_type":      "Mandi Arrival",
                "against_voucher":           doc.name,
                "user_remark":               f"Goods received from {party_name} — {bill_ref}{details_str}",
            })
            # Credit 1: Creditor (what Mandi owes the party NET of comm and expenses)
            #   The advance payment JE (below) will separately Debit this account to net it off.
            total_expenses = _flt(doc.total_expenses)
            gross_payable = round(total_realized - total_commission - total_expenses, 2)
            if gross_payable > 0:
                goods_accounts.append({
                    "account":                    payable_acc,
                    "credit_in_account_currency": gross_payable,
                    "party_type":                 "Supplier",
                    "party":                      supplier,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Goods payable to {party_name} — {bill_ref}{details_str}",
                })
            # Credit 2: Commission Income
            if total_commission > 0:
                goods_accounts.append({
                    "account":                    get_comm_acc(company),
                    "credit_in_account_currency": total_commission,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Commission on {bill_ref} — {party_name}",
                })
            # Credit 3: Expense Recovery / Service Income
            if total_expenses > 0:
                goods_accounts.append({
                    "account":                    get_expense_acc(company),
                    "credit_in_account_currency": total_expenses,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Expense Recovery (Hamali/Packing/Loading) on {bill_ref} — {party_name}",
                })
    else:
        # Direct purchase: Stock Dr / Creditor Cr (full purchase value minus expenses)
        total_expenses = _flt(doc.total_expenses)
        net_payable = round(total_realized - total_expenses, 2)
        if total_realized > 0:
            goods_accounts.append({
                "account":                   get_stock_acc(company),
                "debit_in_account_currency": total_realized,
                "against_voucher_type":      "Mandi Arrival",
                "against_voucher":           doc.name,
                "user_remark":               f"Direct purchase received from {party_name} — {bill_ref}{details_str}",
            })
            if net_payable > 0:
                goods_accounts.append({
                    "account":                    payable_acc,
                    "credit_in_account_currency": net_payable,
                    "party_type":                 "Supplier",
                    "party":                      supplier,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Goods payable to {party_name} — {bill_ref}",
                })
            if total_expenses > 0:
                goods_accounts.append({
                    "account":                    get_expense_acc(company),
                    "credit_in_account_currency": total_expenses,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Expense Recovery on {bill_ref} — {party_name}",
                })

    goods_je = None
    if goods_accounts:
        cost_center = frappe.db.get_value("Company", company, "cost_center")
        for row in goods_accounts:
            row.setdefault("account_currency", "INR")
            row.setdefault("exchange_rate", 1)
            row.setdefault("cost_center", cost_center)
        goods_je = frappe.get_doc({
            "doctype":      "Journal Entry",
            "voucher_type": "Journal Entry",
            "company":      company,
            "posting_date": doc.arrival_date or today(),
            "user_remark":  f"Purchase {bill_ref} — {party_name}{details_str}"[:140],
            "accounts":     goods_accounts,
        })
        goods_je.flags.ignore_permissions = True
        goods_je.insert()
        goods_je.submit()
        _tag_gl_entries(goods_je.name, "Mandi Arrival", doc.name)

    # ── 2. Advance Payment JE (separate, with cheque metadata) ─────────────
    advance_mode = (doc.advance_payment_mode or "credit").strip().lower()
    cheque_date  = getattr(doc, "advance_cheque_date", None)
    # Compute is_cleared up-front so the doctype status update below is always
    # defined, even when no advance JE is created (advance=0 or mode=credit).
    force_clear  = getattr(doc.flags, "advance_cheque_status", False)
    is_cleared   = _is_cheque_cleared(advance_mode, cheque_date, force_clear)
    advance_je = None
    if advance > 0 and advance_mode != "credit":
        pay_account = _resolve_pay_account(company, advance_mode, doc.get("advance_bank_account_id"))
        cheque_no   = getattr(doc, "advance_cheque_no", None)

        # Posting date: cheque_date for cheques (so it lands on the bank's
        # actual movement day), otherwise the arrival date.
        pje_posting = doc.arrival_date or today()
        if advance_mode == "cheque" and cheque_date:
            pje_posting = cheque_date

        pje_voucher_type = "Cash Entry" if advance_mode == "cash" else "Journal Entry"

        pje_payload = {
            "doctype":      "Journal Entry",
            "voucher_type": pje_voucher_type,
            "company":      company,
            "posting_date": pje_posting,
            "user_remark":  f"Advance paid for {bill_ref} [{doc.name}] — {party_name} ({advance_mode})"[:140],
            "accounts": [
                {
                    "account":                   payable_acc,
                    "debit_in_account_currency": advance,
                    "party_type":                "Supplier",
                    "party":                     supplier,
                    "against_voucher_type":      "Mandi Arrival",
                    "against_voucher":           doc.name,
                    "user_remark":               f"Advance paid to {party_name} — {bill_ref}",
                    "account_currency":          "INR",
                    "exchange_rate":             1,
                },
                {
                    "account":                    pay_account,
                    "credit_in_account_currency": advance,
                    "against_voucher_type":       "Mandi Arrival",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Advance paid to {party_name} — {bill_ref} ({advance_mode})",
                    "account_currency":           "INR",
                    "exchange_rate":              1,
                },
            ],
        }

        # Ensure cost center is set for all payment legs
        cost_center = frappe.db.get_value("Company", company, "cost_center")
        for row in pje_payload["accounts"]:
            row.setdefault("cost_center", cost_center)

        if advance_mode == "cheque":
            pje_payload["cheque_no"] = cheque_no or "Pending"
            pje_payload["cheque_date"] = cheque_date or doc.arrival_date or today()
            if is_cleared:
                pje_payload["clearance_date"] = pje_payload["cheque_date"]

        advance_je = frappe.get_doc(pje_payload)
        advance_je.flags.ignore_permissions = True
        advance_je.insert()
        if is_cleared:
            advance_je.submit()
        
        # Tag both submitted and draft JEs (so reconciliation can find them)
        if is_cleared and advance_mode == "cheque":
            advance_je.db_set("clearance_date", pje_payload.get("cheque_date") or today())
            
        _tag_gl_entries(advance_je.name, "Mandi Arrival", doc.name)

    # ── Update status on the Arrival doc ───────────────────────────────────
    status = _arrival_status(advance, net_payable, advance_mode, is_cleared)
    frappe.db.set_value("Mandi Arrival", doc.name, "status", status, update_modified=False)

    msg_parts = []
    if goods_je:   msg_parts.append(f"Goods <b>{goods_je.name}</b>")
    if advance_je: msg_parts.append(f"Advance <b>{advance_je.name}</b>")
    if msg_parts:
        frappe.msgprint(
            "✅ Created " + " + ".join(msg_parts) + f" for Arrival <b>{doc.name}</b>",
            indicator="green",
        )


# ── Sale Ledger (on_submit) ────────────────────────────────────────────────────

def post_sale_ledger(doc, method=None):
    """
    Create Journal Entries for a Mandi Sale on submit.

    Two vouchers are produced (when applicable):

      1. Sale JE      — Debtors Dr / Stock Cr. Debtor leg tagged
                        against_voucher=Mandi Sale.

      2. Receipt JE   — Cash|Bank Dr / Debtors Cr. Both legs tagged
                        against_voucher=Mandi Sale so the day-book groups
                        the sale and receipt under the same transaction.
                        For cheque mode, cheque_no/cheque_date are set on
                        the JE; the JE is posted on the cheque date and
                        clearance_date is left NULL until the cheque is
                        marked cleared (post-dated cheques act as udhaar).

    Payment modes:
      credit     → full udhaar, no receipt entry
      cash       → cash received
      upi_bank   → bank transfer received
      cheque     → cleared if cheque_date <= today, else udhaar until cleared
    """
    company    = get_default_company()
    party_name = _party_name(doc.buyerid)

    total_amount = _flt(doc.totalamount)
    paid_amount  = _flt(doc.amountreceived)

    details = []
    for item in doc.items:
        item_code = getattr(item, "item_id", getattr(item, "item_code", "Unknown"))
        item_name = frappe.db.get_value("Item", item_code, "item_name") or item_code
        rate = getattr(item, "rate", getattr(item, "sale_price", 0))
        unit = getattr(item, "unit", "Kg")
        details.append(f"{item.qty} {unit} {item_name} @ ₹{rate}")
    details_str = " (" + ", ".join(details) + ")" if details else ""
    bill_ref = f"Bill #{doc.name}"

    if total_amount == 0:
        return

    ensure_company_party_defaults(company)
    customer = ensure_customer_for_contact(doc.buyerid, company)

    payment_mode = (doc.paymentmode or "credit").lower().strip()
    cheque_no    = getattr(doc, "chequeno", None)
    cheque_date  = getattr(doc, "chequedate", None)

    # ── 1. Sale Journal Entry ──────────────────────────────────────────────
    sale_je = frappe.get_doc({
        "doctype":      "Journal Entry",
        "voucher_type": "Journal Entry",
        "company":      company,
        "posting_date": doc.saledate or today(),
        "user_remark":  f"Sale {bill_ref} — {party_name}{details_str}"[:140],
        "accounts": [
            {
                "account":                   get_debtor_acc(company),
                "debit_in_account_currency": total_amount,
                "party_type":                "Customer",
                "party":                     customer,
                "against_voucher_type":      "Mandi Sale",
                "against_voucher":           doc.name,
                "user_remark":               f"Goods sold to {party_name} — {bill_ref}{details_str}",
                "account_currency":          "INR",
                "exchange_rate":             1,
            },
            {
                "account":                    get_stock_acc(company),
                "credit_in_account_currency": total_amount,
                "against_voucher_type":       "Mandi Sale",
                "against_voucher":            doc.name,
                "user_remark":                f"Stock out — {bill_ref}",
                "account_currency":           "INR",
                "exchange_rate":              1,
            },
        ],
    })
    
    # Ensure cost center is set for all sale legs
    cost_center = _get_cost_center(company)
    for row in sale_je.accounts:
        row.cost_center = cost_center
        
    sale_je.flags.ignore_permissions = True
    sale_je.insert()
    sale_je.submit()
    _tag_gl_entries(sale_je.name, "Mandi Sale", doc.name)

    # ── 2. Receipt Journal Entry (Cash / UPI / Bank / Cheque) ──────────────
    if paid_amount > 0 and payment_mode != "credit":
        pay_account = _resolve_pay_account(company, payment_mode, doc.get("bankaccountid"))
        
        # Respect explicit UI flag if passed, else fallback to date logic
        if hasattr(doc.flags, "cheque_status"):
            is_cleared = doc.flags.cheque_status
        else:
            is_cleared = _is_cheque_cleared(payment_mode, cheque_date)

        # For cheques, the receipt lands on the cheque date (when funds move).
        pje_posting_date = doc.saledate or today()
        if payment_mode == "cheque" and cheque_date:
            pje_posting_date = cheque_date

        pje_voucher_type = "Cash Entry" if payment_mode == "cash" else "Journal Entry"

        pje_payload = {
            "doctype":      "Journal Entry",
            "voucher_type": pje_voucher_type,
            "company":      company,
            "posting_date": pje_posting_date,
            "user_remark":  f"Payment for Sale {bill_ref} — {party_name} ({payment_mode})"[:140],
            "accounts": [
                {
                    "account":                   pay_account,
                    "debit_in_account_currency": paid_amount,
                    "against_voucher_type":      "Mandi Sale",
                    "against_voucher":           doc.name,
                    "user_remark":               f"{payment_mode.upper()} received from {party_name} — {bill_ref}",
                    "account_currency":          "INR",
                    "exchange_rate":             1,
                },
                {
                    "account":                    get_debtor_acc(company),
                    "credit_in_account_currency": paid_amount,
                    "party_type":                 "Customer",
                    "party":                      customer,
                    "against_voucher_type":       "Mandi Sale",
                    "against_voucher":            doc.name,
                    "user_remark":                f"Payment received against Sale {bill_ref}",
                    "account_currency":           "INR",
                    "exchange_rate":              1,
                },
            ],
        }

        # Ensure cost center is set for all receipt legs
        cost_center = frappe.db.get_value("Company", company, "cost_center")
        for row in pje_payload["accounts"]:
            row.setdefault("cost_center", cost_center)

        if payment_mode == "cheque":
            pje_payload["cheque_no"] = cheque_no or "Pending"
            pje_payload["cheque_date"] = cheque_date or doc.saledate or today()
            if is_cleared:
                pje_payload["clearance_date"] = pje_payload["cheque_date"]

        pje = frappe.get_doc(pje_payload)
        pje.flags.ignore_permissions = True
        pje.insert()
        if is_cleared:
            pje.submit()

        # Tag both submitted and draft JEs
        if is_cleared and payment_mode == "cheque":
            pje.db_set("clearance_date", pje_payload.get("cheque_date") or today())

        _tag_gl_entries(pje.name, "Mandi Sale", doc.name)

    # ── 3. Update status ───────────────────────────────────────────────────
    credit_days = _flt(frappe.db.get_value("Mandi Contact", doc.buyerid, "credit_days") or 7)
    due_date    = doc.duedate or add_days(doc.saledate or today(), int(credit_days))
    
    if hasattr(doc.flags, "cheque_status"):
        is_cleared = doc.flags.cheque_status
    else:
        is_cleared = _is_cheque_cleared(payment_mode, cheque_date)
        
    status      = _sale_status(paid_amount, total_amount, str(due_date), payment_mode, is_cleared)

    frappe.db.set_value("Mandi Sale", doc.name, {
        "status":  status,
        "duedate": due_date,
    }, update_modified=False)

    frappe.msgprint(
        f"✅ Journal Entry <b>{sale_je.name}</b> created for Sale <b>{doc.name}</b>",
        indicator="green",
    )


# ── Purchase Receipt for stock (optional, best-effort) ────────────────────────

def _create_purchase_receipt(doc):
    """
    Create an ERPNext Purchase Receipt for stock tracking.
    Wrapped in try/except so a warehouse / UOM misconfiguration does NOT
    roll back the financial Journal Entry above.
    """
    try:
        company   = get_default_company()
        supplier  = ensure_supplier_for_contact(doc.party_id, company)
        warehouse = get_default_warehouse(company)

        if not warehouse:
            frappe.msgprint(
                "⚠️ No warehouse found — Purchase Receipt skipped.",
                indicator="orange",
            )
            return

        pr = frappe.get_doc({
            "doctype":      "Purchase Receipt",
            "supplier":     supplier,
            "company":      company,
            "posting_date": doc.arrival_date or today(),
            "items":        [],
        })

        for item in (doc.items or []):
            item_code = ensure_item(
                getattr(item, "item_id", None) or "Mandi Produce",
                preferred_uom=getattr(item, "unit", None),
                is_stock_item=True,
            )
            net_qty = _flt(getattr(item, "net_qty", None) or getattr(item, "qty", 1))
            rate    = _flt(getattr(item, "supplier_rate", None) or getattr(item, "sale_price", None))
            uom     = resolve_uom(getattr(item, "unit", None))

            pr.append("items", {
                "item_code":   item_code,
                "qty":         net_qty,
                "rate":        rate,
                "uom":         uom,
                "stock_uom":   uom,
                "warehouse":   warehouse,
            })

        if pr.items:
            pr.flags.ignore_permissions = True
            pr.insert()
            frappe.msgprint(
                f"📦 Purchase Receipt <b>{pr.name}</b> created for Arrival <b>{doc.name}</b>",
                indicator="blue",
            )

    except Exception as exc:
        frappe.log_error(frappe.get_traceback(), f"Purchase Receipt failed for Arrival {doc.name}")
        frappe.msgprint(
            f"⚠️ Purchase Receipt could not be created: {exc}",
            indicator="orange",
        )


# ── Unified on_submit dispatchers ──────────────────────────────────────────────

def _tag_gl_entries(je_name, voucher_type, voucher_no):
    """
    Directly update GL Entries for a submitted Journal Entry to ensure
    the against_voucher and against_voucher_type are correctly populated.
    This bypasses ERPNext's restriction on custom doctypes in JE's reference_type.
    """
    frappe.db.sql("""
        UPDATE `tabGL Entry`
        SET against_voucher_type = %s, against_voucher = %s
        WHERE voucher_no = %s AND voucher_type = 'Journal Entry' AND is_cancelled = 0
    """, (voucher_type, voucher_no, je_name))
    
def on_arrival_submit(doc, method=None):
    """Dispatches to ledger + stock receipt on Mandi Arrival submit."""
    try:
        post_arrival_ledger(doc, method)
    except Exception as exc:
        frappe.log_error(frappe.get_traceback(), f"Arrival Ledger failed: {doc.name}")
        frappe.msgprint(
            f"⚠️ Ledger posting failed: {exc}",
            indicator="red",
        )
        raise   # re-raise so the submit is rolled back if ledger failed

    # PR is best-effort — do NOT raise so a warehouse issue doesn't block
    _create_purchase_receipt(doc)


def on_sale_submit(doc, method=None):
    """Dispatches to ledger on Mandi Sale submit."""
    try:
        post_sale_ledger(doc, method)
    except Exception as exc:
        frappe.log_error(frappe.get_traceback(), f"Sale Ledger failed: {doc.name}")
        frappe.msgprint(
            f"⚠️ Ledger posting failed: {exc}",
            indicator="red",
        )
        raise   # re-raise so the submit is rolled back if ledger failed
