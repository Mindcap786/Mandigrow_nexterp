"""
FORENSIC AUDIT: New Mandi - Empty Ledger/Daybook Investigation
"""
import frappe

def run():
    print("=" * 60)
    print("NEW MANDI FORENSIC AUDIT")
    print("=" * 60)

    # 1. List ALL organizations and their companies
    print("\n[1] All Mandi Organizations:")
    orgs = frappe.get_all("Mandi Organization",
        fields=["name", "organization_name", "erp_company", "creation"],
        order_by="creation desc")
    for o in orgs:
        print(f"  ORG:{o.name} | Name:{o.organization_name} | Company:{o.erp_company} | Created:{str(o.creation)[:10]}")

    # 2. Find the newest org (likely the one with issues)
    if not orgs:
        print("NO ORGANIZATIONS FOUND!")
        return

    newest_org = orgs[0]
    org_id = newest_org.name
    company = newest_org.erp_company
    print(f"\n[2] Newest org: {org_id} | Company: {company}")

    # 3. All arrivals for newest org
    arrivals = frappe.get_all("Mandi Arrival",
        filters={"organization_id": org_id},
        fields=["name", "contact_bill_no", "party_id", "net_payable_farmer",
                "advance", "arrival_type", "advance_payment_mode", "status"],
        order_by="creation desc")
    print(f"\n[3] Arrivals for {org_id} ({len(arrivals)} total):")
    for a in arrivals:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": a.name})
        print(f"  {a.name} | Bill#{a.contact_bill_no} | mode:{a.advance_payment_mode} | "
              f"net_pay:{a.net_payable_farmer} | advance:{a.advance} | GLs:{gl_count} | status:{a.status}")

    # 4. Check if company exists in Frappe
    company_exists = frappe.db.exists("Company", company)
    print(f"\n[4] Company '{company}' exists in Frappe: {company_exists}")

    if company_exists:
        # 5. Check chart of accounts
        cash_acc = frappe.db.get_value("Account",
            {"account_type": "Cash", "company": company, "is_group": 0}, "name")
        creditors_acc = frappe.db.get_value("Account",
            {"account_type": "Payable", "company": company, "is_group": 0}, "name")
        stock_acc = frappe.db.get_value("Account",
            {"account_type": "Stock", "company": company, "is_group": 0}, "name")
        print(f"\n[5] Chart of Accounts for '{company}':")
        print(f"  Cash account: {cash_acc}")
        print(f"  Creditors account: {creditors_acc}")
        print(f"  Stock account: {stock_acc}")

        # 6. Supplier groups available
        sup_groups = frappe.get_all("Supplier Group", fields=["name"])
        print(f"\n[6] Available Supplier Groups: {[g.name for g in sup_groups]}")

    # 7. For each arrival - check why posting failed
    print(f"\n[7] Detailed failure analysis per arrival:")
    for a in arrivals:
        gl_count = frappe.db.count("GL Entry", {"against_voucher": a.name})
        if gl_count > 0:
            print(f"  {a.name}: OK ({gl_count} GL rows)")
            continue

        print(f"\n  FAILED: {a.name} (Bill#{a.contact_bill_no})")

        # Check party/supplier
        if a.party_id:
            contact = frappe.db.get_value("Mandi Contact", a.party_id,
                ["full_name", "organization_id"], as_dict=True)
            print(f"    Contact: {contact}")

            supplier = frappe.db.get_value("Supplier", {"supplier_name": contact.full_name}, "name") if contact else None
            print(f"    Supplier record: {supplier}")

        # Check if any JEs were attempted
        je_count = frappe.db.count("Journal Entry",
            [["user_remark", "like", f"%{a.name}%"]])
        print(f"    Journal Entries with this arrival in remark: {je_count}")

        # Check Frappe error log
        errors = frappe.get_all("Error Log",
            filters=[["error", "like", f"%{a.name}%"]],
            fields=["name", "error", "creation"],
            order_by="creation desc", limit=3)
        if errors:
            print(f"    Error logs found: {len(errors)}")
            for e in errors:
                print(f"      {e.name}: {e.error[:200]}")
        else:
            print(f"    No error logs found for this arrival")

    # 8. Check ALL error logs from last hour mentioning post_arrival_ledger
    print(f"\n[8] Recent automation errors (last 2 hours):")
    recent_errors = frappe.get_all("Error Log",
        filters=[
            ["error", "like", "%post_arrival_ledger%"],
        ],
        fields=["name", "creation", "error"],
        order_by="creation desc", limit=5)
    for e in recent_errors:
        print(f"  {e.name} at {e.creation}:")
        print(f"  {e.error[:300]}")
        print()

    # 9. Check if the cost center is set for the company
    if company_exists:
        cost_center = frappe.db.get_value("Company", company, "cost_center")
        print(f"\n[9] Cost Center for '{company}': {cost_center}")
        if cost_center:
            cc_exists = frappe.db.exists("Cost Center", cost_center)
            print(f"    Cost Center exists: {cc_exists}")
