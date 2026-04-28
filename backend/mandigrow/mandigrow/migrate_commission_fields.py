"""
migrate_commission_fields.py
Adds computed commission fields to Mandi Arrival and Mandi Lot DocTypes.
Run via: bench --site mandigrow.localhost execute mandigrow.mandigrow.migrate_commission_fields.run
"""
import frappe


def run():
    """Add commission computed fields to Mandi Arrival and its child Mandi Lot."""
    add_arrival_fields()
    add_lot_fields()
    frappe.db.commit()
    print("✅ Commission fields migrated successfully.")


def add_arrival_fields():
    """Add computed summary fields to Mandi Arrival."""
    if not frappe.db.exists("DocType", "Mandi Arrival"):
        print("Mandi Arrival DocType not found — skipping.")
        return

    arrival = frappe.get_doc("DocType", "Mandi Arrival")
    existing = {f.fieldname for f in arrival.fields}

    new_fields = [
        # ── Section Break ─────────────────────────────────────────────────
        {
            "fieldname": "commission_section",
            "fieldtype": "Section Break",
            "label": "Commission Summary",
            "insert_after": "items",
            "collapsible": 1,
        },
        # ── Computed Totals ───────────────────────────────────────────────
        {
            "fieldname": "total_realized",
            "fieldtype": "Currency",
            "label": "Total Realized (After Less)",
            "read_only": 1,
            "insert_after": "commission_section",
            "description": "Net qty × sale price across all lots (after deductions)",
        },
        {
            "fieldname": "total_commission",
            "fieldtype": "Currency",
            "label": "Total Commission",
            "read_only": 1,
            "insert_after": "total_realized",
            "description": "Mandi's commission = commission% × total_realized",
        },
        {
            "fieldname": "total_expenses",
            "fieldtype": "Currency",
            "label": "Total Charges & Expenses",
            "read_only": 1,
            "insert_after": "total_commission",
            "description": "Hire + Hamali + Other + Packing + Loading + Farmer charges",
        },
        {
            "fieldname": "mandi_total_earnings",
            "fieldtype": "Currency",
            "label": "Mandi Total Earnings",
            "read_only": 1,
            "insert_after": "total_expenses",
            "description": "Commission + Charges (what Mandi earns from this arrival)",
        },
        {
            "fieldname": "net_payable_farmer",
            "fieldtype": "Currency",
            "label": "Net Payable to Farmer/Supplier",
            "read_only": 1,
            "insert_after": "mandi_total_earnings",
            "bold": 1,
            "description": "Realized − Mandi Earnings − Advance (what farmer/supplier should receive)",
        },
    ]

    changed = False
    for field_def in new_fields:
        if field_def["fieldname"] not in existing:
            arrival.append("fields", field_def)
            changed = True
            print(f"  + Added field: {field_def['fieldname']}")

    if changed:
        arrival.save()
        print("✓ Mandi Arrival DocType updated.")
    else:
        print("  (no changes needed for Mandi Arrival)")


def add_lot_fields():
    """Add per-lot computed fields to Mandi Lot (child table)."""
    if not frappe.db.exists("DocType", "Mandi Lot"):
        print("Mandi Lot DocType not found — skipping.")
        return

    lot = frappe.get_doc("DocType", "Mandi Lot")
    existing = {f.fieldname for f in lot.fields}

    new_fields = [
        {
            "fieldname": "net_qty",
            "fieldtype": "Float",
            "label": "Net Qty (After Less)",
            "read_only": 1,
            "precision": "3",
            "description": "qty − deduction (less_percent or less_units)",
        },
        {
            "fieldname": "net_amount",
            "fieldtype": "Currency",
            "label": "Net Amount",
            "read_only": 1,
            "description": "net_qty × sale_price (what buyer pays for this lot)",
        },
        {
            "fieldname": "commission_amount",
            "fieldtype": "Currency",
            "label": "Commission Amount",
            "read_only": 1,
            "description": "net_amount × commission_percent / 100",
        },
    ]

    changed = False
    for field_def in new_fields:
        if field_def["fieldname"] not in existing:
            lot.append("fields", field_def)
            changed = True
            print(f"  + Added field: {field_def['fieldname']}")

    if changed:
        lot.save()
        print("✓ Mandi Lot DocType updated.")
    else:
        print("  (no changes needed for Mandi Lot)")
