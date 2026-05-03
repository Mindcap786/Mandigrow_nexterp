import frappe
from mandigrow.api import confirm_sale_transaction
from mandigrow.mandigrow.logic.automation import _sale_status

def run():
    print("--- Testing logic ---\n")
    print(f"Cash full:    {_sale_status(1000, 1000, '2026-05-01', 'cash', True)}")
    print(f"Cash partial: {_sale_status(500, 1000, '2026-05-01', 'cash', True)}")
    print(f"Cash none:    {_sale_status(0, 1000, '2026-05-01', 'cash', True)}")
    print("")
    print(f"Udhaar none:  {_sale_status(0, 1000, '2026-05-01', 'credit', True)}")
    print(f"Udhaar part:  {_sale_status(500, 1000, '2026-05-01', 'credit', True)}")
    print(f"Udhaar full:  {_sale_status(1000, 1000, '2026-05-01', 'credit', True)}")
    print("")
    print(f"Cheque clr'd: {_sale_status(1000, 1000, '2026-05-01', 'cheque', True)}")
    print(f"Cheque pend:  {_sale_status(1000, 1000, '2026-05-01', 'cheque', False)}")
