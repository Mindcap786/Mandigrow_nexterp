import frappe
from mandigrow.logic.automation import _tag_gl_entries

def fix_je():
    frappe.init(site="mandigrow.localhost")
    frappe.connect()
    
    je_name = "ACC-JV-2026-00253"
    sale_name = "SALE-ORG00002-2026-00037"
    
    je = frappe.get_doc("Journal Entry", je_name)
    if je.docstatus == 0:
        je.flags.ignore_permissions = True
        je.submit()
        print(f"Submitted {je.name}")
        
    _tag_gl_entries(je.name, "Mandi Sale", sale_name)
    frappe.db.commit()

if __name__ == "__main__":
    fix_je()
