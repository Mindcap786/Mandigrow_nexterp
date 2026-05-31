import frappe
from mandigrow.mandigrow.api import _get_or_create_temporary_opening_account

def run_test():
    try:
        res = _get_or_create_temporary_opening_account("ssb")
        print("Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()
