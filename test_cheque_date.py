import frappe
frappe.init(site="mandigrow.com")
frappe.connect()

from mandigrow.mandigrow.finance.cheque_api import get_reconciliation_data

res1 = get_reconciliation_data(date_from="2026-05-02", date_to="2026-08-30", status_filter="Pending")
print("Pending to 30/08:", res1['summary']['total_pending'])

res2 = get_reconciliation_data(date_from="2026-05-02", date_to="2026-08-29", status_filter="Pending")
print("Pending to 29/08:", res2['summary']['total_pending'])
