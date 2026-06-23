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
		self.set_internal_id()
		self.check_unique_internal_id()

	def set_internal_id(self):
		import frappe
		if self.internal_id:
			return
			
		if not self.organization_id:
			return
		
		prefix = "C"
		if self.contact_type == "farmer":
			prefix = "F"
		elif self.contact_type == "buyer":
			prefix = "B"
		elif self.contact_type == "supplier":
			prefix = "S"
		elif self.contact_type == "staff":
			prefix = "E"

		# Acquire a lock on the Organization to prevent race conditions during concurrent contact creations
		frappe.db.sql("SELECT name FROM `tabOrganization` WHERE name = %s FOR UPDATE", self.organization_id)
		
		# Find the highest existing numeric ID for this prefix
		result = frappe.db.sql("""
			SELECT internal_id 
			FROM `tabMandi Contact` 
			WHERE organization_id = %s AND internal_id LIKE %s
		""", (self.organization_id, f"{prefix}-%"))
		
		max_num = 1000 # Start sequence from 1001
		for (id_val,) in result:
			try:
				parts = id_val.split("-")
				if len(parts) == 2:
					num_part = int(parts[1])
					if num_part > max_num:
						max_num = num_part
			except (IndexError, ValueError):
				pass
		
		self.internal_id = f"{prefix}-{max_num + 1}"

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
