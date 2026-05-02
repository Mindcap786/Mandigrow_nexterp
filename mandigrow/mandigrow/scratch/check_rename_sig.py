import frappe
from inspect import signature

def run():
    print(signature(frappe.rename_doc))

if __name__ == "__main__":
    run()
