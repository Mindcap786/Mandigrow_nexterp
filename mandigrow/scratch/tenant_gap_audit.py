"""
COMPLETE TENANT ONBOARDING GAP AUDIT
======================================
Checks every resource a new tenant needs and reports what's missing.
Run this to get the full picture before writing any fix.
"""
import frappe

def run():
    print("=" * 70)
    print("MULTI-TENANT ONBOARDING GAP AUDIT")
    print("=" * 70)

    orgs = frappe.get_all("Mandi Organization",
        fields=["name", "organization_name", "erp_company"],
        order_by="creation desc")

    for org in orgs:
        oid = org.name
        oname = org.organization_name
        company = org.erp_company
        print(f"\n{'='*70}")
        print(f"ORG: {oid} | {oname} | Company: {company}")
        print(f"{'='*70}")

        # 1. Frappe Company
        company_ok = company and frappe.db.exists("Company", company)
        print(f"  [{'OK' if company_ok else 'MISS'}] Frappe Company: {company}")

        if company_ok:
            abbr = frappe.db.get_value("Company", company, "abbr")
            cost_center = frappe.db.get_value("Company", company, "cost_center")
            print(f"         Abbreviation : {abbr}")
            print(f"         Cost Center  : {cost_center}")
            cc_exists = frappe.db.exists("Cost Center", cost_center) if cost_center else False
            print(f"         CC exists    : {cc_exists}")

            # 2. Chart of Accounts
            print(f"\n  --- Chart of Accounts ---")
            needed_accounts = {
                "Cash":             "Cash",
                "Bank Account":     "Bank",
                "Stock In Hand":    "Stock",
                "Creditors":        "Payable",
                "Debtors":          "Receivable",
                "Commission Income":"Income Account",
            }
            for acc_name, acc_type in needed_accounts.items():
                exists_by_name = frappe.db.exists("Account",
                    {"account_name": acc_name, "company": company, "is_group": 0})
                exists_by_type = frappe.db.get_value("Account",
                    {"company": company, "account_type": acc_type, "is_group": 0}, "name")
                status = "OK" if (exists_by_name or exists_by_type) else "MISS"
                actual = exists_by_name or exists_by_type or "NOT FOUND"
                print(f"  [{status}] {acc_name:25s} -> {actual}")

        # 3. Storage Locations
        print(f"\n  --- Storage Locations ---")
        locs = frappe.get_all("Mandi Storage Location",
            filters={"organization_id": oid, "is_active": 1},
            fields=["name", "location_name"])
        status = "OK" if locs else "MISS"
        print(f"  [{status}] Storage Locations: {[l.location_name for l in locs]}")

        # 4. Supplier Group
        print(f"\n  --- Supplier/Customer Groups ---")
        sup_groups = frappe.get_all("Supplier Group", fields=["name"])
        print(f"  [{'OK' if sup_groups else 'MISS'}] Supplier Groups: {[g.name for g in sup_groups]}")
        cust_groups = frappe.get_all("Customer Group", fields=["name"])
        print(f"  [{'OK' if cust_groups else 'MISS'}] Customer Groups: {[g.name for g in cust_groups]}")

        # 5. Suppliers for this org's contacts
        print(f"\n  --- Farmer Suppliers ---")
        contacts = frappe.get_all("Mandi Contact",
            filters={"organization_id": oid},
            fields=["name", "full_name"])
        for c in contacts:
            sup = frappe.db.get_value("Supplier", {"supplier_name": c.full_name}, "name")
            status = "OK" if sup else "MISS"
            print(f"  [{status}] Contact '{c.full_name}' -> Supplier: {sup}")

        # 6. Customers for this org's buyers
        print(f"\n  --- Buyer Customers ---")
        buyers = frappe.get_all("Mandi Contact",
            filters={"organization_id": oid},
            fields=["name", "full_name"])
        for b in buyers[:5]:  # limit output
            cust = frappe.db.get_value("Customer", {"customer_name": b.full_name}, "name")
            # buyers and sellers can overlap in contacts
        print(f"  (checked via Mandi Sale buyer references)")
        
        # Check actual sale buyers
        sales = frappe.get_all("Mandi Sale",
            filters={"organization_id": oid},
            fields=["buyerid"], limit=10)
        buyer_ids = list({s.buyerid for s in sales if s.buyerid})
        for bid in buyer_ids[:5]:
            buyer_name = frappe.db.get_value("Mandi Contact", bid, "full_name")
            if buyer_name:
                cust = frappe.db.get_value("Customer", {"customer_name": buyer_name}, "name")
                status = "OK" if cust else "MISS"
                print(f"  [{status}] Buyer '{buyer_name}' -> Customer: {cust}")

        # 7. Arrivals with 0 GL entries
        print(f"\n  --- Arrivals GL Status ---")
        arrivals = frappe.get_all("Mandi Arrival",
            filters={"organization_id": oid},
            fields=["name", "contact_bill_no", "status"])
        total = len(arrivals)
        zero_gl = sum(1 for a in arrivals
            if frappe.db.count("GL Entry", {"against_voucher": a.name}) == 0)
        print(f"  [{'OK' if zero_gl==0 else 'MISS'}] Arrivals: {total} total, {zero_gl} with 0 GL entries")

        # 8. Sales with 0 GL entries
        print(f"\n  --- Sales GL Status ---")
        sales_all = frappe.get_all("Mandi Sale",
            filters={"organization_id": oid},
            fields=["name"])
        total_sales = len(sales_all)
        zero_gl_sales = sum(1 for s in sales_all
            if frappe.db.count("GL Entry", {"against_voucher": s.name}) == 0)
        print(f"  [{'OK' if zero_gl_sales==0 else 'MISS'}] Sales: {total_sales} total, {zero_gl_sales} with 0 GL entries")

    print(f"\n{'='*70}")
    print("AUDIT COMPLETE")
    print(f"{'='*70}")
