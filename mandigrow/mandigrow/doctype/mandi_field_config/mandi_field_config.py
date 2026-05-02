# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiFieldConfig(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		default_value: DF.Data | None
		display_order: DF.Int
		field_key: DF.Data
		is_mandatory: DF.Check
		is_visible: DF.Check
		label: DF.Data
		module_id: DF.Data
		organization_id: DF.Link
		user_id: DF.Data | None
	# end: auto-generated types

	pass
