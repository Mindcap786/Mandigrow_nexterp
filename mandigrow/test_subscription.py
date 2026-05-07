import frappe
from mandigrow.api import provision_team_member
from mandigrow.mandigrow.logic.subscription_guard import SeatLimitExceededError, SubscriptionExpiredError
from mandigrow.mandigrow.logic.subscription_guard import get_subscription_state

def test():
    frappe.logger().info("Starting subscription tests")
    orgs = frappe.db.get_list("Mandi Organization", limit=1)
    if not orgs:
        print("No orgs found to test")
        return
    org_id = orgs[0].name
    print(f"Testing on Org: {org_id}")

    # Set plan limit to 1
    frappe.db.set_value("Mandi Organization", org_id, "max_users_override", 1)
    frappe.db.commit()

    users = frappe.db.count("User", {"mandi_organization": org_id, "enabled": 1, "name": ["!=", "Administrator"]})
    print(f"Current users: {users}")

    # Impersonate a non-admin to test authorization
    # For test script context, we use frappe.set_user
    user = frappe.db.get_value("User", {"mandi_organization": org_id, "enabled": 1, "name": ["!=", "Administrator"]})
    if user:
        frappe.set_user(user)
    else:
        print("No user found in org, using Administrator (which bypasses checks)")

    # Test Seat Limit
    try:
        # We try to add a new user. If users >= 1, this should fail.
        provision_team_member(f"test_seat_{frappe.utils.generate_hash()}@example.com", "Test Seat", organization_id=org_id)
        if users >= 1 and user:
            print("FAILED: Seat limit check did not block user creation!")
        else:
            print("Successfully added user (either first user or admin bypass)")
    except SeatLimitExceededError as e:
        print(f"SUCCESS: Seat limit correctly enforced! Error: {e}")
    except Exception as e:
        print(f"Seat limit test exception: {e}")

    # Test Subscription Write Block
    # Suspend the org
    frappe.set_user("Administrator")
    frappe.db.set_value("Mandi Organization", org_id, "status", "suspended")
    frappe.db.commit()
    
    if user:
        frappe.set_user(user)

    from mandigrow.api import create_gate_entry
    try:
        create_gate_entry(vehicle_number="TEST1234", source="Delhi")
        if user:
            print("FAILED: Write block did not prevent gate entry!")
        else:
            print("Gate entry succeeded (admin bypass)")
    except SubscriptionExpiredError as e:
        print(f"SUCCESS: Write block correctly enforced! Error: {e}")
    except Exception as e:
        print(f"Write block test exception: {e}")

    # Cleanup
    frappe.set_user("Administrator")
    frappe.db.set_value("Mandi Organization", org_id, "status", "active")
    frappe.db.set_value("Mandi Organization", org_id, "max_users_override", 0)
    frappe.db.commit()
    print("Tests completed and state restored.")

