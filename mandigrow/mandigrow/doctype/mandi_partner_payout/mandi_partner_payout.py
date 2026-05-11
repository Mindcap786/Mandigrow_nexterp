# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiPartnerPayout(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		commission_amount: DF.Currency
		organization: DF.Link
		partner: DF.Link
		payment_date: DF.Date | None
		payout_month: DF.Literal["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
		payout_year: DF.Data
		status: DF.Literal["Unpaid", "Paid"]
		subscription_amount: DF.Currency
		transaction_reference: DF.Data | None
	# end: auto-generated types

	pass
