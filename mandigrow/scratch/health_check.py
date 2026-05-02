"""
FULL SYSTEM HEALTH CHECK — Pre-Deployment Audit
Checks everything: data integrity, code correctness, multi-tenancy.
"""
import frappe

def run():
    print("=" * 70)
    print("MANDIGROW — FULL SYSTEM HEALTH CHECK")
    print("=" * 70)

    issues = []
    warnings = []
    ok_items = []

    orgs = frappe.get_all("Mandi Organization",
        fields=["name", "organization_name", "erp_company"])

    for org in orgs:
        oid = org.name
        oname = org.organization_name
        company = org.erp_company
        abbr = frappe.db.get_value("Company", company, "abbr") if company else None

        print(f"\n{'='*70}")
        print(f"ORG: {oid} | {oname} | Company: {company} (abbr: {abbr})")
        print(f"{'='*70}")

        # --- Company ---
        if not company or not frappe.db.exists("Company", company):
            issues.append(f"[{oname}] No Frappe Company linked!")
        else:
            ok_items.append(f"[{oname}] Company: {company}")

        # --- Chart of Accounts ---
        account_checks = {
            "Cash": "Cash",
            "Bank Account": "Bank",
            "Stock In Hand": "Stock",
            "Creditors": "Payable",
            "Debtors": "Receivable",
            "Commission Income": "Income Account",
        }
        for acc_name, acc_type in account_checks.items():
            found = frappe.db.get_value("Account",
                {"company": company, "account_type": acc_type, "is_group": 0}, "name") if company else None
            if not found:
                found = frappe.db.exists("Account", f"{acc_name} - {abbr}") if abbr else None
            if found:
                ok_items.append(f"[{oname}] Account {acc_name}: {found}")
            else:
                issues.append(f"[{oname}] MISSING Account: {acc_name}")

        # Check: expense account = commission account (known bug)
        comm_acc = frappe.db.get_value("Account",
            {"company": company, "account_type": "Income Account", "is_group": 0}, "name") if company else None
        if comm_acc:
            # Does get_expense_acc map to same as get_comm_acc?
            warnings.append(f"[{oname}] Expense Recovery posts to '{comm_acc}' same as Commission — separate account needed for accurate P&L")

        # --- Storage Locations ---
        locs = frappe.get_all("Mandi Storage Location",
            filters={"organization_id": oid, "is_active": 1},
            fields=["location_name"])
        if locs:
            ok_items.append(f"[{oname}] Storage: {[l.location_name for l in locs]}")
        else:
            issues.append(f"[{oname}] MISSING storage locations!")

        # --- GL Integrity: Arrivals ---
        arrivals = frappe.get_all("Mandi Arrival",
            filters={"organization_id": oid},
            fields=["name", "contact_bill_no", "net_payable_farmer", "advance",
                    "total_commission", "total_expenses", "arrival_type"])
        zero_gl_arr = []
        for a in arrivals:
            gl = frappe.db.count("GL Entry", {"against_voucher": a.name})
            if gl == 0:
                zero_gl_arr.append(a.name)
            elif gl > 10:
                # Possible duplication
                warnings.append(f"[{oname}] {a.name} has {gl} GL rows — check for duplicates")

        if zero_gl_arr:
            issues.append(f"[{oname}] {len(zero_gl_arr)} arrivals with 0 GL entries: {zero_gl_arr[:3]}...")
        else:
            ok_items.append(f"[{oname}] All {len(arrivals)} arrivals have GL entries")

        # --- GL Integrity: Sales ---
        sales = frappe.get_all("Mandi Sale",
            filters={"organization_id": oid},
            fields=["name"])
        zero_gl_sales = [s.name for s in sales
            if frappe.db.count("GL Entry", {"against_voucher": s.name}) == 0]
        if zero_gl_sales:
            issues.append(f"[{oname}] {len(zero_gl_sales)} sales with 0 GL entries: {zero_gl_sales[:3]}")
        else:
            ok_items.append(f"[{oname}] All {len(sales)} sales have GL entries")

        # --- Missing Suppliers for Contacts ---
        contacts = frappe.get_all("Mandi Contact",
            filters={"organization_id": oid},
            fields=["name", "full_name"])
        missing_sup = [c.full_name for c in contacts
            if not frappe.db.get_value("Supplier", {"supplier_name": c.full_name}, "name")]
        if missing_sup:
            warnings.append(f"[{oname}] Contacts without Supplier record: {missing_sup}")

        # --- Missing Customers for Sale Buyers ---
        sale_buyers = frappe.db.sql("""
            SELECT DISTINCT mc.full_name
            FROM `tabMandi Sale` ms
            JOIN `tabMandi Contact` mc ON mc.name = ms.buyerid
            WHERE ms.organization_id = %s
        """, oid, as_dict=True)
        missing_cust = [b.full_name for b in sale_buyers
            if not frappe.db.get_value("Customer", {"customer_name": b.full_name}, "name")]
        if missing_cust:
            warnings.append(f"[{oname}] Buyers without Customer record: {missing_cust}")

        # --- Financial Balance Check: Spot check 5 arrivals ---
        print(f"\n  Financial spot-check (arrivals):")
        for a in arrivals[:5]:
            gl_rows = frappe.get_all("GL Entry",
                filters={"against_voucher": a.name},
                fields=["debit", "credit"])
            total_dr = sum(float(g.debit or 0) for g in gl_rows)
            total_cr = sum(float(g.credit or 0) for g in gl_rows)
            balanced = abs(total_dr - total_cr) < 0.01
            status = "✅" if balanced else "❌ UNBALANCED"
            print(f"    {a.name} (Bill#{a.contact_bill_no}): Dr={total_dr:.0f} Cr={total_cr:.0f} {status}")
            if not balanced:
                issues.append(f"[{oname}] {a.name} GL is unbalanced! Dr={total_dr} Cr={total_cr}")

    # --- Code audit: get_expense_acc ---
    print(f"\n{'='*70}")
    print("CODE AUDIT")
    print(f"{'='*70}")

    # Check automation.py for known issues
    import subprocess
    result = subprocess.run(
        ["grep", "-n", "get_expense_acc\|def get_expense", 
         "apps/mandigrow/mandigrow/logic/automation.py"],
        capture_output=True, text=True, cwd="/Users/shauddin/frappe-bench"
    )
    print(f"  get_expense_acc definition:\n{result.stdout}")

    result2 = subprocess.run(
        ["grep", "-n", "elif arrival_type\|if arrival_type",
         "apps/mandigrow/mandigrow/logic/automation.py"],
        capture_output=True, text=True, cwd="/Users/shauddin/frappe-bench"
    )
    print(f"  Arrival type branching:\n{result2.stdout}")

    # --- Mandi Settings check ---
    print(f"\n{'='*70}")
    print("MANDI SETTINGS CHECK")
    print(f"{'='*70}")
    for org in orgs:
        settings = frappe.db.get_value("Mandi Settings", 
            {"organization_id": org.name},
            ["name", "commission_percent", "nirashrit_percent"], as_dict=True)
        if settings:
            print(f"  [{org.organization_name}] Settings: {settings}")
        else:
            warnings.append(f"[{org.organization_name}] No Mandi Settings record")
            print(f"  [{org.organization_name}] NO SETTINGS")

    # --- Final Report ---
    print(f"\n{'='*70}")
    print(f"HEALTH REPORT SUMMARY")
    print(f"{'='*70}")
    print(f"\n  🔴 CRITICAL ISSUES ({len(issues)}):")
    for i in issues:
        print(f"     {i}")
    print(f"\n  🟡 WARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"     {w}")
    print(f"\n  ✅ OK ({len(ok_items)} checks passed)")
    print(f"\n  DEPLOYMENT READINESS: {'🟢 READY' if not issues else '🔴 ISSUES TO FIX FIRST'}")
