from frappe.model.document import Document
from frappe.utils import flt


class MandiArrival(Document):
    """Mandi Arrival controller.

    Computes the commission summary fields (total_realized,
    total_commission, total_expenses, mandi_total_earnings,
    net_payable_farmer) on validate so the on_submit hook can post a
    real Journal Entry instead of skipping with "no commission yet".
    """

    def autoname(self):
        from frappe.model.naming import make_autoname
        org_id = self.organization_id
        if not org_id:
            from mandigrow.mandigrow.api import _get_user_org
            org_id = _get_user_org()
        
        # Use a tenant-specific prefix for the naming series
        prefix = org_id.replace("-", "") if org_id else "MG"
        self.name = make_autoname(f"ARR-{prefix}-.YYYY.-.#####")

    def validate(self):
        self._recompute_summary()
        self._ensure_bill_no()

    def _ensure_bill_no(self):
        """Auto-increment contact_bill_no per party if not set."""
        if not self.contact_bill_no and self.party_id:
            last_bill_no = frappe.db.get_value(
                "Mandi Arrival",
                {"party_id": self.party_id, "name": ["!=", self.name]},
                "contact_bill_no",
                order_by="contact_bill_no desc",
            )
            self.contact_bill_no = (flt(last_bill_no) or 0) + 1

    def before_save(self):
        self._recompute_summary()

    def _recompute_summary(self):
        total_realized = 0.0
        total_commission = 0.0
        sum_lot_costs = 0.0  # packing + loading + farmer charges per lot

        for lot in self.get("items") or []:
            qty = flt(lot.qty or 0)
            less_units = flt(lot.less_units or 0)
            if not less_units and lot.less_percent:
                less_units = qty * flt(lot.less_percent) / 100.0

            net_qty = max(qty - less_units, 0)
            # At arrival time, sale_price is 0 — always use supplier_rate for the
            # purchase payable calculation. sale_price is only filled after a sale.
            rate = flt(lot.supplier_rate or 0)
            gross_amount = round(qty * rate, 2)           # Gross: full qty × rate
            net_amount = round(net_qty * rate, 2)         # Adjusted: after less_units

            commission_amount = round(
                net_amount * flt(lot.commission_percent or 0) / 100.0, 2
            )

            # Lot-level deductions (packing, loading, farmer_charges)
            lot_deductions = (
                flt(lot.packing_cost or 0)
                + flt(lot.loading_cost or 0)
                + flt(lot.farmer_charges or 0)
            )

            lot.net_qty = net_qty
            lot.net_amount = net_amount
            lot.commission_amount = commission_amount

            total_realized += net_amount
            total_commission += commission_amount
            sum_lot_costs += lot_deductions

        arrival_costs = (
            flt(self.hire_charges or 0)
            + flt(self.hamali_expenses or 0)
            + flt(self.other_expenses or 0)
        )
        total_expenses = round(sum_lot_costs + arrival_costs, 2)
        mandi_total_earnings = round(total_commission + total_expenses, 2)
        net_payable = round(
            total_realized - mandi_total_earnings, 2
        )

        self.total_realized = round(total_realized, 2)
        self.total_commission = round(total_commission, 2)
        self.total_expenses = total_expenses
        self.mandi_total_earnings = mandi_total_earnings
        self.net_payable_farmer = net_payable
