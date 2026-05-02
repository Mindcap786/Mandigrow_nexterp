import frappe
def execute():
    from mandigrow.mandigrow.api import get_dashboard_data
    frappe.set_user("Administrator")
    frappe.session.user = "ssb@gmail.com"
    data = get_dashboard_data()
    for act in data['recentActivity']:
        print(act['type'], act.get('lot'))
