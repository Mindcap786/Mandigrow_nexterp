import frappe
from frappe.model.document import Document

class MandiGateEntry(Document):
    def before_insert(self):
        if not self.token_no:
            today = frappe.utils.today()
            # Issue 8: Tenant-scoped, robust MAX() token retrieval. Avoids LIKE on Datetime columns which fails in MySQL.
            count = frappe.db.sql("""
                SELECT IFNULL(MAX(token_no), 0) FROM `tabMandi Gate Entry` 
                WHERE organization_id = %s AND DATE(creation) = %s
            """, (self.organization_id, today))[0][0]
            self.token_no = count + 1
