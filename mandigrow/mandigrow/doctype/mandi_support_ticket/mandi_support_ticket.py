# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class MandiSupportTicket(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		admin_notes: DF.Text | None
		message: DF.Text
		organization_id: DF.Link
		status: DF.Literal["open", "in_progress", "resolved", "closed"]
		subject: DF.Data | None
		ticket_type: DF.Literal["support", "feature_request", "billing"]
		user_id: DF.Data | None
	# end: auto-generated types

	pass
