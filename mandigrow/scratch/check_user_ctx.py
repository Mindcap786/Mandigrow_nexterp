import frappe
from mandigrow.mandigrow.api import get_full_user_context
def run():
    # Mock user for testing if needed, or just run for current
    # But current might be Administrator in bench execute
    # Let's try to get shauddin's context
    frappe.set_user("shauddin@shauddin.com")
    ctx = get_full_user_context()
    print(f"Context: {ctx}")
run()
