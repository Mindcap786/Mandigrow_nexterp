# Copyright (c) 2026, MindT Private Limited and contributors
# For license information, please see license.txt

"""
Scheduled Tasks — Subscription Lifecycle Automation
====================================================

These tasks run automatically via Frappe's scheduler (configured in hooks.py).
They handle the subscription state machine transitions that cannot rely on
user-triggered actions.

State Machine:
    trial → [expiry] → grace_period → [grace end] → locked
    active → [expiry] → grace_period → [grace end] → locked

    At any point: admin can manually → suspend / reactivate
"""

import frappe
from frappe.utils import now_datetime, get_datetime, add_days, date_diff


def daily():
    """
    Main daily entry point — called by Frappe scheduler.
    Executes all subscription lifecycle checks in correct order.
    """
    frappe.logger("subscription").info("[tasks.daily] Starting daily subscription lifecycle check")

    try:
        transition_expired_to_grace()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "tasks.daily: transition_expired_to_grace failed")

    try:
        transition_grace_to_locked()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "tasks.daily: transition_grace_to_locked failed")

    try:
        send_expiry_notifications()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "tasks.daily: send_expiry_notifications failed")

    frappe.logger("subscription").info("[tasks.daily] Completed daily subscription lifecycle check")


def transition_expired_to_grace():
    """
    Find tenants whose subscription/trial has expired but are still marked as
    'trial' or 'active'. Transition them to 'grace_period'.

    Scope:
        - status IN ('trial', 'active')
        - effective expiry date < now
        - grace_period_ends_at is either NULL or > now
    """
    from mandigrow.mandigrow.logic.subscription_guard import log_subscription_event

    now = now_datetime()

    # Find all trial tenants with expired trial_ends_at
    trial_expired = frappe.get_all("Mandi Organization", filters={
        "status": "trial",
        "trial_ends_at": ["<", now],
    }, fields=["name", "trial_ends_at", "grace_period_days"])

    # Find active tenants with expired subscription_end_date
    active_expired = []
    try:
        active_expired = frappe.get_all("Mandi Organization", filters={
            "status": "active",
            "subscription_end_date": ["<", now],
            "subscription_end_date": ["is", "set"],
        }, fields=["name", "subscription_end_date", "grace_period_days"])
    except Exception:
        pass  # subscription_end_date column may not exist yet

    all_expired = trial_expired + active_expired
    transitioned = 0

    for org in all_expired:
        org_id = org["name"]
        grace_days = org.get("grace_period_days") or 7
        expiry = org.get("subscription_end_date") or org.get("trial_ends_at")

        if not expiry:
            continue

        try:
            expiry_dt = get_datetime(expiry)
            grace_end = add_days(expiry_dt, grace_days)

            # Only transition if still within grace period
            if now <= grace_end:
                frappe.db.set_value("Mandi Organization", org_id, {
                    "status": "grace_period",
                    "grace_period_ends_at": grace_end,
                    "last_status_change": now,
                }, update_modified=False)

                log_subscription_event(
                    org_id=org_id,
                    action="grace_transition",
                    old_value="trial" if org.get("trial_ends_at") else "active",
                    new_value="grace_period",
                    notes=f"Auto-transitioned by scheduler. Grace ends: {grace_end}",
                    changed_by="System"
                )
                transitioned += 1
            else:
                # Already past grace — go straight to locked
                frappe.db.set_value("Mandi Organization", org_id, {
                    "status": "locked",
                    "is_active": 0,
                    "grace_period_ends_at": grace_end,
                    "last_status_change": now,
                }, update_modified=False)

                log_subscription_event(
                    org_id=org_id,
                    action="lock_transition",
                    old_value="trial" if org.get("trial_ends_at") else "active",
                    new_value="locked",
                    notes=f"Auto-locked by scheduler. Expiry: {expiry}, Grace end: {grace_end}",
                    changed_by="System"
                )
                transitioned += 1

        except Exception:
            frappe.log_error(frappe.get_traceback(), f"Grace transition failed for {org_id}")

    if transitioned:
        frappe.db.commit()

    frappe.logger("subscription").info(f"[transition_expired_to_grace] Transitioned {transitioned} orgs")


def transition_grace_to_locked():
    """
    Find tenants in 'grace_period' whose grace_period_ends_at has passed.
    Transition them to 'locked' and set is_active=0.
    """
    from mandigrow.mandigrow.logic.subscription_guard import log_subscription_event

    now = now_datetime()
    locked_count = 0

    grace_orgs = frappe.get_all("Mandi Organization", filters={
        "status": "grace_period",
    }, fields=["name", "grace_period_ends_at", "grace_period_days",
               "trial_ends_at", "subscription_end_date"])

    for org in grace_orgs:
        org_id = org["name"]
        grace_end = org.get("grace_period_ends_at")

        # If grace_period_ends_at not set, compute it
        if not grace_end:
            expiry = org.get("subscription_end_date") or org.get("trial_ends_at")
            grace_days = org.get("grace_period_days") or 7
            if expiry:
                grace_end = add_days(get_datetime(expiry), grace_days)
            else:
                # No expiry date at all — skip
                continue

        try:
            grace_end_dt = get_datetime(grace_end)
            if now > grace_end_dt:
                frappe.db.set_value("Mandi Organization", org_id, {
                    "status": "locked",
                    "is_active": 0,
                    "last_status_change": now,
                }, update_modified=False)

                log_subscription_event(
                    org_id=org_id,
                    action="lock_transition",
                    old_value="grace_period",
                    new_value="locked",
                    notes=f"Auto-locked by scheduler. Grace ended: {grace_end}",
                    changed_by="System"
                )
                locked_count += 1
        except Exception:
            frappe.log_error(frappe.get_traceback(), f"Lock transition failed for {org_id}")

    if locked_count:
        frappe.db.commit()

    frappe.logger("subscription").info(f"[transition_grace_to_locked] Locked {locked_count} orgs")


def send_expiry_notifications():
    """
    Send email/notification alerts for tenants approaching expiry.

    Notification tiers:
        - 7 days before expiry: "Your subscription expires in 7 days"
        - 3 days before expiry: "Urgent: 3 days remaining"
        - 1 day before expiry: "Final notice: expires tomorrow"
        - Grace period: "Your access will be suspended in X days"
    """
    now = now_datetime()
    notification_windows = [7, 3, 1]

    for days_before in notification_windows:
        target_date = add_days(now, days_before)

        # Trial tenants expiring in exactly `days_before` days
        expiring_trials = frappe.get_all("Mandi Organization", filters={
            "status": "trial",
            "trial_ends_at": ["between", [
                add_days(target_date, -0.5),  # 12 hours window to avoid missing due to time
                add_days(target_date, 0.5),
            ]],
        }, fields=["name", "organization_name", "trial_ends_at"])

        for org in expiring_trials:
            _send_expiry_email(org, days_before, "trial")

        # Active tenants with subscription_end_date expiring
        try:
            expiring_active = frappe.get_all("Mandi Organization", filters={
                "status": "active",
                "subscription_end_date": ["between", [
                    add_days(target_date, -0.5),
                    add_days(target_date, 0.5),
                ]],
            }, fields=["name", "organization_name", "subscription_end_date"])

            for org in expiring_active:
                _send_expiry_email(org, days_before, "active")
        except Exception:
            pass  # subscription_end_date column may not exist

    # Grace period notifications
    grace_orgs = frappe.get_all("Mandi Organization", filters={
        "status": "grace_period",
    }, fields=["name", "organization_name", "grace_period_ends_at"])

    for org in grace_orgs:
        if org.get("grace_period_ends_at"):
            try:
                grace_end = get_datetime(org["grace_period_ends_at"])
                days_until_lock = date_diff(grace_end, now)
                if days_until_lock in (3, 1):
                    _send_expiry_email(org, days_until_lock, "grace_period")
            except Exception:
                pass


def _send_expiry_email(org: dict, days_remaining: int, status_type: str):
    """
    Sends an expiry notification email to the org admin.
    Uses Frappe's built-in email infrastructure.
    """
    org_id = org["name"]
    org_name = org.get("organization_name", org_id)

    # Find the admin user for this org
    admin_email = frappe.db.get_value("User", {
        "mandi_organization": org_id,
        "role_type": "admin",
        "enabled": 1,
    }, "name")

    if not admin_email:
        # Fallback to any active user in the org
        admin_email = frappe.db.get_value("User", {
            "mandi_organization": org_id,
            "enabled": 1,
            "name": ["!=", "Administrator"],
        }, "name")

    if not admin_email:
        return  # No user to notify

    subject_map = {
        "trial": f"MandiGrow: Your free trial expires in {days_remaining} day(s)",
        "active": f"MandiGrow: Your subscription expires in {days_remaining} day(s)",
        "grace_period": f"MandiGrow: URGENT — Account will be locked in {days_remaining} day(s)",
    }

    message_map = {
        "trial": f"""
            <p>Hello,</p>
            <p>Your MandiGrow free trial for <strong>{org_name}</strong> will expire in <strong>{days_remaining} day(s)</strong>.</p>
            <p>To continue using MandiGrow without interruption, please subscribe to a paid plan.</p>
            <p><a href="https://www.mandigrow.com/settings/billing">Subscribe Now →</a></p>
            <p>If you have any questions, please contact us at support@mandigrow.com.</p>
            <br><p>— MandiGrow Team</p>
        """,
        "active": f"""
            <p>Hello,</p>
            <p>Your MandiGrow subscription for <strong>{org_name}</strong> will expire in <strong>{days_remaining} day(s)</strong>.</p>
            <p>Please renew your subscription to maintain uninterrupted access to your data.</p>
            <p><a href="https://www.mandigrow.com/settings/billing">Renew Now →</a></p>
            <br><p>— MandiGrow Team</p>
        """,
        "grace_period": f"""
            <p>Hello,</p>
            <p><strong>URGENT:</strong> Your MandiGrow subscription for <strong>{org_name}</strong> has already expired. You have <strong>{days_remaining} day(s)</strong> of grace period remaining.</p>
            <p>After the grace period ends, your account will be <strong>locked</strong> and you will not be able to access your data until payment is made.</p>
            <p><a href="https://www.mandigrow.com/settings/billing">Pay Now to Restore Access →</a></p>
            <br><p>— MandiGrow Team</p>
        """,
    }

    try:
        frappe.sendmail(
            recipients=[admin_email],
            subject=subject_map.get(status_type, f"MandiGrow: Subscription notice for {org_name}"),
            message=message_map.get(status_type, ""),
            now=True,
        )
        frappe.logger("subscription").info(
            f"[send_expiry_notification] Sent {status_type} notification to {admin_email} for {org_id} ({days_remaining}d)"
        )
    except Exception:
        frappe.log_error(frappe.get_traceback(), f"Expiry notification failed for {org_id}")
