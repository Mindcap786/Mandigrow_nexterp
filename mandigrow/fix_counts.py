import frappe

def run():
    partners = frappe.get_all("Mandi Partner Profile", fields=["name"])
    for p in partners:
        count = frappe.db.count("Mandi Organization", {"partner": p.name})
        frappe.db.set_value("Mandi Partner Profile", p.name, "total_onboarded", count, update_modified=False)
    frappe.db.commit()
    print("Successfully recalculated all partner onboarding counts.")
