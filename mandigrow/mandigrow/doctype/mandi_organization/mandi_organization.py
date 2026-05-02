# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiOrganization(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		address: DF.Text | None
		brand_color: DF.Color | None
		city: DF.Data | None
		gstin: DF.Data | None
		is_active: DF.Check
		organization_name: DF.Data
		phone: DF.Data | None
		status: DF.Literal["trial", "active", "grace_period", "suspended", "expired"]
		subscription_tier: DF.Literal["starter", "professional", "enterprise"]
		trial_ends_at: DF.Datetime | None
	# end: auto-generated types

	pass
