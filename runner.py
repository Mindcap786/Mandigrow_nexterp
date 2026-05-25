import frappe
from mandigrow.mandigrow.fix_ledger import fix_paid_amounts

def execute():
    fix_paid_amounts()
