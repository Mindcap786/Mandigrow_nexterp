"""
NOOR MANDI COMPLETE REPAIR
============================
1. Create Frappe Company for Noor Mandi
2. Link it to ORG-00003
3. Delete the 27 orphan GL entries
4. Re-post the arrival correctly
"""
import frappe
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'apps', 'mandigrow'))
from mandigrow.mandigrow.logic.automation import post_arrival_ledger


def _get_or_create_company(org_id, org_name):
    """Find or create a Frappe Company for the given org."""
    # Normalize company name (use org name)
    company_name = org_name.strip()

    # Check if already exists
    if frappe.db.exists("Company", company_name):
        print(f"  Company '{company_name}' already exists")
        return company_name

    # Find a template company to copy chart of accounts from
    # Use SSB as the template (it works)
    template_company = frappe.db.get_value("Mandi Organization", "ORG-00002", "erp_company")
    print(f"  Template company: {template_company}")

    # Generate abbreviation from name
    words = company_name.split()
    abbr = "".join(w[0].upper() for w in words if w)[:5]
    
    # Check abbr doesn't conflict
    if frappe.db.exists("Company", {"abbr": abbr}):
        abbr = abbr + "3"

    print(f"  Creating company: {company_name} (abbr: {abbr})")

    company = frappe.get_doc({
        "doctype": "Company",
        "company_name": company_name,
        "abbr": abbr,
        "default_currency": "INR",
        "country": "India",
        "chart_of_accounts": "Standard",
    })
    company.insert(ignore_permissions=True)
    frappe.db.commit()
    print(f"  Company created: {company.name}")
    return company.name


def run():
    print("=" * 60)
    print("NOOR MANDI REPAIR")
    print("=" * 60)

    org_id = "ORG-00003"
    arr_name = "ARR-ORG00003-2026-00001"

    # Step 1: Get org info
    org = frappe.get_doc("Mandi Organization", org_id)
    print(f"\n[1] Org: {org.name} | Name: {org.organization_name} | Company: {org.erp_company}")

    # Step 2: Create company if missing
    company = org.erp_company
    if not company or not frappe.db.exists("Company", company):
        print("\n[2] Company missing — creating...")
        company = _get_or_create_company(org_id, org.organization_name or "Noor Mandi")
        
        # Link company to org
        frappe.db.set_value("Mandi Organization", org_id, "erp_company", company)
        frappe.db.commit()
        print(f"  Linked company '{company}' to {org_id}")
    else:
        print(f"\n[2] Company already set: {company}")

    # Step 3: Delete ALL orphan GL entries and JEs for this arrival
    print(f"\n[3] Cleaning up orphan GL entries for {arr_name}...")

    # Find all JEs linked to this arrival
    orphan_jes_by_gl = frappe.db.get_all("GL Entry",
        filters={"against_voucher": arr_name},
        fields=["voucher_no"], distinct=True)
    orphan_je_names = [j.voucher_no for j in orphan_jes_by_gl]

    orphan_jes_by_remark = frappe.get_all("Journal Entry",
        filters=[["user_remark", "like", f"%{arr_name}%"]],
        fields=["name"])
    for j in orphan_jes_by_remark:
        if j.name not in orphan_je_names:
            orphan_je_names.append(j.name)

    print(f"  Found {len(orphan_je_names)} JEs to delete: {orphan_je_names}")

    for je_name in orphan_je_names:
        frappe.db.delete("GL Entry", {"voucher_no": je_name})
        frappe.db.delete("Journal Entry Account", {"parent": je_name})
        frappe.db.delete("Journal Entry", {"name": je_name})
        print(f"  Deleted: {je_name}")

    frappe.db.commit()

    # Verify cleanup
    remaining = frappe.db.count("GL Entry", {"against_voucher": arr_name})
    print(f"  Remaining GL entries after cleanup: {remaining}")

    # Step 4: Ensure cost center exists
    print(f"\n[4] Verifying cost center for '{company}'...")
    cost_center = frappe.db.get_value("Company", company, "cost_center")
    print(f"  Cost center: {cost_center}")
    if cost_center:
        cc_exists = frappe.db.exists("Cost Center", cost_center)
        print(f"  Cost center exists: {cc_exists}")

    # Step 5: Check supplier groups
    print(f"\n[5] Supplier groups:")
    groups = frappe.get_all("Supplier Group", fields=["name"])
    print(f"  Available: {[g.name for g in groups]}")

    # Step 6: Ensure supplier exists for the farmer
    arr_doc = frappe.get_doc("Mandi Arrival", arr_name)
    print(f"\n[6] Arrival: {arr_name} | party_id: {arr_doc.party_id}")

    if arr_doc.party_id:
        contact = frappe.db.get_value("Mandi Contact", arr_doc.party_id,
            ["full_name"], as_dict=True)
        print(f"  Farmer: {contact.full_name if contact else 'NOT FOUND'}")

        if contact:
            existing_supplier = frappe.db.get_value("Supplier",
                {"supplier_name": contact.full_name}, "name")
            print(f"  Supplier record: {existing_supplier}")

            if not existing_supplier:
                group_name = groups[0].name if groups else "All Supplier Groups"
                supplier = frappe.get_doc({
                    "doctype": "Supplier",
                    "supplier_name": contact.full_name,
                    "supplier_group": group_name,
                    "supplier_type": "Individual",
                })
                supplier.insert(ignore_permissions=True)
                frappe.db.commit()
                print(f"  Created supplier: {supplier.name}")

    # Step 7: Re-post the ledger
    print(f"\n[7] Re-posting ledger for {arr_name}...")

    # Reload doc after company was set
    arr_doc = frappe.get_doc("Mandi Arrival", arr_name)
    print(f"  Arrival type: {arr_doc.arrival_type}")
    print(f"  Net payable: {arr_doc.net_payable_farmer}")
    print(f"  Advance: {arr_doc.advance}")
    print(f"  Payment mode: {arr_doc.advance_payment_mode}")

    try:
        post_arrival_ledger(arr_doc)
        frappe.db.commit()
        new_count = frappe.db.count("GL Entry", {"against_voucher": arr_name})
        print(f"  SUCCESS — {new_count} GL entries created")
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        frappe.db.rollback()

    # Step 8: Final verification
    print(f"\n[8] FINAL VERIFICATION:")
    final_gl = frappe.get_all("GL Entry",
        filters={"against_voucher": arr_name},
        fields=["voucher_no", "account", "debit", "credit"])
    print(f"  Total GL entries: {len(final_gl)}")
    for g in final_gl:
        print(f"  {g.voucher_no} | {g.account} | Dr:{g.debit} | Cr:{g.credit}")
