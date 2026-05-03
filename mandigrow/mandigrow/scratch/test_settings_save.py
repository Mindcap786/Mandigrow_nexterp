import frappe
from mandigrow.api import update_settings

frappe.init(site="mandigrow.localhost")
frappe.connect()

try:
    frappe.set_user("Administrator")
    
    # We will pretend the org is ORG00001
    frappe.session.user = "Administrator" # this might not have a linked user org directly in the script, so let's mock _get_user_org
    
    # Let's directly call the doc.meta.has_field
    doc = frappe.get_doc("Mandi Organization", "ORG00001")
    print("Has market_fee_percent:", doc.meta.has_field("market_fee_percent"))
    print("Has organization_name:", doc.meta.has_field("organization_name"))
    print("Has mandi_license:", doc.meta.has_field("mandi_license")) # this is probably not there!
    
    doc.market_fee_percent = 2.5
    doc.save()
    frappe.db.commit()
    print("Saved successfully!")
except Exception as e:
    print("Error:", e)
finally:
    frappe.destroy()
