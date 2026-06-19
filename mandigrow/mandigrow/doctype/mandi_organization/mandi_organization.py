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
		billing_cycle: DF.Literal["monthly", "yearly"]
		brand_color: DF.Color | None
		city: DF.Data | None
		compliance_status: DF.Literal["Compliant", "Over_Limit_Grace", "Over_Limit_Restricted"]
		crate_ageing_days: DF.Int
		enable_crate_tracking: DF.Check
		erp_company: DF.Link | None
		google_translate_api_key: DF.Password | None
		grace_period_days: DF.Int
		grace_period_ends_at: DF.Datetime | None
		gstin: DF.Data | None
		invoice_language: DF.Literal["", "te", "hi", "ta", "kn", "ml", "bn", "gu", "ur"]
		is_active: DF.Check
		last_status_change: DF.Datetime | None
		max_users_override: DF.Int
		onboarding_partner: DF.Link | None
		organization_name: DF.Data
		payment_settings: DF.JSON | None
		phone: DF.Data | None
		plan_id: DF.Link | None
		status: DF.Literal["trial", "active", "grace_period", "suspended", "expired", "locked"]
		subscription_end_date: DF.Datetime | None
		subscription_start_date: DF.Date | None
		subscription_tier: DF.Literal["starter", "standard", "professional", "enterprise"]
		trial_ends_at: DF.Datetime | None
	# end: auto-generated types

	pass
