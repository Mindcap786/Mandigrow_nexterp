import frappe
def run():
    meta = frappe.get_meta("Mandi Sale")
    f = meta.get_field("paymentmode")
    print(f"paymentmode options: {f.options}")
run()
