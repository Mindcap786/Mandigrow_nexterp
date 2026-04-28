import frappe

def execute():
    company = "ssb"
    
    print("=" * 100)
    print(f"RCA: GL Entry Audit for company={company}")
    print("=" * 100)
    
    # 1. All GL entries
    gls = frappe.db.sql("""
        SELECT name, posting_date, account, party_type, party, debit, credit, 
               voucher_type, voucher_no, remarks
        FROM `tabGL Entry`
        WHERE company = %s AND is_cancelled = 0
        ORDER BY posting_date, creation
    """, (company,), as_dict=True)
    
    print(f"\n1. Total GL entries for {company}: {len(gls)}")
    for g in gls:
        print(f"  {g.posting_date} | {str(g.account)[:40]:40s} | pt={str(g.party_type or ''):10s} | p={str(g.party or ''):20s} | Dr={g.debit:>10.2f} | Cr={g.credit:>10.2f} | {g.voucher_no}")
    
    # 2. Check contacts for org ORG-00002
    print(f"\n2. Mandi Contacts for ORG-00002:")
    contacts = frappe.get_all("Mandi Contact", 
        filters={"organization_id": "ORG-00002"},
        fields=["name", "full_name", "contact_type", "supplier", "customer"])
    for c in contacts:
        print(f"  id={c.name} | name={c.full_name} | type={c.contact_type} | supplier={c.supplier} | customer={c.customer}")
    
    # 3. Check how financial summary computes payables
    print(f"\n3. Account balances (Dr-Cr) by account:")
    balances = frappe.db.sql("""
        SELECT account, 
               SUM(debit) as total_dr, 
               SUM(credit) as total_cr,
               SUM(debit) - SUM(credit) as balance
        FROM `tabGL Entry`
        WHERE company = %s AND is_cancelled = 0
        GROUP BY account
        ORDER BY account
    """, (company,), as_dict=True)
    for b in balances:
        print(f"  {str(b.account):40s} | Dr={b.total_dr:>10.2f} | Cr={b.total_cr:>10.2f} | Bal={b.balance:>10.2f}")
    
    # 4. Party-wise balances
    print(f"\n4. Party-wise balances:")
    party_bals = frappe.db.sql("""
        SELECT party_type, party, 
               SUM(debit) as total_dr, 
               SUM(credit) as total_cr,
               SUM(debit) - SUM(credit) as balance
        FROM `tabGL Entry`
        WHERE company = %s AND is_cancelled = 0 AND party IS NOT NULL AND party != ''
        GROUP BY party_type, party
        ORDER BY party_type, party
    """, (company,), as_dict=True)
    for p in party_bals:
        print(f"  {str(p.party_type):10s} | {str(p.party):25s} | Dr={p.total_dr:>10.2f} | Cr={p.total_cr:>10.2f} | Bal={p.balance:>10.2f}")

    # 5. Check the Mandi Arrival for afzal
    print(f"\n5. Mandi Arrivals for ORG-00002:")
    arrivals = frappe.get_all("Mandi Arrival",
        filters={"organization_id": "ORG-00002"},
        fields=["name", "party_id", "arrival_date", "total_realized", "total_commission", 
                "net_payable_farmer", "advance", "docstatus", "status"])
    for a in arrivals:
        contact_name = frappe.db.get_value("Mandi Contact", a.party_id, "full_name") if a.party_id else "?"
        print(f"  {a.name} | party={a.party_id} ({contact_name}) | date={a.arrival_date} | realized={a.total_realized} | commission={a.total_commission} | net_payable={a.net_payable_farmer} | advance={a.advance} | status={a.status} | docstatus={a.docstatus}")
    
    # 6. Check what accounts the Creditors/Payable use
    print(f"\n6. Creditors Payable accounts for company={company}:")
    payable_accs = frappe.get_all("Account", 
        filters={"company": company, "account_type": "Payable"},
        fields=["name", "account_name", "root_type", "account_type"])
    for acc in payable_accs:
        print(f"  {acc.name} | {acc.account_name} | root_type={acc.root_type}")
    
    receivable_accs = frappe.get_all("Account",
        filters={"company": company, "account_type": "Receivable"},
        fields=["name", "account_name", "root_type"])
    for acc in receivable_accs:
        print(f"  {acc.name} | {acc.account_name} | root_type={acc.root_type}")
