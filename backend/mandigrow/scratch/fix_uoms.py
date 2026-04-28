import frappe

def run():
    standard_units = ["Box", "Crate", "Kgs", "Tons", "Nug", "Pieces", "Carton", "Bunch", "Nos"]
    
    count = 0
    for uom_name in standard_units:
        if not frappe.db.exists("UOM", uom_name):
            doc = frappe.get_doc({
                "doctype": "UOM",
                "uom_name": uom_name,
                "enabled": 1
            })
            doc.insert(ignore_permissions=True)
            count += 1
            
    frappe.db.commit()
    print(f"Created {count} new UOMs")

if __name__ == "__main__":
    run()
