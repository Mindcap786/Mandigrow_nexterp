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
            from mandigrow.mandigrow.api import _get_user_org
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
        
        if not contact_bill_no and buyer_id and hasattr(self, "contact_bill_no"):
            last_bill_no = frappe.db.get_value(
                "Mandi Sale",
                {"buyerid": buyer_id, "name": ["!=", self.name]},
                "contact_bill_no",
                order_by="contact_bill_no desc",
            )
            self.contact_bill_no = (flt(last_bill_no) or 0) + 1

    def get_invoice_total(self):
        """The definitive formula for a Mandi Sale total."""
        return (
            flt(self.totalamount)
            + flt(getattr(self, 'marketfee', 0))
            + flt(getattr(self, 'nirashrit', 0))
            + flt(getattr(self, 'miscfee', 0))
            + flt(getattr(self, 'loadingcharges', 0))
            + flt(getattr(self, 'unloadingcharges', 0))
            + flt(getattr(self, 'otherexpenses', 0))
            + flt(getattr(self, 'gsttotal', 0))
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
