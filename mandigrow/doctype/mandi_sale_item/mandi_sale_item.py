# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiSaleItem(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		amount: DF.Currency
		gst_amount: DF.Currency
		gst_rate: DF.Percent
		hsn_code: DF.Data | None
		item_id: DF.Link | None
		lot_id: DF.Data | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		qty: DF.Float
		rate: DF.Currency
	# end: auto-generated types

	pass
