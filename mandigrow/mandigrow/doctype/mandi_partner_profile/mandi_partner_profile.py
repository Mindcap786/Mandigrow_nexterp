# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiPartnerProfile(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		background: DF.SmallText | None
		bank_account_number: DF.Data | None
		city: DF.Data | None
		ifsc_code: DF.Data | None
		mobile_number: DF.Data
		partner_name: DF.Data
		partner_type: DF.Literal["Freelancer", "Agency", "State Distributor"]
		status: DF.Literal["Pending", "Approved", "Rejected"]
		total_commission_earned: DF.Currency
		total_onboarded: DF.Int
		upi_id: DF.Data | None
	# end: auto-generated types

	pass
