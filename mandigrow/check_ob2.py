import frappe
def run():
    jes = frappe.get_all("Journal Entry", filters={"voucher_type": "Opening Entry"}, limit=1)
    if jes:
        gls = frappe.get_all("GL Entry", filters={"voucher_no": jes[0].name}, fields=["is_opening"])
        print("GL Entries is_opening:", gls)
    else:
        print("No Opening Entry found")
run()
