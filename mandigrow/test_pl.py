import frappe
from mandigrow.api import get_trading_pl
def run():
    frappe.session.user = "saif@syedmandi.com"
    # mock _get_user_org
    import mandigrow.api
    mandigrow.api._get_user_org = lambda: "ORG-00001"
    
    try:
        res = get_trading_pl("2026-04-23", "2026-05-23")
        print("SUCCESS")
        print(len(res.get("items", [])))
    except Exception as e:
        import traceback
        traceback.print_exc()
