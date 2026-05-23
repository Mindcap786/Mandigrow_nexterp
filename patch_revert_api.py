import re

with open('mandigrow/api.py', 'r') as f:
    content = f.read()

target = """
        party_ids = list(set([r["party_id"] for r in issues if r.get("party_id")]))
        erp_status_map = {}
        if party_ids:
            contacts = frappe.db.get_all("Mandi Contact", filters={"name": ("in", party_ids)}, fields=["name", "customer", "supplier"])
            for c in contacts:
                is_erp = bool(c.get("customer") or c.get("supplier") or frappe.db.exists("Customer", c["name"]) or frappe.db.exists("Supplier", c["name"]))
                erp_status_map[c["name"]] = is_erp

        # Enrich with overdue flag and value
        result = []
        for row in issues:
            is_overdue = bool(
                row.get("expected_return_date") and
                str(row["expected_return_date"]) < today and
                int(row.get("qty_balance") or 0) > 0
            )
            val = int(row.get("qty_balance") or 0) * float(row.get("rate") or 0)
            result.append({
                **{k: row[k] for k in row},
                "is_overdue": is_overdue,
                "outstanding_value": val,
                "is_erp_registered": erp_status_map.get(row.get("party_id"), False)
            })
"""

replacement = """
        # Enrich with overdue flag and value
        result = []
        for row in issues:
            is_overdue = bool(
                row.get("expected_return_date") and
                str(row["expected_return_date"]) < today and
                int(row.get("qty_balance") or 0) > 0
            )
            val = int(row.get("qty_balance") or 0) * float(row.get("rate") or 0)
            result.append({
                **{k: row[k] for k in row},
                "is_overdue": is_overdue,
                "outstanding_value": val,
            })
"""

content = content.replace(target.strip(), replacement.strip())

with open('mandigrow/api.py', 'w') as f:
    f.write(content)

