import frappe
from frappe.model.document import Document
from frappe.utils import flt

class MandiSale(Document):
    # begin: auto-generated types
    # end: auto-generated types

    def autoname(self):
        from frappe.model.naming import make_autoname
        org_id = getattr(self, "organization_id", None)
        if not org_id:
            from mandigrow.api import _get_user_org
            org_id = _get_user_org()
        
        prefix = org_id.replace("-", "") if org_id else "MG"
        self.name = make_autoname(f"SALE-{prefix}-.YYYY.-.#####")

    def validate(self):
        self._ensure_bill_no()
        self.recalculate_totals()

    def _ensure_bill_no(self):
        """Auto-increment contact_bill_no per party if not set."""
        contact_bill_no = getattr(self, "contact_bill_no", None)
        buyer_id = getattr(self, "buyerid", None)
        
        if not contact_bill_no and buyer_id and self.meta.has_field("contact_bill_no"):
            last_bill_no = frappe.db.sql("""
                SELECT MAX(CAST(contact_bill_no AS UNSIGNED)) 
                FROM `tabMandi Sale` 
                WHERE buyerid = %s 
                AND contact_bill_no REGEXP '^[0-9]+$'
                AND contact_bill_no NOT LIKE 'ARC%%'
            """, (buyer_id,))
            max_val = last_bill_no[0][0] if last_bill_no and last_bill_no[0][0] else 0
            self.contact_bill_no = str(int(max_val) + 1)

    def get_invoice_total(self):
        """The definitive formula for a Mandi Sale total."""
        
        # ── Intelligently add only EXCLUSIVE GST ───────────────────────
        if hasattr(self, 'exclusive_gst_total') and getattr(self, 'exclusive_gst_total') is not None:
            tax_to_add = flt(getattr(self, 'exclusive_gst_total', 0))
        else:
            tax_to_add = flt(getattr(self, 'gsttotal', 0))
        # ─────────────────────────────────────────────────────────────────
        
        return (
            flt(self.totalamount)
            + flt(getattr(self, 'marketfee', 0))
            + flt(getattr(self, 'nirashrit', 0))
            + flt(getattr(self, 'miscfee', 0))
            + flt(getattr(self, 'loadingcharges', 0))
            + flt(getattr(self, 'unloadingcharges', 0))
            + flt(getattr(self, 'otherexpenses', 0))
            + tax_to_add
            - flt(getattr(self, 'discountamount', 0))
        )

    def recalculate_totals(self):
        """Ensures totalamount is the sum of items if items exist."""
        if hasattr(self, 'items') and self.items:
            self.totalamount = sum(flt(item.amount) for item in self.items)
        
        # Set the definitive Grand Total in the database
        self.invoice_total = self.get_invoice_total()

        # Update Status based on payment
        total = flt(self.invoice_total)
        received = flt(self.amountreceived)
        mode = (self.paymentmode or "credit").strip().lower()
        
        # Determine if cleared
        is_cleared = True
        if mode == "cheque":
            from frappe.utils import getdate, today
            # If explicit flag is present
            if getattr(self.flags, "cheque_status", None) is not None:
                is_cleared = self.flags.cheque_status
            elif self.chequedate:
                is_cleared = getdate(self.chequedate) <= getdate(today())
        elif mode == "credit":
            # Credit doesn't have an instantly 'cleared' partial payment concept in the same way
            pass
            
        if not is_cleared:
            received = 0.0

        if mode == "credit":
            if received >= total and total > 0:
                self.status = "Paid"
            else:
                self.status = "Pending"
        else:
            if received >= total and total > 0:
                self.status = "Paid"
            elif received > 0:
                self.status = "Partial"
            else:
                self.status = "Pending"

    def after_save(self):
        """
        Crate tracking hook — runs AFTER the sale is fully saved and committed.
        SAFETY GUARANTEES:
          1. Wrapped in try/except — any bug NEVER blocks or rolls back a sale.
          2. Feature flag checked first — if OFF, returns immediately. Zero cost.
          3. Only writes to tabMandi Crate Ledger — never touches tabGL Entry.
          4. This method did not exist before — adding it cannot break existing behaviour.
        """
        try:
            org_id = getattr(self, "organization_id", None)
            if not org_id:
                return

            crate_enabled = frappe.db.get_value("Mandi Settings", org_id, "enable_crate_tracking")
            if not crate_enabled:
                return

            buyer_id = getattr(self, "buyerid", None) or getattr(self, "buyer_id", None)
            buyer_name = getattr(self, "buyername", None) or getattr(self, "buyer_name", None) or ""

            if not buyer_id:
                return

            crate_items = getattr(self, "crate_items", []) or self.flags.get("crate_items", [])
            if not crate_items:
                return

            from mandigrow.api import _post_crate_ledger_entry
            for item in crate_items:
                if isinstance(item, dict):
                    crate_type = item.get("crate_type")
                    quantity = int(item.get("quantity") or 0)
                    deposit_amount = float(item.get("deposit_amount") or 0)
                else:
                    crate_type = getattr(item, "crate_type", None)
                    quantity = int(getattr(item, "quantity", 0) or 0)
                    deposit_amount = float(getattr(item, "deposit_amount", 0) or 0)
                    
                if not crate_type or quantity <= 0:
                    continue
                    
                _post_crate_ledger_entry(
                    org_id=org_id,
                    party_id=buyer_id,
                    party_name=buyer_name,
                    crate_type=crate_type,
                    qty_out=quantity,
                    qty_in=0,
                    deposit_amount=deposit_amount,
                    source_doctype="Mandi Sale",
                    source_docname=self.name,
                    notes=f"Auto-issued on sale {self.name}",
                )
        except Exception as e:
            frappe.log_error(
                message=f"Crate ledger post failed for sale {self.name}: {str(e)}",
                title="Crate Tracking Warning"
            )
