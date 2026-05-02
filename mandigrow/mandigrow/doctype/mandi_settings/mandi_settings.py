# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		cgst_percent: DF.Percent
		default_credit_days: DF.Int
		gst_enabled: DF.Check
		gst_type: DF.Literal["intra", "inter"]
		igst_percent: DF.Percent
		market_fee_percent: DF.Percent
		misc_fee_percent: DF.Percent
		nirashrit_percent: DF.Percent
		sgst_percent: DF.Percent
		state_code: DF.Data | None
	# end: auto-generated types

	pass
