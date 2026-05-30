import frappe
from frappe.model.document import Document
from frappe.utils import flt


class MandiArrival(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF
        from mandigrow.mandigrow.doctype.mandi_lot.mandi_lot import MandiLot

        advance: DF.Currency
        advance_bank_account_id: DF.Link | None
        advance_bank_name: DF.Data | None
        advance_cheque_date: DF.Date | None
        advance_cheque_no: DF.Data | None
        advance_payment_mode: DF.Literal["credit", "cash", "upi_bank", "cheque"]
        amended_from: DF.Link | None
        arrival_date: DF.Date
        arrival_type: DF.Literal["direct", "commission", "commission_supplier"]
        cgst_amount: DF.Currency
        commission_settlement_status: DF.Literal["Pending", "Ready", "Settled"]
        contact_bill_no: DF.Data | None
        driver_mobile: DF.Data | None
        driver_name: DF.Data | None
        gst_total: DF.Currency
        guarantor: DF.Data | None
        hamali_expenses: DF.Currency
        hire_charges: DF.Currency
        igst_amount: DF.Currency
        items: DF.Table[MandiLot]
        loaders_count: DF.Int
        lot_prefix: DF.Data | None
        mandi_total_earnings: DF.Currency
        net_payable_farmer: DF.Currency
        organization_id: DF.Data | None
        other_expenses: DF.Currency
        party_id: DF.Link
        reference_no: DF.Data | None
        sgst_amount: DF.Currency
        status: DF.Literal["Pending", "Paid", "Partial", "Overdue"]
        storage_location: DF.Data | None
        total_commission: DF.Currency
        total_expenses: DF.Currency
        total_realized: DF.Currency
        vehicle_number: DF.Data | None
        vehicle_type: DF.Data | None
    # end: auto-generated types

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
            from mandigrow.api import _get_user_org
            org_id = _get_user_org()
        
        # Use a tenant-specific prefix for the naming series
        prefix = org_id.replace("-", "") if org_id else "MG"
        self.name = make_autoname(f"ARR-{prefix}-.YYYY.-.#####")

    def validate(self):
        self._validate_commission()
        self._recompute_summary()
        self._ensure_bill_no()

    def _validate_commission(self):
        if self.arrival_type in ("commission", "commission_supplier"):
            for lot in self.get("items") or []:
                if flt(lot.commission_percent) <= 0:
                    frappe.throw(
                        f"Commission % is mandatory for Commission purchases. "
                        f"Please enter a commission percentage greater than zero for '{lot.item_id}'."
                    )


    def _ensure_bill_no(self):
        """Auto-increment contact_bill_no per party if not set."""
        if not self.contact_bill_no and self.party_id:
            last_bill_no = frappe.db.sql("""
                SELECT MAX(CAST(contact_bill_no AS UNSIGNED)) 
                FROM `tabMandi Arrival` 
                WHERE party_id = %s 
                AND contact_bill_no NOT LIKE 'ARC%%'
            """, (self.party_id,))
            max_val = last_bill_no[0][0] if last_bill_no and last_bill_no[0][0] else 0
            self.contact_bill_no = str(int(max_val) + 1)

    def before_save(self):
        self._recompute_summary()

    def _recompute_summary(self):
        import frappe, random
        total_realized = 0.0
        total_commission = 0.0
        sum_lot_costs = 0.0  # packing + loading + farmer charges per lot
        sum_other_cuts = 0.0
        sum_reimbursable_costs = 0.0
        total_purchase_gst = 0.0
        exclusive_gst_total = 0.0
        
        arrival_type_str = (self.arrival_type or "direct").lower()

        for lot in self.get("items") or []:
            if not lot.short_code:
                while True:
                    code = str(random.randint(100000, 999999))
                    if not frappe.db.exists("Mandi Lot", {"short_code": code}):
                        lot.short_code = code
                        break
                        
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

            purchase_gst_amount = 0.0
            if arrival_type_str == "direct":
                gst_rate = flt(lot.purchase_gst_rate or 0)
                if gst_rate > 0:
                    gst_type = str(lot.purchase_gst_type or "Exclusive").strip().capitalize()
                    if gst_type == "Inclusive":
                        base_amount = net_amount / (1 + gst_rate / 100.0)
                        purchase_gst_amount = net_amount - base_amount
                    else:
                        purchase_gst_amount = net_amount * (gst_rate / 100.0)
                        exclusive_gst_total += purchase_gst_amount

            lot.purchase_gst_amount = round(purchase_gst_amount, 2)
            total_purchase_gst += lot.purchase_gst_amount

            farmer_cut = flt(lot.farmer_charges or 0)
            commission_base = max(0, net_amount)
            commission_amount = round(
                commission_base * flt(lot.commission_percent or 0) / 100.0, 2
            )

            # Lot-level deductions (packing, loading)
            reimbursable = flt(lot.packing_cost or 0) + flt(lot.loading_cost or 0)
            lot_deductions = reimbursable + farmer_cut

            lot.net_qty = net_qty
            lot.net_amount = net_amount
            lot.commission_amount = commission_amount

            total_realized += net_amount
            total_commission += commission_amount
            sum_lot_costs += lot_deductions
            sum_other_cuts += farmer_cut
            sum_reimbursable_costs += reimbursable

        arrival_costs = (
            flt(self.hire_charges or 0)
            + flt(self.hamali_expenses or 0)
            + flt(self.other_expenses or 0)
        )
        total_expenses = round(sum_lot_costs + arrival_costs, 2)
        total_reimbursable_expenses = round(sum_reimbursable_costs + arrival_costs, 2)
        
        if arrival_type_str == "direct":
            mandi_total_earnings = round(sum_other_cuts, 2)  # Mandi keeps the Other Cut
            # For direct, reimbursable expenses are added to the cost, but Other Cut (discount) is subtracted, Exclusive GST is added (unless RCM).
            has_rcm = any(lot.get("is_rcm") for lot in (self.get("items") or []))
            gst_to_add_to_payable = exclusive_gst_total if not has_rcm else 0.0
            net_payable = round(total_realized + total_reimbursable_expenses - sum_other_cuts + gst_to_add_to_payable, 2)
        else:
            mandi_total_earnings = round(total_commission + total_expenses, 2)
            net_payable = round(total_realized - mandi_total_earnings, 2)

        self.total_realized = round(total_realized, 2)
        self.total_commission = round(total_commission, 2)
        self.total_expenses = total_expenses
        self.mandi_total_earnings = mandi_total_earnings
        self.net_payable_farmer = net_payable
        self.gst_total = round(total_purchase_gst, 2)
        
        # Calculate GST Split
        self.cgst_amount = 0.0
        self.sgst_amount = 0.0
        self.igst_amount = 0.0
        
        if self.gst_total > 0 and arrival_type_str == "direct":
            try:
                org_id = self.organization_id
                if not org_id:
                    from mandigrow.api import _get_user_org
                    org_id = _get_user_org()
                
                if org_id:
                    from mandigrow.api import _get_org_info
                    org_data = _get_org_info(org_id)
                    gst_type = (org_data.get("gst_type") or "intra").lower()
                    
                    if gst_type == "intra":
                        self.cgst_amount = round(self.gst_total / 2.0, 2)
                        self.sgst_amount = round(self.gst_total - self.cgst_amount, 2)
                    elif gst_type == "inter":
                        self.igst_amount = self.gst_total
                        
                # Set ITC Eligibility and RCM aggregation
                has_rcm = any(lot.get("is_rcm") for lot in (self.get("items") or []))
                self.is_rcm = 1 if has_rcm else 0
                self.itc_eligible = 1 if not has_rcm else 0  # Simplified logic for ITC

            except Exception as e:
                frappe.log_error(f"Error calculating GST split in Mandi Arrival: {str(e)}")
