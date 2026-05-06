# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

"""
Subscription Guard — Centralized Entitlement Enforcement Module
================================================================

This is the SINGLE SOURCE OF TRUTH for all subscription-related access checks.
Every write API in api.py MUST call enforce_active_subscription() before
performing any data mutation.

Architecture:
    enforce_active_subscription()  → Blocks writes for locked/expired/suspended orgs
    enforce_seat_limit()           → Blocks user creation when seat cap is reached
    get_subscription_state()       → Pure read — returns current status, plan, limits
    log_subscription_event()       → Audit trail for every plan/status change
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, get_datetime, date_diff, add_days, cint


# ─── EXCEPTIONS ──────────────────────────────────────────────────────────────

class SubscriptionExpiredError(frappe.ValidationError):
    """Raised when a locked/expired tenant attempts a write operation."""
    http_status_code = 403


class SeatLimitExceededError(frappe.ValidationError):
    """Raised when an org tries to add more users than the plan allows."""
    http_status_code = 403


# ─── STATUS SETS ─────────────────────────────────────────────────────────────

# Statuses where data writes (gate entry, sale, purchase, contact) are ALLOWED
WRITE_ALLOWED_STATUSES = {"trial", "active", "grace_period"}

# Statuses where ALL access is blocked (reads may still be allowed for data export)
FULLY_BLOCKED_STATUSES = {"suspended", "expired", "locked"}


# ─── CORE: GET SUBSCRIPTION STATE ───────────────────────────────────────────

def get_subscription_state(org_id: str) -> dict:
    """
    Pure read function — returns the canonical subscription state for an org.
    Never crashes. Always returns a dict with safe defaults.

    Returns:
        {
            "status": str,
            "is_active": bool,
            "is_locked": bool,
            "is_write_allowed": bool,
            "plan": str,
            "plan_doc": dict or None,
            "billing_cycle": str,
            "days_left": int,
            "expiry_date": str or None,
            "grace_period_days": int,
            "grace_period_ends_at": str or None,
            "max_users": int,
            "current_user_count": int,
            "seats_remaining": int,
        }
    """
    default = {
        "status": "active",
        "is_active": True,
        "is_locked": False,
        "is_write_allowed": True,
        "plan": "starter",
        "plan_doc": None,
        "billing_cycle": "monthly",
        "days_left": 999,
        "expiry_date": None,
        "grace_period_days": 7,
        "grace_period_ends_at": None,
        "max_users": 2,
        "current_user_count": 0,
        "seats_remaining": 2,
    }

    if not org_id or org_id == "HQ":
        return default

    try:
        org = frappe.get_doc("Mandi Organization", org_id)
    except frappe.DoesNotExistError:
        return default
    except Exception:
        return default

    # ── Resolve plan limits ──────────────────────────────────────────────
    plan_name = getattr(org, "plan_id", None) or getattr(org, "subscription_tier", None) or "starter"
    plan_doc = None
    max_users = 2  # safe default

    try:
        if plan_name and frappe.db.exists("App Plan", plan_name):
            plan_doc = frappe.get_doc("App Plan", plan_name)
            max_users = cint(getattr(plan_doc, "max_users", 2)) or 2
    except Exception:
        pass

    # Per-tenant override takes priority
    max_users_override = cint(getattr(org, "max_users_override", 0))
    if max_users_override == -1:
        max_users = 999999  # unlimited
    elif max_users_override > 0:
        max_users = max_users_override

    # ── Current user count ───────────────────────────────────────────────
    try:
        current_user_count = frappe.db.count("User", filters={
            "mandi_organization": org_id,
            "enabled": 1,
            "name": ["!=", "Administrator"]
        })
    except Exception:
        current_user_count = 0

    # ── Subscription status computation ──────────────────────────────────
    status = getattr(org, "status", None) or "trial"
    billing_cycle = getattr(org, "billing_cycle", None) or "monthly"
    grace_period_days = cint(getattr(org, "grace_period_days", 7)) or 7

    # Determine the effective expiry date
    # For active/paid plans, use subscription_end_date; for trials, use trial_ends_at
    expiry_date_str = None
    if status in ("active", "grace_period", "locked", "expired"):
        expiry_date_str = getattr(org, "subscription_end_date", None) or getattr(org, "trial_ends_at", None)
    else:
        expiry_date_str = getattr(org, "trial_ends_at", None)

    days_left = 999
    grace_ends_at = getattr(org, "grace_period_ends_at", None)
    is_locked = False

    if expiry_date_str:
        try:
            expiry_date = get_datetime(expiry_date_str)
            now = now_datetime()
            days_left = date_diff(expiry_date, now)

            # Compute grace end if not set
            if not grace_ends_at:
                grace_ends_at = str(add_days(expiry_date, grace_period_days))

            grace_end_dt = get_datetime(grace_ends_at)

            if now > grace_end_dt:
                status = "locked"
                is_locked = True
            elif now > expiry_date:
                status = "grace_period"
        except Exception:
            pass  # Parse failure — treat as active

    is_active = status in WRITE_ALLOWED_STATUSES
    is_write_allowed = status in WRITE_ALLOWED_STATUSES

    return {
        "status": status,
        "is_active": is_active,
        "is_locked": is_locked,
        "is_write_allowed": is_write_allowed,
        "plan": plan_name,
        "plan_doc": plan_doc.as_dict() if plan_doc else None,
        "billing_cycle": billing_cycle,
        "days_left": days_left,
        "expiry_date": str(expiry_date_str) if expiry_date_str else None,
        "grace_period_days": grace_period_days,
        "grace_period_ends_at": str(grace_ends_at) if grace_ends_at else None,
        "max_users": max_users,
        "current_user_count": current_user_count,
        "seats_remaining": max(0, max_users - current_user_count),
    }


# ─── ENFORCEMENT: ACTIVE SUBSCRIPTION ───────────────────────────────────────

def enforce_active_subscription(org_id: str = None):
    """
    Call at the TOP of every write API endpoint (gate entry, sale, arrival, etc.).
    Raises SubscriptionExpiredError if the tenant's subscription is not writable.

    Usage:
        from mandigrow.mandigrow.logic.subscription_guard import enforce_active_subscription
        enforce_active_subscription()  # auto-detects org from current user
    """
    if not org_id:
        org_id = _get_current_org()

    if not org_id or org_id == "HQ":
        return  # Super admin or unlinked user — no enforcement

    state = get_subscription_state(org_id)

    if not state["is_write_allowed"]:
        status = state["status"]
        msg_map = {
            "suspended": _("Your organization has been suspended. Please contact support."),
            "expired": _("Your subscription has expired. Please renew to continue."),
            "locked": _("Your subscription has been locked due to non-payment. Please renew."),
        }
        msg = msg_map.get(status, _("Your subscription does not allow this operation."))

        # Log the blocked attempt for audit
        log_subscription_event(
            org_id=org_id,
            action="login_blocked",
            old_value=status,
            new_value="write_blocked",
            notes=f"Write attempt blocked. Status: {status}. User: {frappe.session.user}"
        )

        frappe.throw(msg, SubscriptionExpiredError)


# ─── ENFORCEMENT: SEAT LIMIT ────────────────────────────────────────────────

def enforce_seat_limit(org_id: str = None):
    """
    Call before creating a new user in provision_team_member.
    Raises SeatLimitExceededError if the org has reached its user capacity.

    Usage:
        from mandigrow.mandigrow.logic.subscription_guard import enforce_seat_limit
        enforce_seat_limit(org_id)
    """
    if not org_id:
        org_id = _get_current_org()

    if not org_id or org_id == "HQ":
        return

    state = get_subscription_state(org_id)

    if state["seats_remaining"] <= 0:
        plan = state["plan"]
        max_u = state["max_users"]
        current_u = state["current_user_count"]
        frappe.throw(
            _(
                "Seat limit reached. Your {0} plan allows {1} users and you currently have {2}. "
                "Please upgrade your plan or contact support to add more seats."
            ).format(plan, max_u, current_u),
            SeatLimitExceededError
        )


# ─── AUDIT LOGGING ──────────────────────────────────────────────────────────

def log_subscription_event(
    org_id: str,
    action: str,
    old_value: str = "",
    new_value: str = "",
    notes: str = "",
    changed_by: str = None,
):
    """
    Creates an immutable audit log entry for subscription state changes.
    Never crashes — wrapped in try/except so it can be called from any context.
    """
    try:
        if not frappe.db.table_exists("Subscription Audit Log"):
            return  # DocType not yet migrated — skip silently

        frappe.get_doc({
            "doctype": "Subscription Audit Log",
            "organization": org_id,
            "action": action,
            "old_value": str(old_value) if old_value else "",
            "new_value": str(new_value) if new_value else "",
            "notes": notes or "",
            "changed_by": changed_by or frappe.session.user,
            "timestamp": now_datetime(),
        }).insert(ignore_permissions=True)
        # NOTE: We do NOT commit here — the calling function's commit covers it
    except Exception as e:
        # NEVER crash the parent operation for an audit log failure
        frappe.log_error(f"Subscription audit log failed: {e}", "Subscription Audit Log")


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _get_current_org() -> str:
    """Returns the current user's organization ID, or None."""
    if frappe.session.user in ("Administrator", "Guest"):
        return None

    try:
        from mandigrow.mandigrow.logic.tenancy import is_super_admin
        if is_super_admin():
            return None
    except Exception:
        pass

    try:
        return frappe.db.get_value("User", frappe.session.user, "mandi_organization")
    except Exception:
        return None
