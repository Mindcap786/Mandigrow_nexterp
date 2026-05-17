import frappe

def test():
    frappe.init(site="mandigrow.local")
    frappe.connect()
    print("Connected")
    # let's see if we can find the API
    pass
test()
