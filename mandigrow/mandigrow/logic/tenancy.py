"""
MandiGrow — Shared-Database Multi-Tenant Isolation Layer
=========================================================

This module is the SINGLE SOURCE OF TRUTH for all tenant-isolation logic.
Every permission check, query filter, and ownership validation flows through here.

Architecture:
  - One Frappe site, one database, many Mandi Organizations.
  - Every tenant-owned document carries an `organization_id` field.
  - `User.mandi_organization` links each user to exactly one org.
  - Administrator bypasses all tenant filters (super-admin).

Hooks wired in hooks.py:
  - permission_query_conditions → injects WHERE clause on every get_list / search
  - has_permission → blocks single-document access across tenants
"""

import frappe
from frappe import _


# ── Tenant-owned DocTypes ──────────────────────────────────────────────────────
# Only DocTypes with an `organization_id` field need tenant filtering.
# Child tables (Mandi Lot, Mandi Sale Item) inherit isolation from their parent.
# Mandi Organization itself is the tenant master — not filtered.
# Mandi Settings is a Single DocType — handled separately via org-level fields.

TENANT_DOCTYPES = frozenset([
    "Mandi Arrival",
    "Mandi Contact",
    "Mandi Gate Entry",
    "Mandi Sale",
    "Mandi Storage Location",
])


# ── Core helpers ───────────────────────────────────────────────────────────────

def is_super_admin(user=None):
    """True for the literal Administrator account or the platform owner."""
    user = user or frappe.session.user
    return user in ["Administrator", "mindcap786@gmail.com"]


def get_current_org_or_none():
    """Return the organization_id for the current user, or None.

    Safe to call in contexts where no org is expected (Guest, signup flows).
    """
    user = frappe.session.user
    if not user or user == "Guest":
        return None

    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if org_id:
        return org_id

    # Administrator fallback: pick first org (for bench console / admin scripts)
    if is_super_admin(user):
        return frappe.db.get_value("Mandi Organization", {}, "name", order_by="creation asc")

    return None


def get_current_org():
    """Return the organization_id for the current user.

    Raises frappe.PermissionError if the user has no organization linked.
    Use this in every API endpoint that must be tenant-scoped.
    """
    org_id = get_current_org_or_none()
    if not org_id:
        frappe.throw(
            _("Your account is not linked to any organization. Contact your administrator."),
            frappe.PermissionError,
        )
    return org_id


def enforce_org_match(doc):
    """Verify that doc.organization_id matches the current user's org.

    Call this before any write/delete operation on a tenant-owned document.
    Raises frappe.PermissionError on mismatch. Super-admin bypasses.
    """
    if is_super_admin():
        return

    user_org = get_current_org()
    doc_org = getattr(doc, "organization_id", None)

    if not doc_org:
        # Document has no org — might be legacy data. Allow super-admin only.
        frappe.throw(
            _("This document has no organization assigned and cannot be accessed."),
            frappe.PermissionError,
        )

    if doc_org != user_org:
        frappe.throw(
            _("You do not have permission to access this document."),
            frappe.PermissionError,
        )


def enforce_org_match_by_name(doctype, name):
    """Verify ownership by doctype + name without loading full doc.

    More efficient than enforce_org_match when you only need the check.
    """
    if is_super_admin():
        return

    user_org = get_current_org()
    doc_org = frappe.db.get_value(doctype, name, "organization_id")

    if not doc_org or doc_org != user_org:
        frappe.throw(
            _("You do not have permission to access this document."),
            frappe.PermissionError,
        )


def add_org_filter(filters, org_id=None):
    """Inject organization_id into a filter dict.

    Works with both dict and list-of-lists filter formats.
    """
    org_id = org_id or get_current_org()

    if isinstance(filters, dict):
        filters["organization_id"] = org_id
    elif isinstance(filters, list):
        filters.append(["organization_id", "=", org_id])
    else:
        filters = {"organization_id": org_id}

    return filters


# ── permission_query_conditions ────────────────────────────────────────────────
# These functions are called by Frappe on EVERY get_list, get_all, link field
# search, report query, and desk list view. They return a SQL WHERE clause
# fragment that is injected into the query.
#
# This is the NUCLEAR OPTION for tenant isolation — it makes it physically
# impossible to see another tenant's data in any list context.

def _build_pqc(doctype, user):
    """Build the SQL WHERE clause for a tenant-owned DocType.

    Returns:
      - Empty string for Administrator (see all data)
      - A WHERE clause like `tabMandi Contact.organization_id = 'ORG-00002'`
      - A clause that returns no rows if user has no org (fail-closed)
    """
    if is_super_admin(user):
        return ""

    org_id = frappe.db.get_value("User", user, "mandi_organization")
    if not org_id:
        # Fail closed: user has no org → see nothing
        return "1=0"

    # Use parameterized value to prevent SQL injection
    escaped = frappe.db.escape(org_id)
    return f"`tab{doctype}`.organization_id = {escaped}"


# Individual PQC functions — one per DocType (required by Frappe's hook signature)

def get_pqc_arrival(user):
    return _build_pqc("Mandi Arrival", user)

def get_pqc_contact(user):
    return _build_pqc("Mandi Contact", user)

def get_pqc_gate_entry(user):
    return _build_pqc("Mandi Gate Entry", user)

def get_pqc_sale(user):
    return _build_pqc("Mandi Sale", user)

def get_pqc_storage_location(user):
    return _build_pqc("Mandi Storage Location", user)


# ── has_permission ─────────────────────────────────────────────────────────────
# Called by Frappe when a user tries to open/read/write/delete a SINGLE document.
# This catches direct access by document name (e.g., API call with a known ID).

def check_has_permission(doc, ptype=None, user=None):
    """Universal has_permission hook for all tenant-owned DocTypes.

    Returns True if user may access the document, False otherwise.
    Frappe calls this with the doc object and the permission type
    (read, write, create, delete, submit, cancel, amend).
    """
    user = user or frappe.session.user

    if is_super_admin(user):
        return True

    # For 'create' permission, we don't have a doc.organization_id yet.
    # The doc_events.validate hook will stamp the org before save.
    if ptype == "create":
        return True

    doc_org = getattr(doc, "organization_id", None)
    if not doc_org:
        # Legacy document without org — deny non-admin access
        return False

    user_org = frappe.db.get_value("User", user, "mandi_organization")
    if not user_org:
        return False

    return doc_org == user_org


# ── Auto-stamp organization_id on create ───────────────────────────────────────
# This validate hook ensures every new document gets the correct organization_id.

def stamp_organization_id(doc, method=None):
    """Validate hook: auto-set organization_id on new tenant-owned documents.

    If the user didn't supply an org (or supplied a wrong one), this corrects it.
    """
    if doc.doctype not in TENANT_DOCTYPES:
        return

    if is_super_admin() and doc.organization_id:
        # Admin explicitly set an org — respect it
        return

    user_org = get_current_org_or_none()
    if user_org:
        doc.organization_id = user_org
