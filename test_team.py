import frappe
from mandigrow.mandigrow.api import get_team_members
import json

def run_test():
    frappe.set_user("mindcap786@gmail.com")
    print("Calling get_team_members...")
    try:
        members = get_team_members()
        print("MEMBERS:")
        for m in members:
            print(m)
    except Exception as e:
        import traceback
        traceback.print_exc()
