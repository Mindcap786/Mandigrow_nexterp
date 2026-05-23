import frappe
from frappe.model.document import Document

class MandiCrateInventoryEntry(Document):
    def before_save(self):
        self.total_value = (self.quantity or 0) * (self.purchase_rate or 0)
