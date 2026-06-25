import frappe

def execute():
    cols = [
        ("mandi_tour_tier1_done", "tinyint(1)", "0"),
        ("mandi_tour_tier2_done", "tinyint(1)", "0"),
        ("mandi_tour_tier3_done", "tinyint(1)", "0"),
    ]
    for col, col_type, default in cols:
        if not frappe.db.has_column("User", col):
            frappe.db.sql(
                f"ALTER TABLE `tabUser` ADD COLUMN `{col}` {col_type} NOT NULL DEFAULT {default}"
            )
            print(f"  ✅ Added column: {col}")
        else:
            print(f"  ⏭  Already exists: {col}")
    frappe.db.commit()
    print("Tour column migration complete.")
