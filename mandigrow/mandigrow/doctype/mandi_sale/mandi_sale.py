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
