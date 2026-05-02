# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class MandiStorageLocation(Document):
    def validate(self):
        # Ensure name/location_name uniqueness per organization
        existing = frappe.get_all("Mandi Storage Location", 
            filters={
                "location_name": self.location_name,
                "organization_id": self.organization_id,
                "name": ["!=", self.name]
            }
        )
        if existing:
            frappe.throw(f"Storage location '{self.location_name}' already exists.")

    def on_trash(self):
        # Prevent deleting the last location
        count = frappe.db.count("Mandi Storage Location", filters={"organization_id": self.organization_id})
        if count <= 1:
            frappe.throw("Cannot delete the last storage location. Every organization must have at least one.")
