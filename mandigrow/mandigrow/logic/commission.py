import frappe
from frappe import _


# ─────────────────────────────────────────────────────────────────────────────
# COMMISSION ENGINE — Mandi Arrival Validate Hook
# ─────────────────────────────────────────────────────────────────────────────
#
# RULE: Commission is ALWAYS calculated AFTER applying LESS (weight deduction).
#
#  Case 1: Amount=100, Commission=10%
#          Net            = 100 (no less)
#          Commission     = 100 × 10% = 10
#          Farmer gets    = 90
#          Mandi earns    = 10
#
#  Case 2: Amount=100, Charges=10, Commission=10%
#          Net            = 100 (no less)
#          Commission     = 100 × 10% = 10
#          Farmer gets    = 100 - 10 (comm) - 10 (charges) = 80
#          Mandi earns    = 10 (comm) + 10 (charges) = 20
#
#  Case 3: Amount=100, Less=10%, Commission=10%
#          After Less     = 100 × (1 - 10%) = 90  ← LESS applied first
#          Commission     = 90 × 10% = 9
#          Farmer gets    = 90 - 9 = 81
#          Mandi earns    = 9
#          Buyer pays     = 90
# ─────────────────────────────────────────────────────────────────────────────

def calculate_arrival_commission(doc, method):
    """
    validate hook: calculates per-lot and trip-level commission totals.
    Applies to both 'commission' (farmer) and 'commission_supplier' types.
    Results are written to computed fields on the DocType (if they exist).
    """

    trip_realized       = 0.0  # Total (net_qty × sale_price) across all lots
    trip_supplier_val   = 0.0  # Total (net_qty × supplier_rate) across all lots
    trip_commission     = 0.0  # Sum of per-lot commissions
    trip_charges        = 0.0  # Packing + Loading + Farmer charges (lot-level)
    trip_less_value     = 0.0  # Value of deducted weight

    for item in doc.items:
        qty             = _flt(item.qty)
        sale_price      = _flt(item.sale_price)        # What the buyer pays per unit (0 at arrival time)
        supplier_rate   = _flt(item.supplier_rate)     # What the farmer/supplier is owed per unit
        comm_pct        = _flt(item.commission_percent)
        less_pct        = _flt(item.less_percent)      # % weight to deduct
        less_units      = _flt(item.less_units)        # OR fixed units to deduct
        packing         = _flt(item.packing_cost)
        loading         = _flt(item.loading_cost)
        farmer_chg      = _flt(item.farmer_charges)

        # ── Step 1: Apply LESS to get Net Quantity ────────────────────────
        if less_units > 0:
            # Prefer explicit less_units over percentage (more precise)
            less_qty = less_units
        elif less_pct > 0:
            less_qty = qty * (less_pct / 100.0)
        else:
            less_qty = 0.0

        net_qty = max(qty - less_qty, 0.0)

        # ── Step 2: Calculate per-lot financials ──────────────────────────
        # IMPORTANT: At arrival time, sale_price = 0. We ALWAYS use supplier_rate
        # as the basis for "what is owed to the party". When the lot is sold,
        # a separate sale JE handles the buyer's payment.
        if doc.arrival_type == "commission":
            # Farmer commission: base on supplier_rate (what the farmer declared)
            # Mandi earns commission on the NET quantity × supplier_rate
            net_amount      = net_qty * supplier_rate        # Farmer is owed this gross
            lot_commission  = net_amount * (comm_pct / 100.0)  # Mandi's cut
            lot_less_value  = less_qty * supplier_rate       # Value of deducted weight

            trip_realized   += net_amount
            trip_commission += lot_commission
            trip_less_value += lot_less_value

        elif doc.arrival_type == "commission_supplier":
            # Supplier commission: base on supplier_rate
            net_amount      = net_qty * supplier_rate
            lot_commission  = net_amount * (comm_pct / 100.0)
            lot_less_value  = less_qty * supplier_rate

            trip_supplier_val += net_amount
            trip_commission   += lot_commission
            trip_less_value   += lot_less_value

        else:
            # Direct purchase: base on supplier_rate, no commission
            net_amount     = net_qty * supplier_rate
            lot_commission = 0.0
            lot_less_value = 0.0
            trip_supplier_val += net_amount   # reuse supplier_val for direct too

        # Lot-level charges (packing, loading, farmer charges)
        trip_charges += packing + loading + farmer_chg

        # Write computed values back to the lot row if fields exist
        for field, value in [
            ("net_qty",           round(net_qty, 3)),
            ("net_amount",        round(net_amount, 2)),
            ("commission_amount", round(lot_commission, 2)),
        ]:
            if hasattr(item, field):
                setattr(item, field, value)

    # ── Step 3: Trip-level expenses ───────────────────────────────────────
    hire_charges    = _flt(doc.hire_charges)
    hamali_expenses = _flt(doc.hamali_expenses)
    other_expenses  = _flt(doc.other_expenses)
    advance         = _flt(doc.advance)

    # All expenses the Mandi has incurred/charged on behalf of the party
    total_trip_expenses = hire_charges + hamali_expenses + other_expenses + trip_charges

    # ── Step 4: Net payable to party ─────────────────────────────────────
    if doc.arrival_type == "commission":
        # Mandi earns = Commission + all charges/expenses
        mandi_earns   = trip_commission + total_trip_expenses
        # Farmer gets  = Net realized (their goods value) − Mandi's total earnings
        net_payable   = trip_realized - mandi_earns

    elif doc.arrival_type == "commission_supplier":
        # Same structure: Supplier gets back (their total bill) − Commission − Charges
        mandi_earns   = trip_commission + total_trip_expenses
        net_payable   = trip_supplier_val - mandi_earns

    else:
        # Direct purchase: Mandi owes supplier full net amount
        mandi_earns   = total_trip_expenses   # only expenses, no commission
        net_payable   = trip_supplier_val - mandi_earns

    # ── Step 5: Write computed totals back to the document ────────────────
    for field, value in [
        ("total_realized",      round(trip_realized or trip_supplier_val, 2)),
        ("total_commission",    round(trip_commission, 2)),
        ("total_expenses",      round(total_trip_expenses, 2)),
        ("mandi_total_earnings", round(mandi_earns, 2)),
        ("net_payable_farmer",  round(net_payable, 2)),  # field name shared for both farmer/supplier
    ]:
        if hasattr(doc, field):
            setattr(doc, field, value)


def _flt(value):
    """Safe float conversion, returns 0.0 on None/empty."""
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0
