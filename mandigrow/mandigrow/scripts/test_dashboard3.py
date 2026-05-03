import frappe
def execute():
    from mandigrow.api import get_dashboard_data
    frappe.set_user("Administrator")
    frappe.session.user = "ssb@gmail.com"
    try:
        data = get_dashboard_data()
        print("Success! Recent activity count:", len(data['recentActivity']))
    except Exception as e:
        print("Error:", e)
