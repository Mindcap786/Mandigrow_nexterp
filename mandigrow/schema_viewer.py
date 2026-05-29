import frappe

def get_schema():
    doctypes = ["Item", "Mandi Arrival", "Mandi Lot", "Mandi Sale", "Mandi Sale Item", "Mandi Contact"]
    for dt in doctypes:
        if frappe.db.exists("DocType", dt):
            print(f"\n--- {dt} ---")
            meta = frappe.get_meta(dt)
            for d in meta.fields:
                print(f"{d.fieldname} ({d.fieldtype}) - {d.label} [Options: {d.options}]")
        else:
            print(f"\n--- {dt} DOES NOT EXIST ---")
