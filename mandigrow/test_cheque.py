import frappe
from mandigrow.mandigrow.logic.automation import _sale_status

def test():
    print("Cleared Cheque (Partial):", _sale_status(500, 1000, "2026-04-30", "cheque", True))
    print("Uncleared Cheque (Partial):", _sale_status(500, 1000, "2026-04-30", "cheque", False))
    print("Cleared Cheque (Full):", _sale_status(1000, 1000, "2026-04-30", "cheque", True))
    print("Uncleared Cheque (Full):", _sale_status(1000, 1000, "2026-04-30", "cheque", False))
