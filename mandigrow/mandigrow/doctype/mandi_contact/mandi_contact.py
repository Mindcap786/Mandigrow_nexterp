# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mandigrow.mandigrow.logic.erp_bootstrap import ensure_customer_for_contact, ensure_supplier_for_contact


class MandiContact(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		address: DF.SmallText | None
		city: DF.Data | None
		contact_type: DF.Literal["farmer", "buyer", "supplier", "staff"]
		customer: DF.Link | None
		full_name: DF.Data
		internal_id: DF.Data | None
		phone: DF.Phone | None
		supplier: DF.Link | None
	# end: auto-generated types

	def validate(self):
		self.check_unique_internal_id()

	def check_unique_internal_id(self):
		import frappe
		if not self.internal_id:
			return

		# Check if another contact of the same type in the same organization has this internal_id
		filters = {
			"internal_id": self.internal_id,
			"contact_type": self.contact_type,
			"organization_id": self.organization_id,
			"name": ["!=", self.name]
		}
		
		existing = frappe.db.get_value("Mandi Contact", filters, "full_name")
		if existing:
			frappe.throw(
				frappe._("Internal ID {0} is already assigned to {1} ({2}). Each {2} must have a unique ID.")
				.format(self.internal_id, existing, self.contact_type.title())
			)

	def on_update(self):
		self.link_with_erpnext()

	def link_with_erpnext(self):
		import frappe
		if self.contact_type in ["farmer", "supplier"] and not self.supplier:
			self.create_erpnext_supplier()
		elif self.contact_type == "buyer" and not self.customer:
			self.create_erpnext_customer()

	def create_erpnext_supplier(self):
		supplier = ensure_supplier_for_contact(self.name)
		self.db_set("supplier", supplier)

	def create_erpnext_customer(self):
		customer = ensure_customer_for_contact(self.name)
		self.db_set("customer", customer)
