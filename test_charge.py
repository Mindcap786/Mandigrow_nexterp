import frappe
frappe.init(site="mandigrow.com")
frappe.connect()
from mandigrow.api import charge_crate_to_ledger_v2
try:
    print(charge_crate_to_ledger_v2("CRISL-2026-00016"))
except Exception as e:
    import traceback
    traceback.print_exc()
