import frappe

def run():
    print("=" * 60)
    print("FORENSIC AUDIT - SSB MANDI")
    print("=" * 60)

    # 1. Find shauddin contact
    contacts = frappe.get_all("Mandi Contact",
        filters={"full_name": ["like", "%shaudd%"]},
        fields=["name", "full_name"])
    print(f"\n[1] Shauddin contact: {contacts}")

    if not contacts:
        print("No contact found!")
        return

    cid = contacts[0].name

    # 2. All arrivals for shauddin
    arrivals = frappe.get_all("Mandi Arrival",
        filters={"party_id": cid},
        fields=["name", "net_payable_farmer", "advance", "status", "arrival_type", "organization_id"])
    print(f"\n[2] All arrivals for shauddin: {arrivals}")

    # 3. All Journal Entries linked to these arrivals via GL Entry against_voucher
    for arr in arrivals:
        gl_entries = frappe.get_all("GL Entry",
            filters={"against_voucher_type": "Mandi Arrival", "against_voucher": arr.name},
            fields=["name", "voucher_no", "account", "debit", "credit", "party"])
        print(f"\n[3] GL Entries (against_voucher) for {arr.name}:")
        for g in gl_entries:
            print(f"     JE:{g.voucher_no} | Acc:{g.account} | Dr:{g.debit} | Cr:{g.credit} | Party:{g.party}")

        # Also check JEs that have this arrival in user_remark
        je_list = frappe.get_all("Journal Entry",
            filters=[["user_remark", "like", f"%{arr.name}%"]],
            fields=["name", "docstatus", "posting_date", "user_remark"])
        print(f"   JEs with {arr.name} in remark: {[(j.name, j.docstatus) for j in je_list]}")

    # 4. Check Bill #5 JE count
    je_bill5 = frappe.get_all("Journal Entry",
        filters=[["user_remark", "like", "%Bill #5%"]],
        fields=["name", "docstatus", "posting_date"])
    print(f"\n[4] JEs for Bill #5 ({len(je_bill5)} total):")
    for j in je_bill5:
        print(f"     {j.name} | status:{j.docstatus} | date:{j.posting_date}")

    # 5. Check Bill #11 JE count
    je_bill11 = frappe.get_all("Journal Entry",
        filters=[["user_remark", "like", "%Bill #11%"]],
        fields=["name", "docstatus", "posting_date"])
    print(f"\n[5] JEs for Bill #11 ({len(je_bill11)} total):")
    for j in je_bill11:
        print(f"     {j.name} | status:{j.docstatus} | date:{j.posting_date}")

    # 6. Supplier check for shauddin
    supplier = frappe.db.get_value("Supplier", {"supplier_name": "shauddin"}, "name")
    print(f"\n[6] Supplier record for shauddin: {supplier}")
    if supplier:
        gl_party = frappe.get_all("GL Entry",
            filters={"party": supplier, "party_type": "Supplier"},
            fields=["voucher_no", "account", "debit", "credit", "posting_date"],
            order_by="posting_date asc, creation asc")
        print(f"   GL Entries for supplier: {len(gl_party)}")
        for g in gl_party:
            print(f"     {g.voucher_no} | {g.account} | Dr:{g.debit} | Cr:{g.credit}")

    # 7. Count ALL GL entries per arrival
    print("\n[7] Total GL entries per Mandi Arrival for SSB:")
    all_arrivals = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "contact_bill_no"])
    for a in all_arrivals:
        gl_count = frappe.db.count("GL Entry", 
            {"against_voucher_type": "Mandi Arrival", "against_voucher": a.name})
        je_count = frappe.db.count("Journal Entry",
            [["user_remark", "like", f"%{a.name}%"]])
        if gl_count > 0 or je_count > 0:
            print(f"   {a.name} (Bill#{a.contact_bill_no}): {gl_count} GL rows, {je_count} JEs")
