import frappe
from frappe.model.document import Document

class MandiGateEntry(Document):
    def before_insert(self):
        if not self.token_no:
            # Simple token generation logic: count entries for today + 1
            today = frappe.utils.today()
            count = frappe.db.count("Mandi Gate Entry", {"creation": ["like", f"{today}%"]})
            self.token_no = count + 1
