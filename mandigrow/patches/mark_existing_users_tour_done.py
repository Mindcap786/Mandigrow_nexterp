import frappe

def execute():
    users = ['mindcap786@gmail.com', 'noor786@gmail.com', 'ssb@gmail.com', 'tariq786@gmail.com']
    frappe.db.sql(
        "UPDATE `tabUser` SET mandi_tour_tier1_done=1 WHERE name IN %(users)s",
        {"users": users}
    )
    frappe.db.commit()
    print(f"Marked tour done for {len(users)} existing users.")
