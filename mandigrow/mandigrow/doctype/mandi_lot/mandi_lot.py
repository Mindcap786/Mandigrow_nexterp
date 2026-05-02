# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from frappe.utils import flt


class MandiLot(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		barcode: DF.Data | None
		commission_amount: DF.Currency
		commission_percent: DF.Percent
		farmer_charges: DF.Currency
		current_qty: DF.Float
		initial_qty: DF.Float
		item_id: DF.Link
		less_percent: DF.Percent
		less_units: DF.Float
		loading_cost: DF.Currency
		lot_code: DF.Data | None
		net_amount: DF.Currency
		net_qty: DF.Float
		packing_cost: DF.Currency
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		qty: DF.Float
		sale_price: DF.Currency
		status: DF.Literal["Available", "Partial", "Sold Out"]
		storage_location: DF.Data | None
		supplier_rate: DF.Currency
		unit: DF.Link | None
		unit_weight: DF.Float
	# end: auto-generated types

	def validate(self):
		seed_qty = flt(self.net_qty or 0) if flt(self.net_qty or 0) > 0 else max(flt(self.qty or 0), 0)
		initial_qty = flt(self.initial_qty or 0)
		current_qty = flt(self.current_qty or 0)

		if initial_qty <= 0 and seed_qty > 0:
			initial_qty = seed_qty
		if current_qty <= 0 and seed_qty > 0 and (self.status or "").lower() != "sold out":
			current_qty = seed_qty

		self.initial_qty = initial_qty
		self.current_qty = max(current_qty, 0)

		if self.current_qty <= 0:
			self.status = "Sold Out"
		elif self.initial_qty > 0 and self.current_qty < self.initial_qty:
			self.status = "Partial"
		else:
			self.status = "Available"
