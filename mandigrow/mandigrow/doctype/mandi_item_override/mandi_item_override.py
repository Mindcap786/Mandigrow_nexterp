# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiItemOverride(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		image_url: DF.Data | None
		item_code: DF.Link
		organization_id: DF.Link
	# end: auto-generated types

	pass
